import {SapphireStorage} from '../../helper/sapphire-storage';
import {IPrefilter} from '../../collection/prefilter/iprefilter';
import {BehaviorSubject, combineLatest, Observable, of} from 'rxjs';
import {CollectionHelper} from '../../helper/collection-helper';
import {filter, map, switchMap} from 'rxjs/operators';
import {InfoResponse} from '../../command/info/info-response';
import {CollectionCommandBase} from '../../command/collection-command-base';
import {ConnectionManager} from '../../connection/connection-manager';
import {ValidatedResponseBase} from '../../command/validated-response-base';
import {ConnectionState} from '../../models/types';
import {ExecuteCommandsCommand} from '../../command/execute-commands/execute-commands-command';
import {ExecuteCommandsResponse} from '../../command/execute-commands/execute-commands-response';

const CollectionStoragePrefix = 'sapphiredb.collection.';
const CollectionInformationStoragePrefix = 'sapphiredb.collectioninformation.';

export class OfflineManager {
  private disableUpdate = false;
  private changeStorage$: BehaviorSubject<{ [collectionKey: string]: CollectionCommandBase[] }> =
    new BehaviorSubject<{ [p: string]: CollectionCommandBase[] }>({});

  constructor(private storage: SapphireStorage, private connectionManager: ConnectionManager) {
    combineLatest([this.connectionManager.connection.connectionInformation$, this.changeStorage$])
      .pipe(
        filter(([information]) => !this.disableUpdate && information.readyState === ConnectionState.connected),
        switchMap(([, changeStorage]) => {
          const allChanges: CollectionCommandBase[] = Object.keys(changeStorage)
            .map(key => changeStorage[key])
            .reduce((a, b) => a.concat(b), []);

          if (allChanges.length === 0) {
            return of(null);
          }

          return this.connectionManager.sendCommand(new ExecuteCommandsCommand(allChanges));
        })
      ).subscribe((response: ExecuteCommandsResponse|null) => {
        this.disableUpdate = true;
        this.changeStorage$.next({});
        this.disableUpdate = false;
        console.log(response);
      });
    // TODO: Load stored changes that are not yet transferred
  }

  getCollectionInformation(contextName: string, collectionName: string): Observable<InfoResponse> {
    const offlineKey = `${CollectionInformationStoragePrefix}${contextName}${collectionName}`;
    return this.storage.get(offlineKey).pipe(
      map(v => JSON.parse(v))
    );
  }

  setCollectionInformation(contextName: string, collectionName: string, collectionInformation: InfoResponse) {
    const offlineKey = `${CollectionInformationStoragePrefix}${contextName}${collectionName}`;
    this.storage.set(offlineKey, JSON.stringify(collectionInformation));
  }

  getState(contextName: string, collectionName: string, prefilters: IPrefilter<any, any>[]): Observable<any> {
    const offlineKey = `${CollectionStoragePrefix}${contextName}.${collectionName}.${CollectionHelper.getPrefilterHash(prefilters)}`;
    return this.storage.get(offlineKey).pipe(
      map(v => JSON.parse(v))
    );
  }

  setState(contextName: string, collectionName: string, prefilters: IPrefilter<any, any>[], state: any) {
    const offlineKey = `${CollectionStoragePrefix}${contextName}.${collectionName}.${CollectionHelper.getPrefilterHash(prefilters)}`;
    return this.storage.set(offlineKey, JSON.stringify(state));
  }

  sendCommand(command: CollectionCommandBase): Observable<any> {
    const connectionState: ConnectionState = this.connectionManager.connection.connectionInformation$.value.readyState;

    if (connectionState === ConnectionState.connected) {
      return <Observable<ValidatedResponseBase>>this.connectionManager.sendCommand(command);
    }

    const collectionKey = `${command.contextName}.${command.collectionName}`;
    const changeStorageValue = this.changeStorage$.value;

    if (!changeStorageValue[collectionKey]) {
      changeStorageValue[collectionKey] = [];
    }

    const collectionChanges = changeStorageValue[collectionKey];
    collectionChanges.push(command);
    this.changeStorage$.next(changeStorageValue);

    return of(null);
  }

  getInterpolatedCollectionValue(contextName: string, collectionName: string, prefilters: IPrefilter<any, any>[], state: any[],
                                 info$: Observable<InfoResponse>): Observable<any> {
    const collectionKey = `${contextName}.${collectionName}`;

    return this.changeStorage$.pipe(
      switchMap((changeStorage) => {
        if (CollectionHelper.hasAfterQueryPrefilter(prefilters)) {
          return of(state);
        }

        const collectionChanges = changeStorage[collectionKey];

        return CollectionHelper.getInterpolatedCollectionValue(collectionChanges, state, info$);
      }),
    );
  }
}

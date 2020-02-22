import {InfoResponse} from '../command/info/info-response';
import {Observable} from 'rxjs';
import {ChangeResponse, ChangeState} from '../command/subscribe/change-response';
import {FilterFunctions} from './filter-functions';
import {SelectPrefilter} from '../collection/prefilter/select-prefilter';
import {CountPrefilter} from '../collection/prefilter/count-prefilter';
import {IPrefilter} from '../collection/prefilter/iprefilter';
import {map} from 'rxjs/operators';
import {FirstPrefilter} from '../collection/prefilter/first-prefilter';
import {LastPrefilter} from '../collection/prefilter/last-prefilter';
import {CreateRangeCommand} from '../command/create-range/create-range-command';
import {CollectionCommandBase} from '../command/collection-command-base';
import {UpdateRangeCommand} from '../command/update-range/update-range-command';

// @dynamic
export class CollectionHelper {
  static afterQueryPrefilters = [SelectPrefilter, CountPrefilter, FirstPrefilter, LastPrefilter];

  static getPrefiltersWithoutAfterQueryPrefilters(prefilters: IPrefilter<any, any>[]) {
    return prefilters.filter(
      p => CollectionHelper.afterQueryPrefilters.findIndex(f => p instanceof f) === -1);
  }

  static hasAfterQueryPrefilter(prefilters: IPrefilter<any, any>[]) {
    return prefilters.filter(
      p => CollectionHelper.afterQueryPrefilters.findIndex(f => p instanceof f) !== -1
    ).length !== 0;
  }

  static getPrefilterHash(prefilters: IPrefilter<any, any>[]) {
    return prefilters.reduce((prev, current) => prev += current.hash(), '');
  }

  static updateCollection<T>(info: InfoResponse, values: T[], changeResponse: ChangeResponse) {
    if (changeResponse.state === ChangeState.Modified) {
      const index = values.findIndex(
        FilterFunctions.comparePrimaryKeysFunction(info.primaryKeys, changeResponse.value));

      if (index !== -1) {
        values[index] = changeResponse.value;
      } else {
        values.push(changeResponse.value);
      }
    } else if (changeResponse.state === ChangeState.Added) {
      values.push(changeResponse.value);
    } else if (changeResponse.state === ChangeState.Deleted) {
      const index = values.findIndex(FilterFunctions.comparePrimaryKeysFunction(info.primaryKeys, changeResponse.value));

      if (index !== -1) {
        values.splice(index, 1);
      }
    }
  }

  static getInterpolatedCollectionValue(collectionChanges: CollectionCommandBase[], state: any[],
                                 info$: Observable<InfoResponse>): Observable<any> {
    return info$.pipe(
      map((info) => {
        if (!collectionChanges) {
          return state;
        }

        const stateCopy = state.slice(0);

        collectionChanges.map(change => {
          const changesToApply: ChangeResponse[] = [];

          if (change.commandType === 'CreateRangeCommand' || change.commandType === 'UpdateRangeCommand'
            || change.commandType === 'DeleteRangeCommand') {
            const values = change.commandType === 'UpdateRangeCommand' ? (<UpdateRangeCommand><any>change).entries.map(e => e.value)
              : (<CreateRangeCommand><any>change).values;

            for (const value of values) {
              changesToApply.push(<any>{
                value: value,
                state: change.commandType === 'CreateRangeCommand' ? ChangeState.Added :
                  change.commandType === 'UpdateRangeCommand' ? ChangeState.Modified : ChangeState.Deleted
              });
            }
          }

          return changesToApply;
        }).reduce((a, b) => a.concat(b), []).forEach(change => {
          CollectionHelper.updateCollection(info, stateCopy, change);
        });

        return stateCopy;
      })
    );
  }
}

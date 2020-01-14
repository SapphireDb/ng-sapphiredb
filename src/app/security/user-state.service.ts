import { Injectable } from '@angular/core';
import {SapphireDb} from 'ng-sapphiredb';
import {BehaviorSubject} from 'rxjs';
import {switchMap, take} from 'rxjs/operators';

@Injectable()
export class UserStateService {
  public currentUser$ = new BehaviorSubject<string>(null);

  constructor(private db: SapphireDb) { }

  public login(username: string, password: string) {
    this.db.execute('user', 'login', username, password).subscribe(response => {
      this.db.setAuthToken(<string>response.result + '').pipe(take(1)).subscribe((result) => {
        if (result === 'valid') {
          this.currentUser$.next(username);
        }
      });
    });
  }

  public logout() {
    this.db.setAuthToken();
    this.currentUser$.next(null);
  }
}
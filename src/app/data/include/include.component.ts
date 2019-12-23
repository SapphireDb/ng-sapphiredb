import {Component, OnInit} from '@angular/core';
import {DefaultCollection, SapphireDb} from 'ng-sapphiredb';
import {Observable} from 'rxjs';


@Component({
  selector: 'app-include',
  templateUrl: './include.component.html',
  styleUrls: ['./include.component.less']
})
export class IncludeComponent implements OnInit {
  private userCollection: DefaultCollection<any>;
  private entryCollection: DefaultCollection<any>;

  public users$: Observable<any[]>;
  public entries$: Observable<any[]>;

  constructor(private db: SapphireDb) {
    this.userCollection = this.db.collection('Users', 'Demo').include('entries');
    this.users$ = this.userCollection.values();

    this.entryCollection = this.db.collection('UserEntries', 'Demo').include('user');
    this.entries$ = this.entryCollection.values();
  }

  ngOnInit() {
  }

  createUser() {
    this.userCollection.add({
      name: 'Example username'
    });
  }

  createEntryForUser(user: any) {
    this.entryCollection.add({
      userId: user.id,
      content: 'Entry content'
    });
  }

  deleteUser(value: any) {
    this.userCollection.remove(value);
    return false;
  }

  updateUser(value: any) {
    this.userCollection.update({
      ...value,
      name: 'Updated username'
    });
  }

  updateEntriesThroughUser(user: any) {
    this.userCollection.update({
      ...user,
      entries: [
        ...user.entries.map(e => {
          e.content = 'Updated through user';
          return e;
        }),
        {
          content: 'New entry created through user'
        }
      ]
    });
  }

  updateEntry(value: any) {
    this.entryCollection.update({
      ...value,
      content: 'Updated entry content'
    });
  }

  deleteEntry(value: any) {
    this.entryCollection.remove(value);
    return false;
  }
}

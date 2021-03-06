import {NgModule} from '@angular/core';

import {DataRoutingModule} from './data-routing.module';
import {SharedModule} from '../shared.module';
import {QueryComponent} from './query/query.component';
import {ManageComponent} from './manage/manage.component';
import {PrefilterComponent} from './prefilter/prefilter.component';
import {WhereComponent} from './where/where.component';
import {OrderComponent} from './order/order.component';
import {LimitComponent} from './limit/limit.component';
import {SelectComponent} from './select/select.component';
import {CountComponent} from './count/count.component';
import {EventsComponent} from './events/events.component';
import {ChangesComponent} from './changes/changes.component';
import {IncludeComponent} from './include/include.component';
import { ClassTransformerComponent } from './class-transformer/class-transformer.component';
import { ModelValidationComponent } from './model-validation/model-validation.component';
import { OfflineComponent } from './offline/offline.component';
import { ConflictHandlingComponent } from './conflict-handling/conflict-handling.component';
import { ModelDefinitionComponent } from './model-definition/model-definition.component';
import { ServerSideQueryComponent } from './server-side-query/server-side-query.component';


@NgModule({
  declarations: [QueryComponent, ManageComponent, PrefilterComponent, WhereComponent, OrderComponent, LimitComponent, SelectComponent, CountComponent, EventsComponent, ChangesComponent, IncludeComponent, ClassTransformerComponent, ModelValidationComponent, OfflineComponent, ConflictHandlingComponent, ModelDefinitionComponent, ServerSideQueryComponent],
  imports: [
    SharedModule,
    DataRoutingModule
  ]
})
export class DataModule { }

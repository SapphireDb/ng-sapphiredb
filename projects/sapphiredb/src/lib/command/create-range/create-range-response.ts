import {ResponseBase} from '../response-base';
import {ValidatedResponseBase} from '../validated-response-base';

export interface CreateRangeResponse extends ResponseBase {
  results: CreateResponse[];
}

export interface CreateResponse extends ValidatedResponseBase {
  value: any;
}

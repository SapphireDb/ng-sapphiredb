import {ResponseBase} from '../response-base';
import {ValidatedResponseBase} from '../validated-response-base';

export interface UpdateRangeResponse extends ResponseBase {
  results: ValidatedResponseBase[];
}

export interface UpdateResponse extends ValidatedResponseBase {
  value: any;
}

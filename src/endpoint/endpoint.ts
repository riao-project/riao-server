import { ApiRequest } from '@riao/server-contract/request';
import { ApiResponse } from '@riao/server-contract/response';
import { EndpointFunction } from './endpoint-function';

export type Endpoint<
	TRequest extends ApiRequest = ApiRequest,
	TResponse extends ApiResponse = ApiResponse
> =
	| EndpointFunction<TRequest, TResponse>
	| EndpointFunction<TRequest, TResponse>[];

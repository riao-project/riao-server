import { BaseEndpointRequest } from './endpoint-request';
import { ApiResponse } from '@riao/server-contract/response';
import { EndpointFunction } from './endpoint-function';

export type Endpoint<
	TRequest extends BaseEndpointRequest = BaseEndpointRequest,
	TResponse extends ApiResponse = ApiResponse
> =
	| EndpointFunction<TRequest, TResponse>
	| EndpointFunction<TRequest, TResponse>[];

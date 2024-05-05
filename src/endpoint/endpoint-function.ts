import { ApiResponse } from '@riao/server-contract/response';
import { BaseEndpointRequest } from './endpoint-request';

export type EndpointFunction<
	TRequest extends BaseEndpointRequest,
	TResponse extends ApiResponse
> = (request: TRequest) => Promise<TResponse>;

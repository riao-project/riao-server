import { ApiRequest } from '@riao/server-contract/request';
import { ApiResponse } from '@riao/server-contract/response';

export type EndpointFunction<
	TRequest extends ApiRequest,
	TResponse extends ApiResponse
> = (request: TRequest) => Promise<TResponse>;

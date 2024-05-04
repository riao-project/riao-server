import { EndpointFunction } from '../endpoint';
import { DatabaseRecord } from '@riao/dbal';
import {
	ApiRequest,
	DeleteOneRequest,
	GetManyRequest,
	GetOneRequest,
	PatchOneRequest,
	PostOneRequest,
} from '@riao/server-contract/request';
import {
	DeleteOneResponse,
	GetManyResponse,
	GetOneResponse,
	PatchOneResponse,
	PostOneResponse,
	ApiResponse,
} from '@riao/server-contract/response';

export interface ControllerInterface<
	T extends DatabaseRecord = DatabaseRecord
> {
	path: string;
	name?: string;

	getMany?: EndpointFunction<GetManyRequest, GetManyResponse<T>>;
	getOne?: EndpointFunction<GetOneRequest, GetOneResponse<T>>;
	postOne?: EndpointFunction<PostOneRequest<T>, PostOneResponse<T>>;
	patchOne?: EndpointFunction<PatchOneRequest<T>, PatchOneResponse<T>>;
	deleteOne?: EndpointFunction<DeleteOneRequest, DeleteOneResponse>;

	actions?: { [key: string]: EndpointFunction<ApiRequest, ApiResponse> };
}

export type Controller = { new (): ControllerInterface };

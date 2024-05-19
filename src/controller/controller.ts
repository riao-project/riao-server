import { EndpointFunction } from '../endpoint';
import { DatabaseRecord } from '@riao/dbal';
import {
	ActionRequest,
	DeleteOneRequest,
	GetManyRequest,
	GetOneRequest,
	PatchOneRequest,
	PostOneRequest,
	SearchRequest,
} from '../endpoint';
import {
	DeleteOneResponse,
	GetManyResponse,
	GetOneResponse,
	PatchOneResponse,
	PostOneResponse,
	ApiResponse,
	SearchResponse,
} from '@riao/server-contract/response';

export interface ControllerInterface<
	T extends DatabaseRecord = DatabaseRecord
> {
	path: string;
	name?: string;

	iam?: boolean;

	getMany?: EndpointFunction<GetManyRequest<T>, GetManyResponse<T>>;
	getOne?: EndpointFunction<GetOneRequest<T>, GetOneResponse<T>>;
	search?: EndpointFunction<SearchRequest<T>, SearchResponse<T>>;
	postOne?: EndpointFunction<PostOneRequest<T>, PostOneResponse<T>>;
	patchOne?: EndpointFunction<PatchOneRequest<T>, PatchOneResponse<T>>;
	deleteOne?: EndpointFunction<DeleteOneRequest, DeleteOneResponse>;

	actions?: { [key: string]: EndpointFunction<ActionRequest, ApiResponse> };
}

export type ControllerType = { new (): ControllerInterface };

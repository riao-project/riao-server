import { DatabaseRecord, DatabaseRecordId } from '@riao/dbal';
import { Request as ExpressRequest } from 'express';
import * as ServerContract from '@riao/server-contract';

export interface BaseEndpointRequest {
	http: ExpressRequest;
	userId?: DatabaseRecordId;
	scopes?: string[];
}

export type GetManyRequest<T extends DatabaseRecord = DatabaseRecord> =
	BaseEndpointRequest & ServerContract.GetManyRequest<T>;

export type GetOneRequest<T extends DatabaseRecord = DatabaseRecord> =
	BaseEndpointRequest & ServerContract.GetOneRequest<T>;

export type PostOneRequest<T extends DatabaseRecord = DatabaseRecord> =
	BaseEndpointRequest & ServerContract.PostOneRequest<T>;

export type PatchOneRequest<T extends DatabaseRecord = DatabaseRecord> =
	BaseEndpointRequest & ServerContract.PatchOneRequest<T>;

export type DeleteOneRequest = BaseEndpointRequest &
	ServerContract.DeleteOneRequest;

export type ActionRequest = BaseEndpointRequest & ServerContract.PostRequest;

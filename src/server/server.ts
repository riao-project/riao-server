import {
	Application as ExpressApp,
	Request as ExpressRequest,
	Response as ExpressResponse,
} from 'express';

import * as express from 'express';
import * as cors from 'cors';

import { DatabaseRecordId } from '@riao/dbal';
import { AuthenticationError } from '@riao/iam/errors/authentication-error';
import { Iam } from '@riao/iam';

import { ControllerInterface, ControllerType } from '../controller';
import { BaseEndpointRequest } from '../endpoint';

import { Log } from 'ts-tiny-log';
import { getRemoteIp } from '../http';

/**
 * GET ONE		GET /api/v1/users/:id
 * GET MANY		GET /api/v1/users
 * POST ONE		POST /api/v1/users
 * POST MANY	POST /api/v1/users
 * PATCH ONE	PATCH /api/v1/users/:id
 * PATCH MAY	PATCH /api/v1/users
 * ACTION 		POST /api/v1/users/example
 */

export class RiaoServer {
	public port = 3000;
	public prefix = 'api';
	public apiVersion = 1;
	protected controllers: ControllerType[] = [];

	protected iam?: Iam;

	protected app: ExpressApp;
	protected log: Log = new Log({});

	protected createPath(path: string) {
		return `/${this.prefix}/v${this.apiVersion}/${path}`;
	}

	protected wrapEndpoint(
		endpoint: string,
		controller: ControllerInterface,
		callback: (request: BaseEndpointRequest) => Promise<any>
	) {
		return async (request: ExpressRequest, response: ExpressResponse) => {
			try {
				// TODO: Timeout?

				// Authentication
				const { userId, scopes } = await this.authenticate(
					request,
					controller
				);

				// TODO: Authorization?
				// TODO: Validation?

				const retval = await callback({
					http: request,
					userId: userId ?? undefined,
					scopes,
				});

				response.send(retval ?? {});
			}
			catch (e) {
				if (e instanceof AuthenticationError) {
					this.log.warn(
						getRemoteIp(request) + '\t| AUTH Error',
						e.message
					);
					response.status(401);
					response.send({
						message: 'Authentication error: ' + e.message,
					});
				}
				else {
					// TODO: Error handling
					this.log.error(
						getRemoteIp(request) + '\t| REQUEST Error',
						e
					);
					response.sendStatus(500);
				}
			}
		};
	}

	public async start() {
		this.app = express();
		this.app.use(express.json());
		this.app.use(
			cors({
				origin: true, // TODO: Static? Load from somewhere? Probably allow consumer to choose https://expressjs.com/en/resources/middleware/cors.html
				// some legacy browsers (IE11, various SmartTVs) choke on 204
				optionsSuccessStatus: 200,
			})
		);

		this.registerControllers();

		return new Promise<void>((accept, reject) => {
			try {
				this.app.listen(this.port, accept);
			}
			catch (e) {
				reject(e);
			}
		});
	}

	protected registerControllers() {
		for (const controllerType of this.controllers) {
			this.registerController(controllerType);
		}
	}

	protected registerController(controllerType: ControllerType) {
		const controller = new controllerType();

		if (controller.getMany) {
			this.app.get(
				this.createPath(controller.path),
				this.wrapEndpoint('get-many', controller, async (request) =>
					controller.getMany({
						...request,
						query: request.http.query,
						params: request.http.params,
					})
				)
			);
		}

		if (controller.getOne) {
			this.app.get(
				this.createPath(controller.path + '/:id'),
				this.wrapEndpoint('get-one', controller, async (request) =>
					controller.getOne({
						...request,
						query: request.http.query,
						params: request.http.params,
					})
				)
			);
		}

		if (controller.search) {
			this.app.post(
				this.createPath(controller.path + '/search'),
				this.wrapEndpoint('search', controller, async (request) =>
					controller.search({
						...request,
						query: request.http.query,
						params: request.http.params,
						body: request.http.body,
					})
				)
			);
		}

		if (controller.postOne) {
			this.app.post(
				this.createPath(controller.path),
				this.wrapEndpoint('post-one', controller, async (request) =>
					controller.postOne({
						...request,
						query: request.http.query,
						params: request.http.params,
						body: request.http.body,
					})
				)
			);
		}

		if (controller.patchOne) {
			this.app.patch(
				this.createPath(controller.path + '/:id'),
				this.wrapEndpoint('patch-one', controller, async (request) =>
					controller.patchOne({
						...request,
						query: request.http.query,
						params: request.http.params,
						body: request.http.body,
					})
				)
			);
		}

		if (controller.deleteOne) {
			this.app.delete(
				this.createPath(controller.path + '/:id'),
				this.wrapEndpoint('delete-one', controller, async (request) =>
					controller.deleteOne({
						...request,
						query: request.http.query,
						params: request.http.params,
					})
				)
			);
		}

		const actions = controller.actions ?? {};

		for (const actionKey in actions) {
			this.app.post(
				this.createPath(controller.path + '/action/' + actionKey),
				this.wrapEndpoint(actionKey, controller, async (request) =>
					controller.actions[actionKey]({
						...request,
						query: request.http.query,
						params: request.http.params,
						body: request.http.body,
					})
				)
			);
		}
	}

	protected async authenticate(
		request: ExpressRequest,
		controller: ControllerInterface
	) {
		let userId: null | DatabaseRecordId = null;
		let scopes: string[] = [];

		if (this.iam && controller.iam !== false) {
			if (request.headers?.authorization) {
				const access: string = request.headers.authorization
					.replace('Bearer', '')
					.trim();

				if (!access || !access.length) {
					throw new Error('Not authenticated');
				}

				try {
					const payload = await this.iam.verifyAccessToken({
						accessToken: access,
					});

					userId = payload.userId;
					scopes = payload.scopes;
				}
				catch (e) {
					throw new AuthenticationError('Not authenticated');
				}
			}
			else {
				throw new AuthenticationError('Not authenticated');
			}
		}

		return { userId, scopes };
	}
}

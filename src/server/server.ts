import {
	Application as ExpressApp,
	Request as ExpressRequest,
	Response as ExpressResponse,
} from 'express';

import * as express from 'express';

import { Controller } from '../controller';

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
	protected controllers: Controller[] = [];

	protected app: ExpressApp;

	protected createPath(path: string) {
		return `/${this.prefix}/v${this.apiVersion}/${path}`;
	}

	protected wrapEndpoint(
		callback: (request: ExpressRequest) => Promise<any>
	) {
		return async (request: ExpressRequest, response: ExpressResponse) => {
			// TODO: Error handling
			const retval = await callback(request);

			response.send(retval ?? {});
		};
	}

	public async start() {
		this.app = express();
		this.app.use(express.json());

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

	protected registerController(controllerType: Controller) {
		const controller = new controllerType();

		if (controller.getMany) {
			this.app.get(
				this.createPath(controller.path),
				this.wrapEndpoint(async (request) =>
					controller.getMany(request.query)
				)
			);
		}

		if (controller.getOne) {
			this.app.get(
				this.createPath(controller.path + '/:id'),
				this.wrapEndpoint(async (request) =>
					controller.getOne({
						id: request.params.id,
					})
				)
			);
		}

		if (controller.postOne) {
			this.app.post(
				this.createPath(controller.path),
				this.wrapEndpoint(async (request) =>
					controller.postOne(request.body)
				)
			);
		}

		if (controller.patchOne) {
			this.app.patch(
				this.createPath(controller.path + '/:id'),
				this.wrapEndpoint(async (request) =>
					controller.patchOne({
						id: request.params.id,
						data: request.body,
					})
				)
			);
		}

		if (controller.deleteOne) {
			this.app.delete(
				this.createPath(controller.path + '/:id'),
				this.wrapEndpoint(async (request) =>
					controller.deleteOne({
						id: request.params.id,
					})
				)
			);
		}

		for (const actionKey in controller.actions) {
			this.app.post(
				this.createPath(controller.path + '/' + actionKey),
				this.wrapEndpoint(async (request) =>
					controller.actions[actionKey](request.body)
				)
			);
		}
	}
}

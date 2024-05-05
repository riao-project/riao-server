import 'jasmine';
import { ControllerInterface } from '../../../src/controller';
import {
	ApiRequest,
	DeleteOneRequest,
	GetManyRequest,
	GetOneRequest,
	PatchOneRequest,
	PostOneRequest,
} from '@riao/server-contract';

class TestController implements ControllerInterface {
	path = 'test';

	async getMany(request: GetManyRequest) {
		return [{ requested: request.query.limit }];
	}

	async getOne(request: GetOneRequest) {
		return { requested: request.params.id };
	}

	async postOne(request: PostOneRequest) {
		return request.body;
	}

	async patchOne(request: PatchOneRequest) {
		return {
			id: request.params.id,
			...request.body,
		};
	}

	async deleteOne(request: DeleteOneRequest) {
		return;
	}

	actions = {
		login: async (request: ApiRequest) => {},
	};
}

describe('Controller', () => {
	const controller = new TestController();

	it('can get many', async () => {
		expect(await controller.getMany({ query: { limit: 5 } })).toEqual([
			{ requested: 5 },
		]);
	});

	it('can get one', async () => {
		expect(await controller.getOne({ params: { id: 5 } })).toEqual({
			requested: 5,
		});
	});

	it('can post one', async () => {
		expect(
			await controller.postOne({ body: { email: 'tom@test.com' } })
		).toEqual({
			email: 'tom@test.com',
		});
	});

	it('can patch one', async () => {
		expect(
			await controller.patchOne({
				params: { id: 5 },
				body: { email: 'tom@test.com' },
			})
		).toEqual(<any>{
			id: 5,
			email: 'tom@test.com',
		});
	});

	it('can delete one', async () => {
		expect(
			await controller.deleteOne({
				params: { id: 5 },
			})
		).toEqual(undefined);
	});
});

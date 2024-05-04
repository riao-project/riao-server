import 'jasmine';
import * as index from '../../src';
import {
	ApiRequest,
	DeleteOneRequest,
	GetManyRequest,
	GetOneRequest,
	PatchOneRequest,
	PostOneRequest,
} from '@riao/server-contract';

class TestController implements index.ControllerInterface {
	path = 'test';

	async getMany(request: GetManyRequest) {
		return [{ requested: request.limit }];
	}

	async getOne(request: GetOneRequest) {
		return { requested: request.id };
	}

	async postOne(request: PostOneRequest) {
		return request;
	}

	async patchOne(request: PatchOneRequest) {
		return {
			id: request.id,
			...request.data,
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
		expect(await controller.getMany({ limit: 5 })).toEqual([
			{ requested: 5 },
		]);
	});

	it('can get one', async () => {
		expect(await controller.getOne({ id: 5 })).toEqual({ requested: 5 });
	});

	it('can post one', async () => {
		expect(await controller.postOne({ email: 'tom@test.com' })).toEqual({
			email: 'tom@test.com',
		});
	});

	it('can patch one', async () => {
		expect(
			await controller.patchOne({
				id: 5,
				data: { email: 'tom@test.com' },
			})
		).toEqual(<any>{
			id: 5,
			email: 'tom@test.com',
		});
	});

	it('can delete one', async () => {
		expect(
			await controller.deleteOne({
				id: 5,
			})
		).toEqual(undefined);
	});
});

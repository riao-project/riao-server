import 'jasmine';
import { ModelController } from '../../src/model';
import { ApiRequest } from '@riao/server-contract';
import { maindb } from '../../database/main';
import { User } from '../../examples/models/user';

const repo = maindb.getQueryRepository<User>({ table: 'users' });

class TestController extends ModelController {
	path = 'test';
	repo = repo;

	actions = {
		login: async (request: ApiRequest) => {},
	};
}

describe('Controller', () => {
	const controller = new TestController();

	beforeAll(async () => {
		await maindb.ddl.truncate({ table: 'users' });
		await maindb.ddl.query({
			sql: 'ALTER TABLE `users` AUTO_INCREMENT = 1',
		});

		await repo.insert({
			records: [
				{ username: 'test1', password: 'password1234' },
				{ username: 'test2', password: 'password1234' },
				{ username: 'test3', password: 'password1234' },
				{ username: 'test4', password: 'password1234' },
				{ username: 'test5', password: 'password1234' },
				{ username: 'test6', password: 'password1234' },
				{ username: 'test7', password: 'password1234' },
				{ username: 'test8', password: 'password1234' },
				{ username: 'test9', password: 'password1234' },
				{ username: 'test0', password: 'password1234' },
			],
		});
	});

	it('can get many', async () => {
		expect(await controller.getMany({ query: { limit: 5 } })).toEqual([
			{ id: 1, username: 'test1', password: 'password1234' },
			{ id: 2, username: 'test2', password: 'password1234' },
			{ id: 3, username: 'test3', password: 'password1234' },
			{ id: 4, username: 'test4', password: 'password1234' },
			{ id: 5, username: 'test5', password: 'password1234' },
		]);
	});

	it('can get one', async () => {
		expect(await controller.getOne({ params: { id: 1 } })).toEqual({
			id: 1,
			username: 'test1',
			password: 'password1234',
		});
	});

	it('can post one', async () => {
		expect(
			await controller.postOne({
				body: {
					username: 'tom@test.com',
					password: 'password1234',
				},
			})
		).toEqual({
			id: 11,
			username: 'tom@test.com',
			password: 'password1234',
		});
	});

	it('can patch one', async () => {
		expect(
			await controller.patchOne({
				params: { id: 7 },
				body: { username: 'tomupdated@test.com' },
			})
		).toEqual(<any>{
			id: 7,
			username: 'tomupdated@test.com',
			password: 'password1234',
		});
	});

	it('can delete one', async () => {
		expect(await controller.deleteOne({ params: { id: 8 } })).toEqual(
			undefined
		);
	});

	it('can login', async () => {
		expect(
			await controller.actions.login({
				body: {
					username: 'login-user',
					password: 'password1234',
				},
			})
		).toEqual(undefined);
	});
});

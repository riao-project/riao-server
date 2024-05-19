import 'jasmine';

import { RiaoHttpClient } from '@riao/http-client';

import { ActionRequest, ControllerInterface, RiaoServer } from '../../src';
import { env } from '../../examples/env';

class TestBasicController implements ControllerInterface {
	path = 'test';
	name = 'Test Controller';

	actions = {
		echo: async (request: ActionRequest) => {
			return {
				hello: 'world',
				echo: request.body.echo,
			};
		},
	};
}

class TestServer extends RiaoServer {
	port = env.HTTP_PORT;
	controllers = [TestBasicController];
}

describe('Server', () => {
	let server: RiaoServer;
	let client: RiaoHttpClient;

	beforeAll(async () => {
		server = new TestServer();
		await server.start();

		client = new RiaoHttpClient();
		client.url = `http://localhost:${env.HTTP_PORT}/api/v1`;
	});

	it('is running', async () => {
		const response = await client.request({
			path: '/test/echo',
			method: 'POST',
			body: {
				echo: 'teststring',
			},
		});

		expect(response).toEqual({
			hello: 'world',
			echo: 'teststring',
		});
	});
});

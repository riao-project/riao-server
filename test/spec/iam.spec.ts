import 'jasmine';

import { RiaoHttpClient } from '@riao/http-client';

import {
	ActionRequest,
	ControllerInterface,
	ModelController,
	RiaoServer,
} from '../../src';
import { env } from '../../examples/env';
import { maindb } from '../../database/main';
import { Iam, Jwt } from '@riao/iam';
import { KeyPairGenerator } from '@riao/iam/keypair';
import {
	AuthenticationPassword,
	PasswordLogin,
} from '@riao/iam/authentication-password';

export const keygen = new KeyPairGenerator({ algorithm: 'ES256' });
export const keypair = keygen.generate();

class User {
	id?: number;
	username: string;
	password: string;
}

const userRepo = maindb.getQueryRepository<User>({ table: 'users' });

class TestIam extends Iam<PasswordLogin> {
	authn = new AuthenticationPassword({
		db: maindb,
		userTable: userRepo.getTableName(),
		loginColumn: 'username',
	});

	jwt = new Jwt({
		algorithm: 'ES256',
		publicKey: keypair.publicKey,
		privateKey: keypair.privateKey,
	});
}

const iam = new TestIam();

class TestAuthController implements ControllerInterface {
	path = 'auth';
	name = 'Auth Controller';
	iam = false;
	repo = userRepo;

	actions = {
		register: async (request: ActionRequest) => {
			const { id } = await this.repo.insertOne({
				record: {
					username: request.body.username.toLowerCase(),
					password: await iam.authn.hashPassword(
						request.body.password
					),
				},
			});

			return await this.login({
				login: request.body.username,
				password: request.body.password,
			});
		},
		login: async (request: ActionRequest) => {
			return await this.login({
				login: request.body.username,
				password: request.body.password,
			});
		},
		refresh: async (request: ActionRequest) => {
			return await iam.refresh(request.body.id, request.body.refresh);
		},
	};

	protected async login(creds: { login: string; password: string }) {
		return await iam.login({
			login: creds.login.toLowerCase(),
			password: creds.password,
		});
	}
}

class TestUserController extends ModelController<User> {
	path = 'users';
	name = 'User Controller';
	repo = userRepo;

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
	port = env.HTTP_PORT + 1;
	controllers = [TestAuthController, TestUserController];

	iam = iam;
}

describe('Iam', () => {
	let server: RiaoServer;
	let authClient: RiaoHttpClient;
	let userClient: RiaoHttpClient;
	const now = Date.now() / 1000;

	beforeAll(async () => {
		server = new TestServer();
		await server.start();

		authClient = new RiaoHttpClient();
		authClient.url = `http://localhost:${env.HTTP_PORT + 1}/api/v1/auth`;

		userClient = new RiaoHttpClient();
		userClient.url = `http://localhost:${env.HTTP_PORT + 1}/api/v1/users`;

		await userRepo.insertOne({
			record: {
				username: 'testaccount',
				password: await iam.authn.hashPassword('testpassword'),
			},
		});
	});

	it('can create an account', async () => {
		const response: any = await authClient.action('register', {
			body: {
				username: 'registertest',
				password: 'password1234',
			},
		});

		expect(response.access.token.length).toBeGreaterThanOrEqual(1);
		expect(response.access.expiration).toBeGreaterThanOrEqual(now);
		expect(response.refresh.token.length).toBeGreaterThanOrEqual(1);
		expect(response.refresh.expiration).toBeGreaterThanOrEqual(now);
	});

	it('can login', async () => {
		const response: any = await authClient.action('login', {
			body: {
				username: 'testaccount',
				password: 'testpassword',
			},
		});

		expect(response.access.token.length).toBeGreaterThanOrEqual(1);
		expect(response.access.expiration).toBeGreaterThanOrEqual(now);
		expect(response.refresh.token.length).toBeGreaterThanOrEqual(1);
		expect(response.refresh.expiration).toBeGreaterThanOrEqual(now);
	});

	it('can refresh', async () => {
		const response: any = await authClient.action('login', {
			body: {
				username: 'testaccount',
				password: 'testpassword',
			},
		});

		expect(response.refresh.token.length).toBeGreaterThanOrEqual(1);

		await new Promise<void>((a, r) => setTimeout(() => a(), 1000));

		const refreshed = <any>await authClient.action('refresh', {
			body: {
				id: response.userId,
				refresh: response.refresh.token,
			},
		});

		expect(refreshed.userId).toEqual(response.userId);
		expect(refreshed.access.token.length).toBeGreaterThanOrEqual(1);
		expect(refreshed.access.expiration).toBeGreaterThanOrEqual(now);
	});

	it('can\'t pull users if unauthenticated', async () => {
		await expectAsync(userClient.getMany({})).toBeRejected(); // TODO: Specify error type
	});

	it('can pull users', async () => {
		const tokens: any = await authClient.action('login', {
			body: {
				username: 'testaccount',
				password: 'testpassword',
			},
		});

		userClient.accessToken = tokens.access.token;

		await new Promise<void>((a, r) => setTimeout(a, 1000));

		const users = await userClient.getMany({
			withAccessToken: true,
			query: { limit: 5 },
		});

		expect(users.length).toEqual(5);
		expect(users[1]).toEqual({
			id: 2,
			username: 'test2',
			password: 'password1234',
		});
	});
});

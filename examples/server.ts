import { RiaoServer } from '../src/server';
import { env } from './env';

import { UserController } from './controllers/user-controller';

export class MyServer extends RiaoServer {
	port = env.HTTP_PORT;
	controllers = [UserController];
}

import { ModelController } from '../../src/controller';

import { maindb } from '../../database/main';
import { User } from '../../examples/models/user';
import { ActionRequest } from 'src';

export class UserController extends ModelController<User> {
	path = 'users';
	repo = maindb.getQueryRepository<User>({ table: 'users' });

	actions = {
		login: async (request: ActionRequest) => {
			console.log('User is trying to login!', request.body.username);
		},
	};
}

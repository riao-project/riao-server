import { ModelController } from '../../src/model';
import { GetManyRequest } from '@riao/server-contract/request';

import { maindb } from '../../database/main';
import { User } from '../../examples/models/user';

export class UserController extends ModelController<User> {
	path = 'users';
	repo = maindb.getQueryRepository<User>({ table: 'users' });

	actions = {
		login: async (request: Partial<User>) => {
			console.log('User is trying to login!', request.username);
		},
	};
}

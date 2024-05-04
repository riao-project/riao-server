import { maindb } from '../../database/main';
import 'jasmine';

beforeAll(async () => {
	await maindb.init();
});

afterAll(async () => {
	await maindb.disconnect();
});

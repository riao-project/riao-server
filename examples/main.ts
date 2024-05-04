import { log } from './log';
import { env } from './env';
import { MyServer } from './server';

/**
 * Start your application in the main() function
 */
export async function main(): Promise<void> {
	log.info('Hello!');

	const server = new MyServer();
	await server.start();

	log.info('Server started!');
}

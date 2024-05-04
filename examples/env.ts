import { AppConfig, configure } from 'ts-appconfig';

/**
 * Environment Variables Schema
 */
export class Environment extends AppConfig {
	readonly APP_TITLE = '{{project-name}}';
	readonly HTTP_PORT = 3000;
}

/**
 * Load & export environment variables
 */
export const env: Environment = configure(Environment);

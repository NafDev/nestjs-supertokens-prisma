/* eslint-disable @typescript-eslint/naming-convention */
import process from 'node:process';
import { cleanEnv, num, port, str, url } from 'envalid';

export default cleanEnv(process.env, {
	NODE_ENV: str({ devDefault: 'development', choices: ['development', 'production'] }),
	PORT: port({ default: 3000 }),
	PASSWORD_SALT_ROUNDS: num({ default: 12 }),
	PASSWORD_RESET_EXPIRY_MINS: num({ default: 15 }),

	DATABASE_URI: url({ example: 'postgresql://postgres:password@localhost:5432/postgres?schema=public' }),

	ST_CORE_URL: url({
		devDefault: 'http://127.0.0.1:3567/',
		desc: 'The API domain for the SuperTokens Core service'
	}),

	APP_NAME: str({ default: 'My App', desc: 'The name of your app or service' }),
	API_DOMAIN: url({ devDefault: `localhost:3000` }),
	WEB_DOMAIN: url({ example: 'localhost:8080' }),

	SMTP_HOST: str({ example: 'email-smtp.eu-west-2.amazonaws.com' }),
	SMTP_PORT: port({ choices: [25, 587, 2587, 465, 2465, 2525] }),
	SMTP_USER: str(),
	SMTP_PASS: str({}),
	SMTP_SENDFROM: str({ desc: 'The email address of the sender (your app)' })
});

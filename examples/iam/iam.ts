import { Iam, Jwt } from '@riao/iam';
import {
	AuthenticationPassword,
	PasswordLogin,
} from '@riao/iam/authentication-password';
import { KeyPairGenerator } from '@riao/iam/keypair';
import { maindb } from 'database/main';

export const keygen = new KeyPairGenerator({ algorithm: 'ES256' });
export const keypair = keygen.generate();

export class ExampleIam extends Iam<PasswordLogin> {
	authn = new AuthenticationPassword({
		db: maindb,
		loginColumn: 'username',
	});

	jwt = new Jwt({
		algorithm: 'ES256',
		publicKey: keypair.publicKey,
		privateKey: keypair.privateKey,
	});
}

export const iam = new ExampleIam();

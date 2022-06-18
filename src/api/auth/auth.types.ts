import { Role } from '../users/users.types';

export interface AccessTokenPayload {
	roles: string[];
}

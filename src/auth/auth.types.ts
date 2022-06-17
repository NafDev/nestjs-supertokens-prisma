import { Role } from '../users/user.types';

export interface AccessTokenPayload {
	roles: Role[];
}

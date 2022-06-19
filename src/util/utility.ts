import { createHash } from 'node:crypto';

/**
 * @param input String to hash
 * @returns Input hashed with SHA265 in hexadecimal form
 */
export function sha265hex(input: string) {
	return createHash('sha256').update(input).digest('hex');
}

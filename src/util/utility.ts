import { createHash } from 'node:crypto';
import { customAlphabet } from 'nanoid';

/**
 * @param input String to hash
 * @returns Input hashed with SHA265 in hexadecimal form
 */
export function sha265hex(input: string) {
	return createHash('sha256').update(input).digest('hex');
}

const alphanumericChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Create a random alphanumberic string (of default length 128 characters)
 */
export const createToken = customAlphabet(alphanumericChars, 128);

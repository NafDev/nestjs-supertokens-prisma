import { customAlphabet } from 'nanoid';

const databaseIdAlphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
export const nanoDbId = customAlphabet(databaseIdAlphabet, 24);

import EmailVerification from 'supertokens-node/recipe/emailverification';
import Session from 'supertokens-node/recipe/session';

// SuperTokens recipe singleton references
export const STSessionHandler = Session;
export const STEmailVerificationHandler = EmailVerification;

// Type for @Session() parameter decorator
export type STSession = import('supertokens-node/lib/build/recipe/session/sessionClass').default;

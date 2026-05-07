import { isValidObjectId } from 'mongoose';
import { UnauthorizedError } from './http-errors';

const INTERNAL_AUTH_SECRET_HEADER = 'x-internal-auth-secret';
const INTERNAL_USER_ID_HEADER = 'x-internal-user-id';

function getExpectedInternalAuthSecret(): string {
  const secret = process.env.INTERNAL_AUTH_SECRET;

  if (!secret) {
    throw new Error('INTERNAL_AUTH_SECRET is required');
  }

  return secret;
}

export function assertInternalAuth(request: Request): void {
  const providedSecret = request.headers.get(INTERNAL_AUTH_SECRET_HEADER);

  if (!providedSecret) {
    throw new UnauthorizedError('Missing X-Internal-Auth-Secret header');
  }

  if (providedSecret !== getExpectedInternalAuthSecret()) {
    throw new UnauthorizedError('Invalid X-Internal-Auth-Secret header');
  }
}

export function getAuthenticatedUserId(request: Request): string {
  assertInternalAuth(request);

  const userId = request.headers.get(INTERNAL_USER_ID_HEADER);

  if (!userId) {
    throw new UnauthorizedError('Missing X-Internal-User-Id header');
  }

  if (!isValidObjectId(userId)) {
    throw new UnauthorizedError('Invalid X-Internal-User-Id header');
  }

  return userId;
}

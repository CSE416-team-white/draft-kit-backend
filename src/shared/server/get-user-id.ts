import { isValidObjectId } from 'mongoose';
import { UnauthorizedError } from './http-errors';

const USER_ID_HEADER = 'x-user-id';

export function getUserId(request: Request): string {
  const userId = request.headers.get(USER_ID_HEADER);

  if (!userId) {
    throw new UnauthorizedError('Missing X-User-Id header');
  }

  if (!isValidObjectId(userId)) {
    throw new UnauthorizedError('Invalid X-User-Id header');
  }

  return userId;
}

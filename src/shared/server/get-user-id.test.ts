import { beforeEach, describe, expect, it } from 'vitest';
import {
  assertInternalAuth,
  getAuthenticatedUserId,
} from './get-user-id';

describe('internal auth headers', () => {
  beforeEach(() => {
    process.env.INTERNAL_AUTH_SECRET = 'test-secret';
  });

  it('accepts a valid internal auth secret and user id', () => {
    const request = new Request('http://localhost/api/users/me', {
      headers: {
        'X-Internal-Auth-Secret': 'test-secret',
        'X-Internal-User-Id': '507f1f77bcf86cd799439011',
      },
    });

    expect(() => assertInternalAuth(request)).not.toThrow();
    expect(getAuthenticatedUserId(request)).toBe('507f1f77bcf86cd799439011');
  });

  it('rejects a missing internal auth secret', () => {
    const request = new Request('http://localhost/api/users/me');

    expect(() => assertInternalAuth(request)).toThrow(
      'Missing X-Internal-Auth-Secret header',
    );
  });

  it('rejects an invalid internal auth secret', () => {
    const request = new Request('http://localhost/api/users/me', {
      headers: {
        'X-Internal-Auth-Secret': 'wrong-secret',
      },
    });

    expect(() => assertInternalAuth(request)).toThrow(
      'Invalid X-Internal-Auth-Secret header',
    );
  });

  it('rejects an invalid internal user id', () => {
    const request = new Request('http://localhost/api/users/me', {
      headers: {
        'X-Internal-Auth-Secret': 'test-secret',
        'X-Internal-User-Id': 'not-an-object-id',
      },
    });

    expect(() => getAuthenticatedUserId(request)).toThrow(
      'Invalid X-Internal-User-Id header',
    );
  });
});

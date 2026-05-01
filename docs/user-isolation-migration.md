# User Isolation Migration

Existing `leagues` and `notebooks` documents created before user isolation do not have `userId`.

## Strategy

1. Create or reuse the system user with `externalId=system`.
2. Backfill every existing league and notebook with that system user's `_id`.
3. Deploy code that requires `X-User-Id` only after the backfill is complete.
4. Reassign system-owned records later if a real user should own them.

## Notes

- The backend now requires `userId` on all league and notebook documents.
- Default seeded leagues are owned by the system user.
- If you need to preserve access during rollout, run the backfill before enabling the new routes in production.

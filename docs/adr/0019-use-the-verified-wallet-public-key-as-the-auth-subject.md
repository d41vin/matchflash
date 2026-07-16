# Use the verified wallet public key as the auth subject

The verified Phantom wallet public key is the immutable `customJwt` subject and canonical MatchFlash user identity. `users.authSubject` stores it with a unique lookup, while `walletAddress` is the displayable counterpart; embedded and injected-wallet sign-in therefore resolve to the same Convex user model.

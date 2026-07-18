# TxLINE Devnet operator onboarding

This local-only operator flow validates TxLINE access without changing the production Mainnet worker or using a wallet private key.

1. Confirm that Phantom has Solana Devnet selected and that the intended address has Devnet SOL.
2. Start the application locally with `pnpm.cmd dev`, then open `http://localhost:3000/txline-devnet`. If this Windows machine reports a pnpm store-location mismatch, use `./node_modules/.bin/next.cmd dev` instead; it runs the same local Next.js binary.
3. Connect the **injected Phantom extension**. The page explicitly switches its Solana provider to Devnet.
4. The page first simulates the exact subscription transaction on Devnet without broadcasting it. Review and approve the displayed TxLINE free-tier Devnet transaction only if that preflight succeeds. It creates a level-1 subscription for four weeks and, only if required, a Token-2022 account. It uses Devnet SOL only.
5. Review and approve the activation **message**. It is not a transaction. The page records and checks the subscribing wallet address; the same wallet must approve both prompts.
6. Copy the displayed API token into a new ignored `.env.txline-devnet` file based on `.env.txline-devnet.example`. Do not put it in `.env.local`, source control, or chat.
7. Run `pnpm.cmd probe:txline-devnet`. If pnpm has the same local store-location issue, run `node --env-file=.env.txline-devnet --experimental-strip-types workers/txline-devnet-probe.ts` instead. The probe asks for a fresh guest JWT automatically, connects to both Devnet SSE streams for up to 15 seconds, and reports only connectivity and whether it observed a non-heartbeat frame.

The two Next.js proxy routes used by the page are disabled in production. They only relay the Devnet guest-session and activation requests during local development; they do not store the guest JWT or activated API token.

If the application reports an unrelated MatchFlash wallet-auth configuration error before the page loads, complete the project's existing local `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_PHANTOM_APP_ID`, and `NEXT_PUBLIC_REDIRECT_URL` setup first. Those are required by the root application provider and are unrelated to TxLINE credentials.

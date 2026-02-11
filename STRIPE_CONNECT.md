# Stripe Connect – Host Payouts

BRIGAP uses Stripe Connect Express so hosts can receive earnings and cash out to their bank account.

## Flow

1. **Driver pays** → Money goes to the platform's Stripe account.
2. **Host connects bank** → Host completes Stripe Connect onboarding (bank details, identity).
3. **Host sees earnings** → Available balance shown on the Payout Dashboard.
4. **Host cashes out** → Money is transferred to the host's connected Stripe account and then to their bank (Stripe handles the bank payout).

## Setup

The same Stripe account used for payments is used for Connect. No extra env vars are required.

**Important:** Stripe Connect must be enabled in your Stripe Dashboard before hosts can connect:

1. Go to [Stripe Connect](https://dashboard.stripe.com/connect/accounts/overview)
2. Click **Get started** if you haven't completed Connect setup
3. Finish the Connect onboarding (platform profile, verification)

Optional:

```env
# Base URL for Connect redirects (defaults to request origin)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Connect Onboarding

1. Host goes to **Host → Payout Dashboard** (`/host/earnings`).
2. Clicks **Connect Bank Account**.
3. Completes Stripe’s hosted onboarding (identity, bank account).
4. Returns to the Payout Dashboard once done.

## Cash Out

- **Available to cash out** = total completed booking earnings − amount already paid out.
- Minimum cash out: $1.00.
- Host clicks **Cash Out**; a transfer is created to their connected account.
- Bank payouts follow Stripe’s schedule (typically 2–3 business days).

## APIs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/host/connect/account-link` | POST | Create Connect account link for onboarding |
| `/api/host/connect/status` | GET | Check if host has connected Stripe account |
| `/api/host/earnings` | GET | Earnings, available balance, Connect status |
| `/api/host/payouts` | POST | Cash out available balance |
| `/api/host/payouts` | GET | Payout history |

## Stripe Dashboard

- [Connect Overview](https://dashboard.stripe.com/connect/overview) – Connected accounts and balances
- [Transfers](https://dashboard.stripe.com/transfers) – Platform-to-host transfers

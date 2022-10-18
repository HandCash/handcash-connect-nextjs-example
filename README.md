## Run the demo

A demo of this project is available in following link: https://handcash-connect-nextjs-example.vercel.app

## Getting Started

First, create your app at [https://dashboard.handcash.io](https://dashboard.handcash.io) or grab the credentials from your existing app.


Add your app credentials to `.env.local`:

```bash
handcash_app_id=replace-me
handcash_app_secret=replace-me
jwt_secret=very-secret-change-in-prod

```

Install the dependencies:
```bash
npm install
# or
yarn install
```

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tutorial

### Authentication flow

The authentication flow is the following:
1) The user is redirected from your app to HandCash.
2) The user is redirected back to your app with the `authToken` parameter.
3) The endpoint `/api/auth/handcash/success` stores the `authToken` and generates a `sessionToken`
4) The user is redirected to the home page with the `sessionToken` parameter.

```javascript
// pages/api/auth/handcash/success.js
export default async function handler(req, res) {
    const {authToken} = req.query;

    const {publicProfile} = await new HandCashService(authToken).getProfile();

    const payload = {
        sessionId: uuidv4(),
        user: {
            handle: publicProfile.handle,
            displayName: publicProfile.displayName,
            avatarUrl: publicProfile.avatarUrl,
        },
    };
    const sessionToken = SessionTokenRepository.generate(payload);
    AuthTokenRepository.setAuthToken(authToken, payload.sessionId);
    return res.redirect(`/?sessionToken=${sessionToken}`);
}
```

It's important to note that we want to expose the `authToken` as less as possible. This is why we store the token in the server and generate a new session token based on JWT. Also, this approach gives developer flexibility to implement their own authentication system and leave HandCash as an external service rather than the basis for their authentication system.

Another small details to be considered is the way the URL to redirect the user to HandCash is generated:
```javascript
// pages/index.js
export function getServerSideProps({query}) {
    const {sessionToken} = query;
    const redirectionUrl = new HandCashService().getRedirectionUrl();
    ...
}
```

So that our React page can assign the `redirectionUrl` to any element:
```javascript
// pages/index.js
export default function Home({redirectionUrl, sessionToken, user}) {
    ...
    <a href={redirectionUrl} className="...">
        <div>
            <p className="text-lg text-brandLight font-bold">Run this code</p>
            <p className="text-base">Connect your HandCash account to this app to run the code below</p>
        </div>
    </a>
    ...
}
```

### Triggering payments
If the user is authenticated, we want to trigger a payment when they click on "Run this code":
```javascript
// pages/index.js
<div
    className="..." onClick={pay}>
    <p>Run this code</p>
</div>
```

At this point, we need to call an internal API endpoint to trigger the payment:
```javascript
// pages/index.js
const pay = async () => {
    setPaymentResult({status: 'pending'});
    const response = await fetch(
        `/api/pay`,
        {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        }
    );
    setPaymentResult(await response.json());
};
```
Notice that we are sending the `sessionToken` as a Bearer token in the request header.

On the server side, we need to validate the token and get the HandCash `authToken` from our storage:
```javascript
// pages/api/pay.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(404);
    }
    try {
        const {authorization} = req.headers;
        const sessionToken = authorization.replace('Bearer ', '');
        if (!sessionToken) {
            return res.status(401).json({error: 'Missing authorization.'});
        }

        const {sessionId, user} = SessionTokenRepository.verify(sessionToken);
        const authToken = AuthTokenRepository.getById(sessionId);
        if (!authToken) {
            return res.status(401).json({status: 'error', error: 'Expired authorization.'});
        }
        const paymentResult = await new HandCashService(authToken).pay({
            destination: user.handle, amount: 0.05, currencyCode: 'USD'
        });
        return res.status(200).json({status: 'sent', transactionId: paymentResult.transactionId});
    } catch (error) {
        console.error(error);
        return res.status(400).json({status: 'error', message: error.toString()});
    }
}
```
A few things to note here:
- `AuthTokenRepository` stores and manages HandCash authTokens in memory (it's good enough for this demo).
- `SessionTokenRepository` generates and verifies authentication tokens.
- `HandCashService` encapsulates and reuses the logic to interact with HandCash Connect.

```javascript
// src/services/HandCashService.js
import {Environments, HandCashConnect} from "@handcash/handcash-connect";

const appId = process.env.handcash_app_id;
const appSecret = process.env.handcash_app_secret;


const handCashConnect = new HandCashConnect({
    appId: appId,
    appSecret: appSecret,
});

export default class HandCashService {
    constructor(authToken) {
        this.account = handCashConnect.getAccountFromAuthToken(authToken);
    }

    async getProfile(username) {
        return this.account.profile.getCurrentProfile();
    }

    async pay({destination, amount, currencyCode}) {
        return this.account.wallet.pay({
            payments: [
                {destination, amount, currencyCode},
            ],
            description: 'Testing Connect SDK',
        });
    }

    getRedirectionUrl() {
        return handCashConnect.getRedirectionUrl();
    }
}
```

### Learn More

To learn more about HandCash Connect, take a look at the following resources:

- [HandCash Connect Documentation](https://docs.handcash.io/docs/overview-1) - learn about their main features.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

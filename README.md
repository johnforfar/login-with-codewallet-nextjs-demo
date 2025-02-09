# Login with CodeWallet Next.js Demo

This project demonstrates how to integrate Code Wallet login into a Next.js application. It uses the following three packages:
- **@code-wallet/client** – for interacting with Code Wallet functionality (login intents, getting status, etc.)
- **@code-wallet/elements** – for adding built-in UI elements (login button, etc.)
- **@code-wallet/keys** – for generating and managing keypairs

The demo provides a complete flow from rendering a login button, creating a login intent on the server side, to handling the successful login callback and retrieving the logged-in user’s public key. The project is split into API endpoints (using Next.js API routes) and a client-side login page.

## Table of Contents

- [Features](#features)
- [File Structure](#file-structure)
- [Installation and Setup](#installation-and-setup)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [How It Works](#how-it-works)
- [License](#license)

## Features

- **Login Flow:** Renders a login button using Code Wallet’s UI elements.
- **Login Intent Creation:** On button invoke, calls an API endpoint to create a login intent.
- **Success Handling:** A success API route validates the login, retrieves the intent status, and returns the logged-in user’s public key.
- **Key Management:** Uses a fixed key (in test mode) or generates a keypair using the environment variable configuration.
- **Next.js Implementation:** Implements the UI and API endpoints as Next.js pages and API routes.

## File Structure

Below is an example file structure for the Next.js project:

```
login-with-codewallet-nextjs-demo/
├── node_modules/
├── pages/
│ ├── api/
│ │ ├── code-payments.ts // Returns public keys for Code Wallet payments (rewritten from /.well-known/code-payments.json)
│ │ └── login/
│ │ ├── index.ts // GET: returns the login domain and verifier public key
│ │ ├── create-intent.ts // GET: creates a login intent via Code Wallet's API
│ │ └── success/
│ │ └── [id].ts // GET: handles the success callback and returns intent status and user public key as JSON
│ ├── index.tsx // Redirects to /login
│ └── login.tsx // Renders the login page with the Code Wallet login button
├── public/
│ └── hex-icon.svg // Logo image used on the login page
├── next.config.js // Next.js configuration with rewrites for /.well-known/code-payments.json
├── package.json // Dependencies and scripts
├── tsconfig.json // TypeScript configuration
├── next-env.d.ts // Next.js TypeScript declaration file
├── LICENSE // MIT License file
└── README.md // This file
```

## Installation and Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/login-with-codewallet-nextjs-demo.git
   cd login-with-codewallet-nextjs-demo
   ```

2. **Install Dependencies**

   Use npm or yarn:

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Setup Environment Variables**

   Create a `.env.local` file in the root of your project with the following variables:

   ```env
   # Set to "true" for test mode. When false, production settings apply.
   TEST_MODE=true

   # (Optional) In production, provide a Base58-encoded secret key for your verifier.
   STORE_VERIFIER_SECRET=your_base58_encoded_secret_key

   # The domain used for login intents (used when not in TEST_MODE). Example: "kin.games"
   NEXT_PUBLIC_STORE_HOSTNAME=your_domain_here
   ```

   > For test mode, the project uses a fixed secret key (hardcoded in the API files). In production, if `STORE_VERIFIER_SECRET` is not provided, a new keypair is generated automatically.

4. **Run the Development Server**

   Start the Next.js development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Open [http://localhost:3002](http://localhost:3002) in your browser (or the port specified by your environment) and you will be redirected to `/login`.

## Environment Variables

- **TEST_MODE**:  
  - Set to `"true"` when testing to use a fixed secret key.  
  - Set to `"false"` in production.  
- **STORE_VERIFIER_SECRET**:  
  - (Optional) Provide a Base58-encoded secret key.  
  - If not set in production, a new keypair is generated.  
- **NEXT_PUBLIC_STORE_HOSTNAME**:  
  - The domain string used during login intent creation.  
  - Defaults to `"kin.games"` if unspecified and not in test mode.

## API Endpoints

### GET `/api/login`
- **Purpose:** Returns the login domain and the verifier public key.  
- **Response Example:**

  ```json
  {
    "domain": "example-getcode.com",
    "verifier": "C6M1oHqNQeuALNq9N68bIRQ2uFSMNiGnd2dwLnozebEG"
  }
  ```

### GET `/api/login/create-intent`
- **Purpose:** Creates a login intent using Code Wallet’s SDK.  
- **How it Works:**  
  - The endpoint builds a login intent with parameters such as mode ("login"), domain, verifier public key, and uses the generated clientSecret.  
- **Response Example:**

  ```json
  {
    "clientSecret": "client_secret_value_here",
    "id": "F7LaESrj3m1KqB2a6aU1xDj9Erhh4WDYLaZQmg9oWU37"
  }
  ```

### GET `/api/login/success/[id]`
- **Purpose:** Handles the successful login callback and returns the intent status and the logged-in user's public key.  
- **How it Works:**  
  - Uses Code Wallet’s `getStatus` and `getUserId` functions with the verifier key to verify the login and retrieve the user’s public key.
- **Response Example:**

  ```json
  {
    "intent": "F7LaESrj3m1KqB2a6aU1xDj9Erhh4WDYLaZQmg9oWU37",
    "status": {
      "status": "confirmed",
      "exists": true,
      "codeScanned": true,
      "intentSubmitted": true
    },
    "user": {
      "userId": "6D7fPwv2bATaR4ZpJv7j6mVc3FSKjmdXZzb7uajTYzX5"
    }
  }
  ```

### Additional Endpoints

- **GET `/api/code-payments` (via Rewrite)**
  - Returns public keys for Code Wallet payments.  
  - Exposed under the path `/.well-known/code-payments.json` thanks to Next.js rewrites in `next.config.js`.

- **POST `/api/create-intent`**
  - (Separate payment intent endpoint) Demonstrates how to create payment intents.
  - Consult the code comments for details on payload and webhook registration.

## How It Works

1. **Login Page (`/login`):**

   - The `/login` page (pages/login.tsx) uses the Code Wallet Elements SDK to create and mount a login button.
   - When the component mounts, it fetches login parameters from `/api/login`.
   - On button "invoke", it calls the `/api/login/create-intent` endpoint to generate a new login intent, receives a clientSecret, and updates the button so that the Code Wallet login process can proceed.
   - The confirm parameters specify a URL pattern (`/api/login/success/{{INTENT_ID}}`) where Code Wallet will redirect after a successful login.

2. **Intent Success Endpoint:**

   - After login, Code Wallet redirects to `/api/login/success/[id]` where `[id]` is the intent id.
   - This endpoint uses the Code Wallet client functions (`getStatus` and `getUserId`) along with the verifier key to verify the login and retrieve the user’s public key.
   - The JSON output confirms the login intent status and returns the `userId` (which is the user’s public key).

3. **Environment Configuration:**

   - In test mode, a fixed secret key (hardcoded) is used so that outcomes are consistent.
   - In production, if `STORE_VERIFIER_SECRET` is not provided, a new keypair is generated on the fly.

## Additional Files

- **next.config.js:**  
  Contains a rewrite rule to expose `/api/code-payments` as `/.well-known/code-payments.json`.

- **pages/index.tsx:**  
  A simple redirect page that sends users to `/login`.

- **Archival Files:**  
  There are archived files (e.g., `backend.ts.TXT`, `frontend.ts.LEGACY`) which show similar implementations in an Express.js environment. They are provided for reference only.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

Happy coding and thank you for using our CodeWallet Next.js Demo!
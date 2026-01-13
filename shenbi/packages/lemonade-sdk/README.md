# Lemonade SDK

TypeScript SDK for the Lemonade API.

## Installation

```bash
npm install @lemonade/sdk
# or
yarn add @lemonade/sdk
```

## Quick Start

```typescript
import { LemonadeClient } from '@lemonade/sdk';

// Initialize client with your API key
const client = new LemonadeClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.gigaboo.sg', // optional, defaults to production
});

// Sign up a new user
const tokens = await client.auth.signup({
  email: 'user@example.com',
  password: 'securepassword',
  name: 'John Doe',
});

// Set access token for authenticated requests
client.setAccessToken(tokens.access_token);

// Get current user
const user = await client.auth.me();
console.log('Logged in as:', user.email);
```

## Authentication

### Email/Password Login

```typescript
const tokens = await client.auth.login({
  email: 'user@example.com',
  password: 'password',
});
client.setAccessToken(tokens.access_token);
```

### Google Sign-In

```typescript
// After getting Google ID token from frontend
const tokens = await client.auth.loginWithGoogle({
  id_token: 'google-id-token',
});
client.setAccessToken(tokens.access_token);
```

### Device/Anonymous Login

```typescript
const tokens = await client.auth.loginWithDevice({
  device_id: 'unique-device-id',
});
client.setAccessToken(tokens.access_token);
```

### Token Refresh

```typescript
const newTokens = await client.auth.refresh({
  refresh_token: tokens.refresh_token,
});
client.setAccessToken(newTokens.access_token);
```

## Subscriptions

```typescript
// List available plans
const plans = await client.subscriptions.listPlans();

// Get current subscription
const subscription = await client.subscriptions.getCurrent();

// Create checkout session for upgrade
const checkout = await client.subscriptions.createCheckout(
  planId,
  'https://myapp.com/success',
  'https://myapp.com/cancel'
);
// Redirect user to checkout.url
```

## Organizations

```typescript
// Create an organization
const org = await client.organizations.create({
  name: 'My Team',
  slug: 'my-team',
});

// Switch to organization context
const orgTokens = await client.auth.switchOrg({
  organization_id: org.id,
});
client.setAccessToken(orgTokens.access_token);

// Invite a member
await client.organizations.createInvitation({
  email: 'teammate@example.com',
  role: 'member',
});
```

## Storage

```typescript
// Upload a file
const result = await client.storage.upload({
  file: fileBlob,
  folder: 'documents',
});

// Get signed URL for download
const { url } = await client.storage.getSignedUrl(result.path);
```

## Email

```typescript
// Send email using template
await client.email.sendTemplate({
  to: 'user@example.com',
  template_name: 'welcome',
  variables: {
    name: 'John',
  },
});
```

## Google Workspace

```typescript
// Check Drive connection status
const status = await client.drive.status();

if (!status.connected) {
  // Redirect user to auth URL
  const { auth_url } = await client.drive.getAuthUrl();
  window.location.href = auth_url;
}

// List files
const files = await client.drive.listFiles();

// Get document content
const doc = await client.workspace.getDocumentText('document-id');

// Get spreadsheet values
const values = await client.workspace.getSheetValues('spreadsheet-id', 'Sheet1!A1:D10');
```

## Error Handling

```typescript
import { ApiError } from '@lemonade/sdk';

try {
  await client.auth.login({ email: 'wrong@email.com', password: 'wrong' });
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.status, error.message);
  }
}
```

## Regenerating the SDK

If the API changes, regenerate the SDK:

```bash
npm run generate
npm run build
```

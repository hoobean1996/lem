# Lemonade SDK API Reference

## Installation

```bash
npm install @lemonade/sdk
```

## Quick Start

```typescript
import { LemonadeClient } from '@lemonade/sdk';

const client = new LemonadeClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.gigaboo.sg', // optional
});

// After user authentication
client.setAccessToken(accessToken);
```

---

## Client Methods

### `setAccessToken(token: string)`
Set the JWT access token for authenticated requests.

### `clearAccessToken()`
Clear the access token (logout).

### `accessToken`
Get the current access token.

---

## Authentication (`client.auth`)

### `signup(data: UserCreate)`
Register a new user account.

```typescript
const result = await client.auth.signup({
  email: 'user@example.com',
  password: 'securepassword',
  name: 'John Doe'  // optional
});
```

### `login(data: UserLogin)`
Login with email and password.

```typescript
const tokens = await client.auth.login({
  email: 'user@example.com',
  password: 'password'
});
// Returns: { access_token, refresh_token, token_type }

client.setAccessToken(tokens.access_token);
```

### `loginWithDevice(data: DeviceLogin)`
Login with device ID (anonymous authentication).

```typescript
const tokens = await client.auth.loginWithDevice({
  device_id: 'unique-device-identifier'
});
```

### `loginWithGoogle(data: GoogleAuthRequest)`
Login with Google OAuth.

```typescript
const tokens = await client.auth.loginWithGoogle({
  id_token: 'google-id-token'
});
```

### `refresh(data: RefreshTokenRequest)`
Refresh access token.

```typescript
const tokens = await client.auth.refresh({
  refresh_token: 'your-refresh-token'
});
```

### `me()`
Get current authenticated user.

```typescript
const user = await client.auth.me();
// Returns: { id, email, name, created_at, ... }
```

### `switchOrg(data: SwitchOrgRequest)`
Switch to a different organization context.

```typescript
await client.auth.switchOrg({
  organization_id: 123
});
```

### `clearOrg()`
Clear organization context.

### `revoke(googleToken?: string)`
Revoke current token.

### `checkLicense()`
Check user's license status.

---

## Subscriptions (`client.subscriptions`)

### `listPlans()`
List all available subscription plans.

```typescript
const plans = await client.subscriptions.listPlans();
// Returns: Array of { id, name, price_cents, billing_interval, features, ... }
```

### `getCurrent()`
Get current user's subscription.

```typescript
const subscription = await client.subscriptions.getCurrent();
// Returns: { id, plan_id, status, current_period_end, ... } or null
```

### `createCheckout(planId: number, successUrl: string, cancelUrl: string)`
Create a Stripe checkout session.

```typescript
const checkout = await client.subscriptions.createCheckout(
  1,  // plan ID
  'https://myapp.com/success',
  'https://myapp.com/cancel'
);
// Returns: { checkout_url }
window.location.href = checkout.checkout_url;
```

### `createPortal(returnUrl: string)`
Create a Stripe customer portal session.

```typescript
const portal = await client.subscriptions.createPortal('https://myapp.com/settings');
// Returns: { portal_url }
```

---

## Organizations (`client.organizations`)

### `create(data: OrganizationCreate)`
Create a new organization.

```typescript
const org = await client.organizations.create({
  name: 'My Company',
  slug: 'my-company'  // optional, auto-generated if not provided
});
```

### `list()`
List user's organizations.

```typescript
const result = await client.organizations.list();
// Returns: { organizations: [...] }
```

### `getCurrent()`
Get current organization (requires org context).

### `update(data: OrganizationUpdate)`
Update current organization.

```typescript
await client.organizations.update({
  name: 'New Name'
});
```

### `delete()`
Delete current organization.

### `listMembers()`
List organization members.

```typescript
const members = await client.organizations.listMembers();
// Returns: Array of { user_id, role, user: {...} }
```

### `updateMemberRole(userId: number, data: MemberRoleUpdate)`
Update a member's role.

```typescript
await client.organizations.updateMemberRole(123, {
  role: 'admin'  // 'owner', 'admin', or 'member'
});
```

### `removeMember(userId: number)`
Remove a member from organization.

### `leave()`
Leave current organization.

### `createInvitation(data: InvitationCreate)`
Create an invitation.

```typescript
const invitation = await client.organizations.createInvitation({
  email: 'newmember@example.com',
  role: 'member'
});
// Returns: { id, code, ... }
```

### `listInvitations()`
List pending invitations.

### `revokeInvitation(invitationId: number)`
Revoke an invitation.

### `acceptInvitation(data: InvitationAccept)`
Accept an invitation.

```typescript
await client.organizations.acceptInvitation({
  code: 'invitation-code'
});
```

### `checkout(planId, successUrl, cancelUrl)`
Create checkout for organization subscription.

### `portal(returnUrl)`
Create portal for organization billing.

### `getSubscription()`
Get organization's subscription.

---

## Storage (`client.storage`)

### `status()`
Get storage configuration status.

```typescript
const status = await client.storage.status();
// Returns: { configured: boolean, provider: string }
```

### `upload(formData: { file: Blob, folder?: string })`
Upload a file to user's storage.

```typescript
const result = await client.storage.upload({
  file: fileBlob,
  folder: 'documents'  // optional
});
// Returns: { path, url }
```

### `uploadShared(formData: { file: Blob, folder?: string })`
Upload to shared/public storage.

### `uploadJson(data: JsonUploadRequest)`
Upload JSON data as a file.

```typescript
const result = await client.storage.uploadJson({
  path: 'data/config.json',
  data: { key: 'value' }
});
```

### `download(path: string)`
Download a file.

```typescript
const blob = await client.storage.download('documents/file.pdf');
```

### `downloadJson(path: string)`
Download and parse JSON file.

```typescript
const data = await client.storage.downloadJson('data/config.json');
```

### `getSignedUrl(path: string, expiresIn?: number)`
Get a signed URL for temporary access.

```typescript
const result = await client.storage.getSignedUrl('documents/file.pdf', 3600);
// Returns: { url, expires_at }
```

### `listFiles(folder?: string, prefix?: string)`
List user's files.

```typescript
const files = await client.storage.listFiles('documents');
// Returns: Array of { name, path, size, ... }
```

### `listSharedFiles(folder?: string, prefix?: string)`
List shared files.

### `delete(path: string)`
Delete a file.

---

## Email (`client.email`)

### `status()`
Get email configuration status.

```typescript
const status = await client.email.status();
// Returns: { success: boolean, provider: string }
```

### `listTemplates()`
List email templates.

### `createTemplate(data: EmailTemplateCreate)`
Create an email template.

```typescript
const template = await client.email.createTemplate({
  name: 'welcome',
  subject: 'Welcome to {{app_name}}!',
  html_content: '<h1>Hello {{name}}</h1>',
  text_content: 'Hello {{name}}'
});
```

### `getTemplate(templateId: number)`
Get a template by ID.

### `updateTemplate(templateId: number, data: EmailTemplateUpdate)`
Update a template.

### `deleteTemplate(templateId: number)`
Delete a template.

### `send(data: SendEmailRequest)`
Send an email.

```typescript
await client.email.send({
  to: 'user@example.com',
  subject: 'Hello',
  html_content: '<p>Hello World</p>',
  text_content: 'Hello World'
});
```

### `sendTemplate(data: SendTemplateEmailRequest)`
Send an email using a template.

```typescript
await client.email.sendTemplate({
  to: 'user@example.com',
  template_id: 1,
  variables: {
    name: 'John',
    app_name: 'MyApp'
  }
});
```

### `preview(data: EmailPreviewRequest)`
Preview a template with variables.

---

## Google Drive (`client.drive`)

### `status()`
Check if Google Drive is connected.

```typescript
const status = await client.drive.status();
// Returns: { connected: boolean, email?: string }
```

### `getAuthUrl(redirectUri?: string)`
Get Google OAuth URL for Drive connection.

### `disconnect()`
Disconnect Google Drive.

### `listFiles(pageSize?, pageToken?, folderId?, mimeType?)`
List files in Drive.

```typescript
const result = await client.drive.listFiles(20);
// Returns: { files: [...], next_page_token }
```

### `getFile(fileId: string)`
Get file metadata.

### `search(q: string, pageSize?, pageToken?)`
Search files.

```typescript
const result = await client.drive.search('quarterly report');
```

### `export(fileId: string, data: ExportFileRequest)`
Export a Google Doc/Sheet/Slide to another format.

### `share(fileId: string, data: ShareFileRequest)`
Share a file.

### `listFolders(folderId?, pageSize?, pageToken?)`
List folders.

### `listDocuments(pageSize?, pageToken?)`
List Google Docs.

### `listSpreadsheets(pageSize?, pageToken?)`
List Google Sheets.

### `listPresentations(pageSize?, pageToken?)`
List Google Slides.

---

## Google Workspace (`client.workspace`)

### Google Docs

#### `getDocument(documentId: string)`
Get full document data.

#### `getDocumentText(documentId: string)`
Get document as plain text.

```typescript
const text = await client.workspace.getDocumentText('doc-id');
// Returns: { text: "..." }
```

#### `getDocumentStructure(documentId: string)`
Get document structure (headings, paragraphs).

### Google Sheets

#### `getSpreadsheet(spreadsheetId: string)`
Get spreadsheet metadata.

#### `getSheetValues(spreadsheetId: string, range?: string)`
Get cell values.

```typescript
const values = await client.workspace.getSheetValues('sheet-id', 'Sheet1!A1:D10');
// Returns: { values: [[...], [...]] }
```

#### `getSheetValuesBatch(spreadsheetId: string, ranges: string[])`
Get multiple ranges at once.

```typescript
const result = await client.workspace.getSheetValuesBatch('sheet-id', [
  'Sheet1!A1:B10',
  'Sheet2!A1:C5'
]);
```

### Google Slides

#### `getPresentation(presentationId: string)`
Get full presentation data.

#### `getPresentationSummary(presentationId: string)`
Get presentation summary (slide count, titles).

#### `getSlide(presentationId: string, slideIndex: number)`
Get specific slide.

#### `getPresentationText(presentationId: string)`
Get all text from presentation.

---

## Error Handling

All methods throw errors on failure. Handle them with try/catch:

```typescript
try {
  const user = await client.auth.me();
} catch (error) {
  if (error.status === 401) {
    // Token expired, refresh or re-login
  } else if (error.status === 403) {
    // Access denied
  } else {
    console.error('Error:', error.message);
  }
}
```

---

## TypeScript Types

All request/response types are exported:

```typescript
import {
  LemonadeClient,
  UserCreate,
  UserLogin,
  TokenResponse,
  User,
  SubscriptionPlan,
  Organization,
  // ... and more
} from '@lemonade/sdk';
```

---

## Full Example

```typescript
import { LemonadeClient } from '@lemonade/sdk';

const client = new LemonadeClient({
  apiKey: process.env.LEMONADE_API_KEY!,
  baseUrl: 'https://api.gigaboo.sg',
});

async function main() {
  // Login
  const tokens = await client.auth.login({
    email: 'user@example.com',
    password: 'password'
  });
  client.setAccessToken(tokens.access_token);

  // Get user info
  const user = await client.auth.me();
  console.log(`Logged in as ${user.email}`);

  // List subscription plans
  const plans = await client.subscriptions.listPlans();
  console.log(`Available plans: ${plans.length}`);

  // Upload a file
  const file = new Blob(['Hello World'], { type: 'text/plain' });
  const upload = await client.storage.upload({ file, folder: 'test' });
  console.log(`Uploaded to: ${upload.path}`);

  // Send an email
  await client.email.send({
    to: 'recipient@example.com',
    subject: 'Test',
    html_content: '<p>Hello from Lemonade!</p>'
  });
}

main();
```

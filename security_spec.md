# Security Specification (TDD) - David Hair Blog

## Data Invariants

1. **BlogPost Invariants**:
   - `title`: must be a string between 1 and 200 characters.
   - `content`: must be a string up to 50000 characters.
   - `category`: must be a string between 1 and 50 characters.
   - `publishDate`: must be a string length <= 50.
   - `author`: must be a string between 2 and 50 characters.
   - `readTime`: must be a string between 1 and 20 characters.
   - `imgUrl`: must be a string starting with "http://" or "https://", size <= 500.
2. **Category Invariants**:
   - `name`: must be a unique non-empty string between 1 and 50 characters.
3. **Identity & Authorization**:
   - Public can `get` and `list` any blog post or category.
   - Modifying (create, update, delete) `blogs` and `categories` is strictly restricted to authenticated Administrators.
   - The primary bootstrapped Administrator is verified by email matching `"hankyleisplay@gmail.com"`.
   - Admin check requires Google authenticated user with a verified email (`request.auth.token.email_verified == true`).

---

## The "Dirty Dozen" Payloads

1. **BlogPost Identity Spoofing (Create)**:
   An unauthenticated threat actor attempts to write a new blog document directly to `/blogs/malicious_node`.
   - **Payload**: `{ "title": "Evil Title", "content": "Evil Content", "category": "最新消息", "author": "Hacker", "publishDate": "2026-05-24" }`
   - **Response**: `PERMISSION_DENIED`

2. **Verified Email Hijacking (Create)**:
   An authenticated user signs in with a fake email `hankyleisplay@gmail.com` but has `email_verified == false` (e.g. self-assigned provider without verification).
   - **Payload**: `{ "title": "Unverified Post", "content": "Click here", "category": "最新消息", "author": "David", "publishDate": "2026-05-24" }`
   - **Response**: `PERMISSION_DENIED`

3. **Wrong Author Privilege Escalation (Create)**:
   A standard authenticated customer attempts to post an article by logging in as themselves but passing themselves off as David.
   - **Payload**: `{ "title": "David writes", "content": "Fake", "category": "最新消息", "author": "David", "publishDate": "2026-05-24" }`
   - **Response**: `PERMISSION_DENIED`

4. **Category Creation Spam (Create)**:
   An anonymous user attempts to call `create` on `/categories/junk_cat` with a oversized string to consume storage quota.
   - **Payload**: `{ "name": "JunkCategoryA..." (over 10KB) }`
   - **Response**: `PERMISSION_DENIED`

5. **Resource Poisoning via ID (Create)**:
   An admin attempts to inject a oversized ID full of malicious binary symbols into the `blogs` collection.
   - **Path**: `/blogs/!@#$%^&*()_+_OVERSIZE_ID_1234567890_OVERSIZE_ID_1234567890_OVERSIZE_ID_1234567890`
   - **Response**: `PERMISSION_DENIED` (`isValidId` check fails)

6. **Blog Value Poisoning (Update)**:
   An attacker tries to update the `readTime` field of an existing post with a huge string payload.
   - **Payload**: `{ "readTime": "a".repeat(10000) }`
   - **Response**: `PERMISSION_DENIED` (due to size boundaries in validator)

7. **Ghost Field Injection / Shadow Update (Update)**:
   An attacker submits a patch that includes a valid update but injects an un-whitelisted ghost/shadow key `"isAdminOverride": true` or `"likesCount": 9999`.
   - **Payload**: `{ "title": "New Title", "isAdminOverride": true }`
   - **Response**: `PERMISSION_DENIED` (`hasOnly()` fails)

8. **Category Deletion Bypass (Delete)**:
   An unauthorized user attempts to delete a category directly bypassing the client application validations.
   - **Path**: `/categories/latest_news`
   - **Response**: `PERMISSION_DENIED`

9. **BlogPost Deletion Hack (Delete)**:
   An unauthenticated script attempts to trigger a batch delete across all `/blogs/{id}` paths.
   - **Path**: `/blogs/some_id`
   - **Response**: `PERMISSION_DENIED`

10. **Terminal State Locking Override**:
    An authorized admin attempts to edit a blog post that has been officially archived or locked (`status == "locked"`), where writing is blocked.
    - **Payload**: Updating title of locked document.
    - **Response**: `PERMISSION_DENIED`

11. **Type Safety Bypass (Create)**:
    An attacker sends an object where `title` is a Boolean (`true`) or an Object instead of a string.
    - **Payload**: `{ "title": true, "content": "Some Content" }`
    - **Response**: `PERMISSION_DENIED`

12. **Null/Missing Fields (Create)**:
    An attacker attempts to write a blog post with missing required fields to cause the reader app to crash.
    - **Payload**: `{ "title": "Only Title" }`
    - **Response**: `PERMISSION_DENIED`

---

## The Test Runner: firestore.rules.test.ts

```typescript
import { 
  initializeTestEnvironment, 
  RulesTestEnvironment, 
  assertFails, 
  assertSucceeds 
} from '@firebase/rules-unit-testing';
import { doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

describe("David Hair Blog Security Rules", () => {
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "project-87419f9c-79db-46c2-a29",
      firestore: {
        host: "localhost",
        port: 8080,
      }
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  it("denies unauthenticated writes to blogs", async () => {
    const unauthDb = testEnv.unauthenticatedContext().firestore();
    const ref = doc(unauthDb, "blogs/post-1");
    await assertFails(setDoc(ref, {
      title: "Evil Post",
      content: "Evil Content",
      category: "最新消息",
      author: "Hacker",
      publishDate: "2026-05-24"
    }));
  });

  it("denies authenticated non-admin writes", async () => {
    const userDb = testEnv.authenticatedContext("user123", { email: "user@example.com", email_verified: true }).firestore();
    const ref = doc(userDb, "blogs/post-1");
    await assertFails(setDoc(ref, {
      title: "Evil Post",
      content: "Evil Content",
      category: "最新消息",
      author: "Hacker",
      publishDate: "2026-05-24"
    }));
  });

  it("allows verified bootstrapped admin to write and update blogs", async () => {
    const adminDb = testEnv.authenticatedContext("admin123", { email: "hankyleisplay@gmail.com", email_verified: true }).firestore();
    const ref = doc(adminDb, "blogs/post-1");
    await assertSucceeds(setDoc(ref, {
      title: "Valid Title",
      content: "This is valid markdown content of the post.",
      category: "最新消息",
      excerpt: "Excerpt of post",
      author: "大衛哥",
      publishDate: "2026-05-24",
      readTime: "3 min",
      imgUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
    }));
  });
});
```

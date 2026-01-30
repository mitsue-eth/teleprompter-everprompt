# Cloud Storage & Database Setup — Reminder & Next Steps

This doc summarizes what’s already implemented for cloud storage and what you need to do to connect the database and use it. It also clarifies how “where to store scripts” (online / locally / both) works today and what’s missing.

---

## 1. What’s Already Implemented

### Database (Prisma)

- **Schema** (`prisma/schema.prisma`):
  - **User**: `id`, `name`, `email`, etc. + `plan`, `planExpiresAt`, `stripeCustomerId`, `stripeSubscriptionId`
  - **Script**: `id`, `name`, `content`, `status`, `characterCount`, `userId`, timestamps
  - NextAuth models: `Account`, `Session`, `VerificationToken`

- **API**:
  - `GET /api/scripts` — list current user’s cloud scripts
  - `POST /api/scripts` — create a cloud script
  - `GET /api/scripts/[id]` — get one script
  - `PUT /api/scripts/[id]` — update script
  - `DELETE /api/scripts/[id]` — delete script

- **Auth**: NextAuth with Prisma adapter, email (Resend) sign-in. Session includes `plan` and `planExpiresAt` (read from DB in JWT callback).

### App behavior (scripts)

- **Local scripts**: Stored in `localStorage` only; work offline and when signed out.
- **Cloud scripts**: Stored in PostgreSQL via `/api/scripts`; loaded when the user is signed in.
- **Unified list**: `useScripts` merges local + cloud into one list; each script has `storageType: "local" | "cloud"`.
- **Per-script actions** (when signed in):
  - **Move to Cloud**: copy a local script to the API → it becomes a cloud script (local copy removed from sidebar list but you could keep a local copy if we add “online and locally”).
  - **Move to Local**: download a cloud script and add it to `localStorage`, then delete it from the API.
- **New script**: Uses a **default storage** (`getDefaultStorage()`): either `"local"` or `"cloud"`. That default is stored in `localStorage` under `teleprompter-default-storage`. Right now:
  - Signed out → default is **local**
  - Signed in → default is **cloud** (unless the user has previously chosen local via code/localStorage)
- **Limits** (`lib/limits.ts`): Free = 5 cloud scripts, 15k chars/script; Pro = 500 cloud scripts, unlimited length. Shield in header shows plan and usage. (Limits are not yet enforced in the API; that’s a follow-up.)

So today:

- You **can** store scripts **only locally** (don’t sign in, or set default to local and only create local / move to local).
- You **can** store scripts **only online** (sign in, set default to cloud, and only create/move to cloud — and optionally “move to local” would remove from cloud; currently “move to local” copies then deletes from cloud).
- You **can** have **both** (some local, some cloud) and choose per script via “Move to Cloud” / “Move to Local”.

What’s **not** in the UI yet:

- A setting for **“Default for new scripts”** (Local vs Cloud) after login.
- An explicit **“Storage mode”** (e.g. “Local only” / “Cloud only” / “Both, default: …”). That can be added later as a wrapper around the same default + behavior.

---

## 2. What You Need to Do (Database & Env)

### Step 1: Database

1. **PostgreSQL**: Have a Postgres database (local or hosted, e.g. Supabase, Neon, Railway).
2. **Env**: In `.env` (or `.env.local`), set:
   ```bash
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
   ```
3. **Prisma**:
   - Generate the client (so `plan`, `planExpiresAt`, etc. exist and the auth route compiles):
     ```bash
     npx prisma generate
     ```
   - Create and apply migrations so the DB has the same schema as `prisma/schema.prisma`:
     ```bash
     npx prisma migrate dev --name init
     ```
     (If you already ran migrations before adding `plan` / `characterCount`, use a new migration name, e.g. `add_plan_and_script_fields`.)

### Step 2: Auth (email sign-in)

For email sign-in you need:

- `RESEND_API_KEY` — from Resend
- `EMAIL_FROM` — sender address (e.g. `onboarding@resend.dev` or your domain)
- `NEXTAUTH_SECRET` — random string for JWT/session signing
- `NEXTAUTH_URL` — e.g. `http://localhost:3000` (dev) or your production URL

Without these, sign-in will fail when the app tries to send the magic link.

### Step 3: Verify

- Run the app, open sign-in, request a magic link. Check DB for a new user and session.
- Create a script with “default” = cloud: it should appear in the sidebar and be stored in the `Script` table. Check with e.g. `npx prisma studio` or `SELECT * FROM "Script";`.

---

## 3. “Where to store scripts” — Online / Locally / Both

You said you want, after login, to be able to **select where to store them: online, locally only, or online and locally**.

- **Locally only**: Use default storage = Local. No UI yet; you can set it in code or add a setting (see below).
- **Online only**: Use default storage = Cloud; only create/move scripts to cloud. “Move to Local” currently removes from cloud (copy + delete).
- **Online and locally**: Today = “both” in the sense that some scripts are cloud and some local, and you can move between them. “Online and locally” in the sense of “same script in both places” (sync) is **not** implemented — right now each script is either local **or** cloud.

To get **explicit control after login**, the missing piece is **UI for the default storage**:

1. **Settings or Shield dialog**: Add a control “New scripts: Local / Cloud” that calls `setDefaultStorage("local")` or `setDefaultStorage("cloud")` and persists in `localStorage`. That gives “store new scripts online vs locally” after login.
2. (Optional) Later: “Storage mode” = “Local only” | “Cloud only” | “Both (choose default)” that just sets that default and maybe hides or disables the other option.

If you want, next step can be: add that “Default for new scripts: Local | Cloud” control (e.g. in the Shield dialog or in Settings under General Preferences) and wire it to `getDefaultStorage` / `setDefaultStorage`.

---

## 4. Quick reference

| Topic               | Status / Action                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------ |
| Prisma schema       | Done (User + Script + plan, characterCount)                                                |
| Migrations          | You run: `npx prisma migrate dev`                                                          |
| Prisma client       | You run: `npx prisma generate` (fixes auth route build)                                    |
| Env                 | You set: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `RESEND_API_KEY`, `EMAIL_FROM` |
| Cloud API           | Done (`/api/scripts`, `/api/scripts/[id]`)                                                 |
| Local + cloud list  | Done (`useScripts` merges both)                                                            |
| Move to Cloud/Local | Done (per-script in sidebar dropdown)                                                      |
| Default for new     | Implemented in code (local vs cloud), **no UI** yet                                        |
| Limits (free/pro)   | Defined in `lib/limits.ts`; API enforcement not done yet                                   |
| Stripe              | Not implemented (plan is in DB, no billing yet)                                            |

---

## 5. Enforcing free/pro limits (later)

When you’re ready:

- In `POST /api/scripts`: load user’s `plan` (from DB or session), get current cloud script count, and if `!canCreateCloudScript(plan, count)` return 403 with a clear message.
- Optionally check `characterCount` for new/update and enforce `isScriptOverLimit(plan, content.length)` for free users.
- Front-end already uses `useUserLimits` and Shield; you can disable “Move to Cloud” / “New script → cloud” when at limit and show the Upgrade dialog.

This doc is the reminder and checklist; the only **required** steps for “connect cloud storage and use it” are: env, `prisma generate`, and `prisma migrate dev`. Adding the “Default for new scripts” UI is the next step for “select where to store them (online / locally / both)” after login.

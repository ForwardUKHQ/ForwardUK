# Forward UK V3 — SQL + Motion

A flat-file Forward UK party website, Member Area and Control Room. Every file lives at the repository root; there are **no folders**.

## V3 highlights
- Real PostgreSQL / Supabase schema in `schema.sql`
- Supabase adapter with live public content sync and authenticated Control Room writes
- SQL-backed free membership registration and member verification when configured
- SQL-backed contact messages
- Public stats calculated from database records
- Local browser fallback if SQL is not configured
- New scroll-reveal motion, hero animation, floating brand accents and animated pledge panel
- New transparent Forward UK pledge graphic: `forward-uk-stop-the-boats.png`
- Control Room database status indicator and manual sync button
- SQL-admin login support plus local PIN fallback for prototyping
- Homepage toggle for the manifesto pledge graphic
- Existing spacious responsive design retained
- No donations, payments or fundraising
- No live election/results/projection system

## Blank organisation data
The database and local defaults intentionally start at:
- Members: **0**
- MPs: **0**
- Councillors: **0**
- Mayors: **0**
- Representatives: **0**
- Candidates: **0**
- Constituencies: **0**
- Local branches: **0**
- Volunteers: **0**

Policies, manifestos, news, events, documents, leadership profiles, FAQs and history records also start empty.

## Local prototype mode
Open `index.html` for the public site and `control-room.html` for the Control Room.

Local Control Room PIN: `2029`

This mode uses browser storage only. It is useful for testing before Supabase is configured.

## Turn on SQL / Supabase
1. Create a new Supabase project.
2. Open Supabase **SQL Editor**.
3. Run the entire `schema.sql` file.
4. In Supabase Authentication, create your Control Room admin user.
5. Copy that user's UUID.
6. Run the admin promotion SQL shown at the bottom of `schema.sql`, replacing `YOUR-AUTH-USER-UUID`.
7. Open `supabase-config.js` and paste the project URL and **anon/public key**.
8. Never paste the `service_role` key into this website.
9. Publish the files to GitHub Pages or another static host.
10. Open `control-room.html` and sign in with the Supabase admin email/password.

When SQL is configured, the public website loads published records from PostgreSQL. Control Room changes made through an authenticated SQL admin account are written back to the database.

## SQL security
`schema.sql` enables Row Level Security. Public visitors can read public/published site content, register for free membership through a restricted SQL function, verify their own membership using email + member number, and submit contact messages. Direct access to member/contact records is restricted to authorised staff roles.

Available staff roles:
- `admin`
- `editor`
- `membership`
- `viewer`

## Important production note
Email + member number is intentionally a lightweight member verification flow for this project. For a real organisation, use a stronger member authentication flow such as passwordless magic links or account passwords before exposing sensitive member-only data.

## Branding
- Royal Azure: `#3454D1`
- Turquoise: `#34D1BF`
- Platinum: `#EFEFEF`
- Black: `#070707`
- Slogan: **Forward for Britain**
- Reference campaign year: **2029**

## Main files
- `index.html` — homepage
- `membership.html` — free membership / Member Home
- `control-room.html` — Control Room
- `styles.css` — full public/admin styling and animations
- `app.js` — public website logic
- `control-room.js` — CMS/admin logic
- `data.js` — local data store + SQL sync bridge
- `supabase-adapter.js` — database adapter
- `supabase-config.js` — paste Supabase URL/key here
- `schema.sql` — PostgreSQL schema, RLS and SQL functions

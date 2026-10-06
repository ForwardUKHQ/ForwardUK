# Forward UK — flat GitHub Pages build

This project is intentionally **flat**: every HTML, JS, CSS and image file sits at the repository root. There are no folders inside the project ZIP.

## Start
Open `index.html`, or upload every file to the root of a GitHub repository and enable GitHub Pages.

## Control Room
Open `control-room.html`.

Default demo PIN: `2029`

The Control Room manages:
- Homepage hero and quick cards
- Manifestos
- Policies
- News
- Events
- Members
- Representatives / MPs / councillors
- Leadership
- Local branches
- Announcements
- Party statistics
- Site settings

## Free membership
`membership.html` creates a free member record and a generated number such as `FWUK-2029-000002`. Members can sign in with their email + member number to see a digital membership card, branch, events, announcements and manifesto links.

Demo member:
- Email: `member@example.com`
- Member number: `FWUK-2029-000001`

## Important: static demo architecture
GitHub Pages has no database or server. This build therefore uses browser `localStorage` as a CMS-style demonstration store. Changes made in the Control Room update the public pages **in the same browser**.

That means:
- changes do not automatically sync to other visitors/devices;
- the browser PIN is a UI convenience, not secure authentication;
- use **Export data** / **Import data** in the Control Room to move demo data between browsers.

For a production party site, replace `ForwardStore` in `data.js` with a real authenticated API/database. The pages render from a shared data model, so the frontend can be retained while the storage layer is replaced.

## Branding
- Royal Azure `#3454D1`
- Turquoise `#34D1BF`
- Platinum `#EFEFEF`
- Black `#070707`
- Slogan: **Forward for Britain**
- Campaign: **Forward for Britain — 2029**

No donation or payment functionality is included.

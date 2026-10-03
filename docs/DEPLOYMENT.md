# Firebase deployment

The sample runs entirely from its bundled, public demonstration data. No cloud
project, database, AI billing or sign-in is needed for local development.

A Firebase Hosting configuration is prepared, but no project is selected or
provisioned. Do not reuse unrelated production projects. Once the owner chooses a
project, build and deploy explicitly:

```sh
npm run check
firebase hosting:channel:deploy review --project YOUR_PROJECT_ID
# After preview acceptance:
firebase deploy --only hosting --project YOUR_PROJECT_ID
```

The checked-in Firestore rules deny all access. Before private graph publication,
implement Authentication, owner-scoped rules with emulator tests, a server-side
publisher, and the GraphRepository adapter. Never put private corpus data into
bundled frontend assets: all static assets are downloadable.

No automatic production deployment is configured. GitHub quality checks are read-only.

# Editorial backend

This repository has its own Firebase project, Authentication users, Firestore database, and security rules. Reading pages are served by GitHub Pages without sign-in. Authentication is used only for submitting writing and editorial work.

Contributors sign in with verified Google accounts. Submissions are private to their owner and editors, rate limited to one per minute, and cannot be silently overwritten. Editors review originals, prepare private drafts, and explicitly publish a separate record containing only the public title, byline, text, artwork and destination. Private contact information never enters the public repository.

The Publish approved writing GitHub workflow checks the public approved collection twice per hour and regenerates static pages. GitHub may delay scheduled runs; the workflow can also be run manually. Withdrawing an item removes it on the next successful sync. Previously public Git history and external caches cannot be withdrawn by this system.

Google sign-in uses session persistence. Editor access is a Firebase custom claim; it cannot be granted in the browser or by writing a profile document. The requested initial editor is assigned administratively.

Build frontend: npm ci && npm run build from backend/. Run npm test with Java 21+ for Firebase emulator security tests. Deploy rules with firebase deploy --only firestore --project <this-project>. Never use a different site's project ID.

Uploads are disabled on the free plan. storage.rules implements private, immutable PDF/DOCX/text manuscripts (10 MB maximum), restricted to an existing owned submission and editors. Before enabling: activate Storage in this project's billing-enabled Firebase console, deploy storage.rules, verify cross-service permissions and bucket CORS, set uploadsEnabled and storageBucket, rebuild and test. No reusable public download tokens are generated.

Public Firebase web configuration is not a server credential. Do not commit Firebase CLI credentials, service-account keys, private submissions, emulator logs or local environment files.

Book requests are enquiries, not paid orders. Payments, stock control, shipping, historical database import and file uploads are not enabled by this backend. Original site accounts and submissions were not available for migration and are not claimed to have been imported.

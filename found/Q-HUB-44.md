Q-HUB-44: the status page's source grew past the Read tool's size cap by the end of a long plan, so the page gate's whole read needs the large-read flag, and a read without it fails and is then held by the reply guard.

Fix in: `report.mjs`, `hook-dispatch.mjs`. The status page's source is kept under the Read tool's size cap, or the page gate's whole read is made with the large-read flag.

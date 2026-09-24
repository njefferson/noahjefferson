## 358 · Deleting the cache line does not delete the cache

**Enforced by:** GATE hub:.github/workflows/doctrine.yml — zizmor's
cache-poisoning audit reads what the action does by default, not only what the
workflow file says, and reported the cache after the line asking for it was
gone. · CHECKLIST cache-off-is-explicit — in any job that publishes (a deploy,
a release), a setup action at a version that can cache on its own is told not
to, in words, and zizmor is re-run to see the finding go.

**Smell:** a deploy job hardened by removing `cache: npm` from
`actions/setup-node` and nothing else, on v5 or later.

**Measured 2026-09-24 in Jefferson-Photography-Studio.** Its deploy job
restored an npm cache into the build that goes live, which zizmor reports as
cache poisoning: a cache is shared with other workflows' runs, so whatever one
of them saved is what the deploy builds from. The obvious fix was to delete
`cache: npm` and pin setup-node to the commit the hub already vets (v7.0.0).
The finding stayed, now pointing at the action itself: "enables caching by
default". From v5, setup-node turns caching on by itself when `package.json`
declares a package manager; that repo's does not today, so whether the cache
would actually have come back is not what was measured. What was measured is
that zizmor will not accept the job until `package-manager-cache: false` is
written, and with it written, it reported nothing.

**Why the explicit line is the right answer even where the default would not
fire.** The default depends on a field in a different file, which a later
commit can add for an unrelated reason, and nothing about the workflow would
change when it did. The line that asked for the cache is the line everyone
reads, and removing it looks like removing the behaviour. A pin bump changes
every default the action has, and the only reading that saw this one was the
tool that audits the action's defaults rather than the file's words.

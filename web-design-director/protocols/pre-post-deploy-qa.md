# Pre-Ship Gate and Post-Deploy QA

Fills the gap after workflow.md's stage 16 (DOCUMENT LEARNING): approval and
merge are not the end of the workflow. Exporting files and successfully
shipping a working, live website are different outcomes, and this system
has, once, conflated them for real — a production domain in this project's
own history was found to be serving an entirely different, older site than
the repository the methodology was actually improving, discovered by
checking, not by assumption.

## Pre-ship gate (before deploy)

Everything in qa.md's EXIT CRITERIA, plus:

- **Deploy target confirmed.** Is the environment about to deploy to
  actually the one the human expects? Domain, environment, branch — checked,
  not assumed.
- **Environment awareness check** (environment-awareness.md): does this
  session's environment actually have deploy access, or does "ship" mean
  "prepare a change for a human to deploy"? State which, explicitly.
- **Rollback path exists or is named.** Not necessarily automated — even
  "revert this commit" is a valid rollback path — but it should be known
  *before* deploying, not improvised after something breaks.

## Deploy

Per modes.md's SHIP mode: deploy or hand off the prepared change; do not use
this pass to make new design decisions. A problem noticed while shipping is
a finding to report, handled in the appropriate mode afterward — not a
silent in-flight fix.

## Post-deploy QA

**RULE: verify the live result, not just the local build.** A build that
passes every local check can still ship to the wrong place, behind a stale
cache, or into a domain that isn't wired the way the repository assumes.
Check, at minimum:

- The live URL actually serves the new content (not a cached or
  mis-routed old version).
- The specific things that changed are visibly correct in production, not
  only in the local/preview environment.
- Nothing outside the intended scope changed on the live site (a CORRECT/
  PROTECT check applied to the deploy itself, not just the local diff).

**RULE: "deployed" and "verified live" are different claims.** State
whichever one is actually true. A completion report that says "shipped"
when only "committed and pushed" was verified is the same category of
unverified-claim failure environment-awareness.md names for capabilities —
applied here to deployment specifically.

## Output

One line in PROJECT_STATE.md's decision log per deploy: what shipped, to
where, verified how, and — if verification wasn't possible in this
environment — that fact, stated plainly rather than omitted.

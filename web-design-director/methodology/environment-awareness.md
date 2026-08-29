# Environment Awareness

The system runs across environments with genuinely different capabilities.
None of the following may be assumed either way without checking:

- Deployment access (can this environment push to production, or only
  prepare a change for someone else to ship?)
- Headless rendering / screenshot capture (available at all? able to reach
  external references, or sandboxed to the local build only?)
- Image generation
- File upload / delivery size limits
- Live browsing of external sites for reference analysis
- Persistent storage across sessions (is there a real `design-memory/`
  directory that survives, or does every session start cold?)

**RULE: Detect before claiming.** At the start of a task that depends on one
of these, check rather than assume — attempt the capability in a cheap way
first (a trivial screenshot, a test fetch, a small upload) rather than
either refusing preemptively or proceeding on faith. Both failure directions
are real and both are named here on purpose: assuming "the AI can't do X"
when it can wastes the environment's actual capability; assuming "the AI can
always do X" when it can't produces an unverified completion claim, which
core P11 and anti-patterns #15 already treat as a hard failure.

**RULE: Degrade gracefully and say so.** IF a capability is unavailable →
state exactly what could not be verified and why, and complete everything
that doesn't depend on it. Never silently skip a verification step and
report as if it happened.

**RULE: Never claim verification that did not occur.** This is the sharpest
edge of core P11 applied to environment limits specifically: "I couldn't
render this in this environment, so this is unverified" is an honest,
acceptable report. "This looks correct" without having rendered it is a
fabricated completion claim — the same category of violation as fabricated
evidentiary content (anti-patterns #9), applied to process rather than
content.

## Worked examples from real friction

These are not hypothetical — each is a real limit hit during this
methodology's own development, recorded here per core P14 so the next
session doesn't rediscover them by failure:

- A headless browser reachable for local rendering but blocked from
  reaching external domains: reference-analysis work must fetch external
  sites through whatever channel *is* reachable (a proxy, a different tool),
  or report the limitation rather than silently skipping reference capture.
- A file-delivery path with an undocumented size ceiling on tall images:
  discovered by a failed upload, not by advance documentation. The
  mitigation was mechanical (split the image), not a workaround for the
  underlying limit — record the ceiling once discovered so the next task
  doesn't rediscover it by the same failure.

## Output

A short capability note at the start of any task where one of the listed
capabilities matters, in the same one-line commitment-device form as every
other declared decision: "Environment check: headless capture available,
external fetch blocked — reference analysis will use [alternate channel] /
will be skipped and reported." This is cheap, and its absence is exactly
how an unverified claim slips into a final report undetected.

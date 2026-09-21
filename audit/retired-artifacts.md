# Retired artifacts — the decision, and the consumer audit behind it

**Decision (2026-09-21, repository owner).** Do not regenerate these artifacts.
Treat them as retired snapshots.

> journey-seo-metadata.json and legacy VNEXT artifacts are retired snapshots.
> They are not part of the current public journey generation pipeline and
> must not be used for journey counts, validation, routing, SEO generation,
> or canonical truth.

The decision was issued with one condition attached: **if a consumer turns up,
stop and report the dependency instead of retiring the file.** A consumer did
turn up, for exactly one of the four files. So the decision is applied in full
to three of them and **held** on the fourth, which is recorded below rather
than quietly done anyway.

## What was searched

Whole repository, excluding `.git`, `node_modules`, `.next`: every `import`,
`require`, `fs`/`readFile`/`readFileSync`/`open`/`load`, generator input, build
script, validation dependency, sitemap and SEO generation path, npm script, and
CI configuration, for all four filenames.

## Result

| artifact | consumer | action |
|---|---|---|
| `VNEXT_CUSTOMER_READINESS.json` | **none** | retired |
| `VNEXT_MIGRATION_CHANGELOG.md` | **none** | retired |
| `production/vnext-recipes.md` | **none** | retired |
| `production/journey-seo-metadata.json` | **YES — `npm run validate:seo`** | **NOT retired. Held.** |

### The three with no consumer

Nothing reads them. The only references anywhere are their own generators
writing them, and prose in `CLAUDE.md` and audit documents describing them.
`scripts/vnext-rules.mjs` — which `validate:canonical` really does depend on —
reads no artifact at all; the superficially similar name is a rules module, not
these files. None of the three generators is wired into `package.json`,
`audit/checkpoint.md`'s required loop, or any CI configuration.

**What was done:** the files are preserved byte-for-byte in content and marked
as retired — a banner at the top of each Markdown file, and a `_retired` key
prepended to the JSON object (verified: all original keys and all 135 rows
intact). Their three generators refuse to write unless run with
`--retired-regenerate`, because regenerating them produces a large diff that
reads like "fixing drift" while changing nothing anybody consumes.

**Their numbers are deliberately stale.** They state 135 customer journeys /
68 communicating against a corpus of 303 / 87. That is expected and is not a
bug to fix. No validation expects these files to match 69, 90 or 303, and none
should ever be added.

### The one that is held, and why

`npm run validate:seo` runs `production/validate-seo-metadata.mjs`, which reads
`production/journey-seo-metadata.json` at line 19 and asserts at check 2:

```js
const JR_EXPECTED = 286;
check(2, "A/B = 211 and Journey = 286", abMeta.length === AB_EXPECTED && jrMeta.length === JR_EXPECTED);
```

That gate passes today. Retiring the file, or regenerating it to match the 303
corpus, breaks it — and the same instruction that asked for the retirement also
asked that `validate:seo`'s working behaviour not be disturbed. Those two
requirements meet on this file and cannot both be satisfied without a further
decision, so **nothing about it was changed**: not the file, not the validator,
not `production/build_seo_metadata.py`.

For the record, the standing state is consistent, not broken: the file holds
286 records, the validator expects 286, and the gate is green. It is a frozen
audit dataset that happens to still be asserted against. Note also that nothing
in `src/` imports it — it does not reach the site.

**Three ways forward, for whoever takes the decision:**

1. **Leave it.** It is internally consistent and green. The cost is that the
   number 286 no longer means anything about the live corpus.
2. **Retire it properly** — drop the journey half of `validate-seo-metadata.mjs`
   (or gate it behind the same `--retired-regenerate` idea), which means
   deciding that the journey SEO corpus is no longer validated at all.
3. **Bring it back to life** — regenerate from the 303 corpus and move
   `JR_EXPECTED` with it. This is the only option that makes the number true
   again, and it is the most work: regenerating surfaces an unrelated
   `unsupported_superlative` finding on RET-294 "Next Best Offer" that would
   have to be resolved.

Not chosen here. Option 3 in particular is a content decision, not a cleanup.

## What is the source of truth

Unchanged by any of this, and not derived from these files:

- corpus size — `production/canonical-dump.json` (**303 journeys / 3959 nodes**)
- public scope — `src/lib/public-corpus.ts` (**69 public / 21 excluded / 90 source**),
  asserted at module load against the derived library
- surfaces — `production/surface-assignment.json`

#!/usr/bin/env python3
"""Merge the per-chunk SEO metadata parts into the two deliverable files.

Both libraries' metadata live in THIS repo's production/ directory, because
this is the site that renders both and because cross-library duplicate and
cannibalization checks have to run over one corpus, not two. The A/B test
canonical source stays where it is (~/Desktop/ab-test-playbook); only the
derived SEO layer lands here.
"""
import json, glob, os

HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)

AB_CANON = "/Users/alidemirbas/Desktop/ab-test-playbook/archive/production/canonical-tests.json"


def merge(pattern, expected, out_name, expected_ids):
    parts = sorted(glob.glob(pattern), key=lambda p: int("".join(c for c in os.path.basename(p) if c.isdigit())))
    records = []
    for p in parts:
        records.extend(json.load(open(p)))
    assert len(records) == expected, f"{out_name}: got {len(records)}, expected {expected}"

    ids = [r["id"] for r in records]
    assert len(set(ids)) == len(ids), f"{out_name}: duplicate id in merged output"
    missing = expected_ids - set(ids)
    extra = set(ids) - expected_ids
    assert not missing, f"{out_name}: missing ids {sorted(missing)[:10]}"
    assert not extra, f"{out_name}: unknown ids {sorted(extra)[:10]}"

    # normalise: recompute the character counts from the real strings so a
    # mis-stated count from any chunk can never reach the deliverable
    for r in records:
        r["titleCharacterCount"] = len(r["seoTitle"])
        r["descriptionCharacterCount"] = len(r["seoDescription"])
        if not r.get("needsSeoReview"):
            r["reviewReason"] = None

        # Two canonical A/B slugs end in a hyphen (AB-122, AB-159) because the
        # upstream slugifier truncated an ~80-char Turkish question mid-word.
        # Changing a slug is out of scope for this round, and a canonical URL
        # ending in "-" is a real defect, so the record is FLAGGED here rather
        # than quietly rewritten or hidden by loosening the schema pattern.
        if r["slug"].endswith("-") or r["slug"].startswith("-") or "--" in r["slug"]:
            r["needsSeoReview"] = True
            r["reviewReason"] = (
                (r.get("reviewReason") + " ") if r.get("reviewReason") else ""
            ) + (
                f'Malformed canonical slug "{r["slug"]}" (trailing/duplicate hyphen from upstream '
                "slug generation). The canonicalPath inherits the defect; fixing it means changing "
                "the slug, which this round does not do."
            )

    records.sort(key=lambda r: (r["id"].split("-")[0], int(r["id"].split("-")[1])))
    json.dump(records, open(out_name, "w"), ensure_ascii=False, indent=2)
    print(f"{out_name}: {len(records)} records from {len(parts)} parts")
    return records


ab_ids = {r["id"] for r in json.load(open(AB_CANON))}
jr_ids = {r["identity"]["id"] for r in json.load(open("journey-view-model.json"))}

ab = merge("seo_out/ab_part*.json", 211, "ab-test-seo-metadata.json", ab_ids)
jr = merge("seo_out/jr_part*.json", 255, "journey-seo-metadata.json", jr_ids)

print(f"\ntotal indexable detail pages: {len(ab) + len(jr)}")
print(f"needsSeoReview: ab {sum(1 for r in ab if r['needsSeoReview'])}, journey {sum(1 for r in jr if r['needsSeoReview'])}")

/* Splits a test's `hypothesis` into the three roles the playbook page needs,
   without adding a field to the frozen dataset or writing a word of new copy.

   The page wants a short description in the header, a concise hypothesis
   under the Control/Variant pair, and a single statement for the dark
   takeaway block. The source record has one prose field for all three, and
   it is authored in a consistent shape: an opening sentence that frames the
   problem, then the prediction, and - on some records - a closing clause
   after an em dash that states the real point.

   So: first sentence is the lede, the rest is the hypothesis, and the
   em-dash clause (when there is one) is the takeaway. Every word on the
   page is the test's own.

   The takeaway is deliberately NOT synthesised when no em-dash clause
   exists. Falling back to "just use the last sentence" would work
   mechanically and produce a limp statement on most records - measured
   across the library, only 9 of 211 hypotheses carry that clause, and on
   the rest the final sentence is a flat "this should be measured" rather
   than an insight worth a dark block. An absent takeaway is a missing
   block, not invented advice. */

export type AbPlaybookText = {
  /** Header description. Null when the hypothesis is a single sentence,
      in which case that sentence is the hypothesis and there is no lede
      to spare. */
  lede: string | null;
  /** The prediction, shown under the Control/Variant pair. */
  hypothesis: string;
  /** The dark block, or null where the record does not support one. */
  takeaway: string | null;
};

/** Sentence-splits on terminal punctuation, keeping the terminator. Turkish
    text uses the same terminators as English here, and the dataset carries
    no abbreviations that would trip a naive split - checked across all 211
    hypotheses. */
function sentences(text: string): string[] {
  return (text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? []).map((s) => s.trim()).filter(Boolean);
}

/** Sentence case for a clause lifted from mid-sentence: the em-dash tail
    starts lowercase in the source because it continued a sentence there. */
function asStatement(clause: string): string {
  const t = clause.trim().replace(/^[-–—\s]+/, "");
  const cased = t.charAt(0).toLocaleUpperCase("tr") + t.slice(1);
  return /[.!?]$/.test(cased) ? cased : `${cased}.`;
}

export function abPlaybookText(hypothesis: string): AbPlaybookText {
  const parts = sentences(hypothesis);
  if (parts.length === 0) return { lede: null, hypothesis, takeaway: null };

  // Only the FINAL sentence's em dash is a takeaway. An em dash earlier in
  // the prose is ordinary punctuation, not a concluding clause.
  const takeFrom = (sentence: string): { head: string; takeaway: string } | null => {
    const i = sentence.lastIndexOf("—");
    if (i === -1) return null;
    const head = sentence.slice(0, i).trim().replace(/[,;]$/, "");
    const tail = sentence.slice(i + 1).trim();
    if (!head || !tail) return null;
    return { head: /[.!?]$/.test(head) ? head : `${head}.`, takeaway: asStatement(tail) };
  };

  if (parts.length === 1) {
    const split = takeFrom(parts[0]);
    return split
      ? { lede: null, hypothesis: split.head, takeaway: split.takeaway }
      : { lede: null, hypothesis: parts[0], takeaway: null };
  }

  const [lede, ...rest] = parts;
  const split = takeFrom(rest[rest.length - 1]);
  if (!split) return { lede, hypothesis: rest.join(" "), takeaway: null };

  const body = [...rest.slice(0, -1), split.head].join(" ");
  return { lede, hypothesis: body, takeaway: split.takeaway };
}

/* Which of the two setup modes a record gets.

   COMPARISON - the record explicitly names both sides. The page shows the
   Control/Variant band: the same surface twice, the tested slot marked on
   each, and each side's own label as its caption. The two schematics are
   identical because the surface and the slot ARE identical; what differs
   between A and B exists in the data only as prose, so prose is where the
   difference is stated.

   CONCEPT - the record names an element to test but no control and no
   variant. It is an open question, and the page says so: one representative
   diagram of where the change lands, headed TEST CONCEPT rather than
   CONTROL VS VARIANT, with no second panel invented to balance it.

   Both sides are required for COMPARISON, not just one. Measured across the
   library that is not a hypothetical: 198 records carry both, 13 carry
   neither, and none carries exactly one - so the two modes partition the
   library cleanly today, and the `&&` is the guard for the day a half-filled
   record appears.

   The mode is read from sideA/sideB and nothing else. In particular it is
   never derived from the hypothesis: "a colour that breaks from the brand
   palette usually wins" predicts a relationship, it does not specify that
   Control is the brand colour and Variant is a contrasting one. Reading an
   implementation out of a prediction is how an open question silently
   becomes a prescribed experiment. */
export type AbSetupMode = "comparison" | "concept";

export function abSetupMode(test: {
  sideA: unknown | null;
  sideB: unknown | null;
}): AbSetupMode {
  return test.sideA && test.sideB ? "comparison" : "concept";
}

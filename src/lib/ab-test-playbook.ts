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

/* WHAT the experiment varies - the independent variable - as opposed to
   WHERE it runs, which is `surface`.

   The diagram is keyed on this rather than on the surface, because a surface
   schematic answers the wrong question. A timing test, a quantity test and an
   ordering test all run on a listing page, and drawing all three as "a
   listing page with one box highlighted" says nothing about what is actually
   being changed. Worse, it silently narrows a broad experiment into one
   arbitrary implementation: "CTA optimisation" tests colour, copy, size AND
   position, and marking the CTA's text alone asserts a treatment the record
   never chose.

   Read from four real fields - `testedSlot`, `question`, the `whatToTest`
   labels, and `differenceBehavior` - and nothing else. The dataset is
   Turkish, so matching is done on a fold that also handles the consonant
   softening the language applies to suffixes: "eşik" becomes "eşiği", so the
   stem to match is "esig" as well as "esik".

   Order matters below. The checks run most-specific first, because a record
   can satisfy several: AB-034 asks how many products per page AND sits on a
   listing, and quantity is the variable while listing is only the setting. */
export type AbVariableKind =
  | "timing" | "threshold" | "quantity" | "ordering" | "ordering-nav"
  | "hierarchy" | "emphasis" | "anatomy" | "microcopy" | "placement"
  | "presence" | "behavior" | "personalization" | "default" | "size"
  | "style" | "format" | "options" | "media" | "layout" | "wording";

/** Folds Turkish diacritics so one keyword list covers both spellings. */
function fold(s: string | null): string {
  const map: Record<string, string> = {
    "\u0131": "i", "\u0130": "i", "\u015f": "s", "\u015e": "s", "\u011f": "g", "\u011e": "g",
    "\u00fc": "u", "\u00dc": "u", "\u00f6": "o", "\u00d6": "o", "\u00e7": "c", "\u00c7": "c", "\u00e2": "a",
  };
  return (s ?? "").toLowerCase().replace(/[\u0131\u0130\u015f\u015e\u011f\u011e\u00fc\u00dc\u00f6\u00d6\u00e7\u00c7\u00e2]/g, (c) => map[c] ?? c);
}

export function abVariableKind(test: {
  testedSlot: string | null;
  question: string;
  whatToTest: { label: string }[];
  differenceBehavior: string;
  comparisonMode: string;
  setupType: string;
}): AbVariableKind {
  const slot = fold(test.testedSlot);
  const q = fold(test.question);
  const dims = new Set(test.whatToTest.map((w) => fold(w.label)));
  // The slot and the question name the variable; the dimensions confirm it.
  // Kept separate because a dimension list often includes device or segment,
  // which are cuts of the analysis rather than the thing being changed.
  const named = `${slot} ${q}`;
  const inNamed = (...k: string[]) => k.some((x) => named.includes(x));
  const slotHas = (...k: string[]) => k.some((x) => slot.includes(x));
  const behaviour = test.differenceBehavior;

  /* Turkish drops the stem vowel before a possessive suffix, so a keyword
     has to be given as the stem the suffix leaves behind as well as the
     dictionary form: "esik" becomes "esigi", "metin" becomes "metni",
     "baslik" becomes "basligi". Matching only the dictionary form silently
     misses every possessive, which is the form a `testedSlot` is almost
     always written in. */

  /* The slot and the question decide, NOT the dimension list. Audited across
     the library and this is the trap: "Zamanlama" appears as one of five
     dimensions on 16 records whose variable is plainly something else - a
     sticky buy button, a second product image, a form's field count. Every
     one of those was being drawn as a timing test. A dimension is a cut of
     the analysis; only the slot and the question name the variable. */
  if (inNamed("zamanlama", "ne zaman", "sure sonra", "gecikme", "ertele", "sonraya", "cikis niyeti")) {
    return "timing";
  }
  if (inNamed("esik", "esig", "baraj", "limit")) return "threshold";
  /* A count word only means a quantity test when it names the VARIABLE. The
     question's outcome clause carries them too - "does offering a downloadable
     resource increase the number of leads" is a presence test whose outcome
     happens to be a count - so the slot decides, and only "kac" (how many) is
     trusted from the question. "adet" is out: the one record carrying it is
     about a quantity selector's visibility, not about a quantity. */
  if (slotHas("sayisi", "sayisini", "alan seti") || inNamed("kac ", "sayfa basina")) return "quantity";
  if (inNamed("sira", "siralama")) return inNamed("menu", "navigasyon") ? "ordering-nav" : "ordering";
  /* "bilgisi sunumu" is what carries AB-145, whose slot is "avantaj bilgisi
     sunumu" - how the benefit information is presented, which is a hierarchy
     question. Reading its "Hiyerarsi" DIMENSION instead would have been the
     shortcut, and it is wrong: three records carry that dimension and the
     other two are a social-login option and a filled-vs-outlined button,
     neither of them hierarchy tests. The slot names the variable. */
  if (inNamed("hiyerars", "hangi bilgi", "one cikmali", "one cikan", "bilgisi sunumu", "bilgi duzeni")) {
    return "hierarchy";
  }
  /* Prominence: how hard the same thing is pushed. "Vurgu" (emphasis) always
     means that. "Gorunurluk" (visibility) only means it when the record
     CHANGES the prominence - on an add/remove record the question is whether
     the thing is there at all, which is a presence test, and drawing a quiet
     variant of something the control does not have would be a fabrication.
     AB-168 ("show the enterprise price or hide it") is the clear case. */
  if (
    inNamed("vurgu", "gorsel agirlig") ||
    (inNamed("gorunurlug", "gorunurluk") && behaviour === "change")
  ) {
    return "emphasis";
  }
  if (inNamed("microcopy", "mikrokopi")) return "microcopy";
  // A record that varies three or more properties of one component is an
  // optimisation, not a change to any single one of them.
  if (inNamed("optimizasyon") || ["renk", "metin", "boyut", "konum"].filter((d) => dims.has(d)).length >= 3) {
    return "anatomy";
  }
  /* An arrangement PATTERN rearranges the whole page and is a layout test;
     a placement test moves one element while everything else holds. */
  if (inNamed("yerlesim deseni", "dizmek", "duzeni", "kolon yapisi", "sutunlu", "anlati yapisi", "sonu izlenimi")) {
    return "layout";
  }
  if (behaviour === "move" || inNamed("nerede", "yerlesim", "konumu", "ustte mi", "altta mi", "solunda mi")) {
    return "placement";
  }
  if (test.comparisonMode === "media" || inNamed("gorsel", "video", "fotograf")) return "media";
  // add/remove is the one behaviour whose two sides the data actually fixes,
  // so this is the kind whose diagram can show the real A/B difference. It is
  // checked before the kinds below on purpose: "does adding autocomplete help"
  // is a presence test that happens to be about an automatic behaviour, and
  // the honest drawing is absent-vs-present, not a diagram of automation.
  if (behaviour === "add" || behaviour === "remove") return "presence";
  /* What the interface does on its own: auto-advancing, auto-applying,
     staying pinned through a scroll, opening a link in a new tab. The element
     is not what changes - its behaviour is - so neither a component drawing
     nor a timeline says it. */
  if (inNamed("otomatik", "kendiliginden", "sticky", "sabit menu", "kalicilig", "yeni sekme", "hedef davranis", "gecis davranis", "yukleme ekrani")) {
    return "behavior";
  }
  // Which option arrives already chosen, which is neither the option set nor
  // its wording.
  if (inNamed("varsayilan")) return "default";
  /* The slot is filled from who the visitor is - their source, their language,
     their segment. Every visitor sees one version, so this is not an options
     test between two fixed alternatives. */
  if (inNamed("kaynaga gore", "kullanici tipine gore", "durumuna gore", "kendi diliyle", "ziyaretcinin geldigi")) {
    return "personalization";
  }
  // Scale of one element. "Buyukluk" is deliberately absent: the one record
  // carrying it is about the size of the COMMITMENT a CTA asks for, not the
  // size of the button.
  if (inNamed("boyutu", "yukseklig", "buyutmek", "genislig")) return "size";
  /* Two named alternatives. "X mi, Y mi" - with the comma - is the library's
     reliable A-or-B construction; the bare particle is not, because it also
     ends every yes/no question in the dataset. */
  if (test.setupType === "option-vs-option" || inNamed(" mi, ", " mu, ", " mi ", "hangisi", "yontemi")) {
    return "options";
  }
  // Visual treatment of one component: its colour, its style. Checked after
  // options so a filled-vs-outlined record keeps its two captioned panels.
  if (inNamed("rengi", "renk", "stili", "yuzen etiket")) return "style";
  if (inNamed("bicim", "format", "gosterim", "birim", "kusurat")) return "format";
  if (inNamed("metin", "metn", "baslik", "baslig", "etiket", "ifade", "dil", "mesaj")) return "wording";
  if (test.comparisonMode === "structural") return "layout";
  return "format";
}

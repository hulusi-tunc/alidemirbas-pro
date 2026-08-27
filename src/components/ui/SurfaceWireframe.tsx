/* A schematic of the surface a test runs on, with the element under test
   marked on it.

   The v5 mockup drew a full UI preview here - a branded landing page with
   headline, body copy and a social-proof line. None of that exists in the
   dataset, and rendering invented product copy as if it were the tested page
   is the thing the brief rules out. A wireframe is different: grey bars
   announce themselves as placeholders, so nothing here can be mistaken for a
   real interface. The only words on the diagram are the record's own
   `testedSlot`.

   Everything it draws comes from two fields, both populated on all 211
   records: `surface` picks the schematic, `testedSlot` names the marked
   element.

   What is NOT drawn is the difference between A and B. sideA/sideB describe
   the two sides in prose - there is no colour, position or copy value
   anywhere in the data - so the comparison mode renders this same diagram
   twice and states the difference in each side's caption. Two schematics
   that differed visually would be inventing an implementation the record
   does not specify. */

const BAR = "rounded-[3px] bg-ink-100";
const BLOCK = "rounded-md bg-ink-100";

export function SurfaceWireframe({
  surface,
  testedSlot,
  label,
}: {
  surface: string;
  testedSlot: string | null;
  /** "Tested element" / "Test edilen öğe", localised by the caller. */
  label: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-paper p-5 sm:p-7">
      {/* Chrome: a mark and three nav stubs. No brand, because there is no
          brand in the data. */}
      <div className="flex items-center justify-between border-b border-line-soft pb-3">
        <span aria-hidden className="size-2.5 rounded-[3px] bg-ink-300" />
        <div className="flex gap-2" aria-hidden>
          <span className={`h-1 w-6 ${BAR}`} />
          <span className={`h-1 w-6 ${BAR}`} />
          <span className={`h-1 w-6 ${BAR}`} />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <SurfaceBody surface={surface} />

        {/* The one thing on the diagram that is not a placeholder. */}
        <div className="relative mt-3">
          <span className="absolute -top-4 left-0 font-mono text-[9px] tracking-[0.1em] text-ink-400 uppercase">
            {label}
          </span>
          <div className="rounded-md bg-ink-900 px-4 py-3 outline-1 outline-offset-4 outline-ink-300">
            <span className="block text-center text-[13px] font-medium text-paper">
              {testedSlot ?? "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* One body per surface in the `Surface` union. They are deliberately coarse -
   a cart reads as line items over a totals block, a PLP as a grid of tiles -
   because the point is to place the tested element in a recognisable context,
   not to depict any particular page. Several surfaces share a shape for the
   same honest reason: a search results page and a category listing are the
   same wireframe, and drawing them differently would assert a difference the
   data does not describe. */
function SurfaceBody({ surface }: { surface: string }) {
  switch (surface) {
    case "cart":
    case "checkout":
      return <LineItemsBody withFields={surface === "checkout"} />;
    case "pdp":
      return <ProductBody />;
    case "plp":
    case "search":
    case "filters":
      return <GridBody withRail={surface === "filters"} />;
    case "pricing":
      return <ColumnsBody />;
    case "form":
      return <FormBody />;
    case "saas":
    case "dashboard":
      return <AppBody />;
    case "mobile":
      return <MobileBody />;
    case "thankyou":
      return <ConfirmationBody />;
    case "home":
    default:
      return <PageBody />;
  }
}

/** Cart and checkout: items over a totals block, checkout adding fields. */
function LineItemsBody({ withFields }: { withFields: boolean }) {
  return (
    <div aria-hidden className="flex flex-col gap-3.5">
      {[0, 1].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <span className={`size-10 shrink-0 ${BLOCK}`} />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className={`h-1.5 w-[62%] ${BAR}`} />
            <span className={`h-1.5 w-[38%] ${BAR}`} />
          </div>
          <span className={`h-1.5 w-10 shrink-0 ${BAR}`} />
        </div>
      ))}
      {withFields && (
        <div className="flex flex-col gap-2 pt-1">
          <span className={`h-7 w-full ${BLOCK}`} />
          <div className="flex gap-2">
            <span className={`h-7 flex-1 ${BLOCK}`} />
            <span className={`h-7 flex-1 ${BLOCK}`} />
          </div>
        </div>
      )}
      <div className="mt-1 flex flex-col gap-2 border-t border-line-soft pt-3.5">
        {[["34%", "16%"], ["28%", "12%"], ["22%", "20%"]].map(([l, r], i) => (
          <div key={i} className="flex items-center justify-between">
            <span className={`h-1.5 ${BAR}`} style={{ width: l }} />
            <span className={`h-1.5 ${BAR}`} style={{ width: r }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Product detail: media beside title, price and description. */
function ProductBody() {
  return (
    <div aria-hidden className="flex gap-4">
      <span className={`h-28 w-[42%] shrink-0 ${BLOCK}`} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <span className={`h-2.5 w-[80%] ${BAR}`} />
        <span className={`h-2 w-[35%] ${BAR}`} />
        <div className="mt-1.5 flex flex-col gap-1.5">
          <span className={`h-1.5 w-full ${BAR}`} />
          <span className={`h-1.5 w-[88%] ${BAR}`} />
          <span className={`h-1.5 w-[64%] ${BAR}`} />
        </div>
      </div>
    </div>
  );
}

/** Listing, search results and filtered listing: a grid of tiles. */
function GridBody({ withRail }: { withRail: boolean }) {
  const tile = (
    <div className="flex flex-col gap-1.5">
      <span className={`h-14 w-full ${BLOCK}`} />
      <span className={`h-1.5 w-[75%] ${BAR}`} />
      <span className={`h-1.5 w-[45%] ${BAR}`} />
    </div>
  );
  return (
    <div aria-hidden className="flex gap-4">
      {withRail && (
        <div className="flex w-[26%] shrink-0 flex-col gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={`h-1.5 ${BAR}`} style={{ width: `${90 - i * 12}%` }} />
          ))}
        </div>
      )}
      <div className="grid flex-1 grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i}>{tile}</div>
        ))}
      </div>
    </div>
  );
}

/** Pricing: three plan columns, the middle one taller. */
function ColumnsBody() {
  return (
    <div aria-hidden className="grid grid-cols-3 items-end gap-3">
      {[64, 84, 64].map((h, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <span className={`w-full ${BLOCK}`} style={{ height: h }} />
          <span className={`h-1.5 w-[70%] ${BAR}`} />
        </div>
      ))}
    </div>
  );
}

/** Form: stacked label/field pairs. */
function FormBody() {
  return (
    <div aria-hidden className="flex flex-col gap-3">
      {["44%", "38%", "50%"].map((w, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <span className={`h-1.5 ${BAR}`} style={{ width: w }} />
          <span className={`h-7 w-full ${BLOCK}`} />
        </div>
      ))}
    </div>
  );
}

/** SaaS and dashboard: a nav rail beside panels. */
function AppBody() {
  return (
    <div aria-hidden className="flex gap-4">
      <div className="flex w-[22%] shrink-0 flex-col gap-2">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`h-1.5 w-full ${BAR}`} />
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-2.5">
        <div className="flex gap-2.5">
          <span className={`h-12 flex-1 ${BLOCK}`} />
          <span className={`h-12 flex-1 ${BLOCK}`} />
        </div>
        <span className={`h-16 w-full ${BLOCK}`} />
      </div>
    </div>
  );
}

/** Mobile: a narrow column, centred in the frame. */
function MobileBody() {
  return (
    <div aria-hidden className="flex justify-center">
      <div className="flex w-[58%] flex-col gap-2.5 rounded-lg border border-line-soft p-3">
        <span className={`h-12 w-full ${BLOCK}`} />
        <span className={`h-2 w-[70%] ${BAR}`} />
        <span className={`h-1.5 w-full ${BAR}`} />
        <span className={`h-1.5 w-[80%] ${BAR}`} />
      </div>
    </div>
  );
}

/** Thank-you: a centred confirmation block. */
function ConfirmationBody() {
  return (
    <div aria-hidden className="flex flex-col items-center gap-2.5 py-2">
      <span className={`size-9 rounded-full bg-ink-100`} />
      <span className={`h-2.5 w-[52%] ${BAR}`} />
      <span className={`h-1.5 w-[70%] ${BAR}`} />
      <span className={`h-1.5 w-[40%] ${BAR}`} />
    </div>
  );
}

/** Home and generic-ui: a heading, a paragraph and a content row. */
function PageBody() {
  return (
    <div aria-hidden className="flex flex-col gap-3.5">
      <span className={`h-2.5 w-[55%] ${BAR}`} />
      <div className="flex flex-col gap-1.5">
        <span className={`h-1.5 w-[84%] ${BAR}`} />
        <span className={`h-1.5 w-[70%] ${BAR}`} />
      </div>
      <div className="mt-1 flex gap-2.5">
        <span className={`h-14 flex-1 ${BLOCK}`} />
        <span className={`h-14 flex-1 ${BLOCK}`} />
        <span className={`h-14 flex-1 ${BLOCK}`} />
      </div>
    </div>
  );
}

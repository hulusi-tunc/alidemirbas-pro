# Unused UI components (archived 2026-09-05)

Four components from `src/components/ui/` that nothing in `src/` imported any
more. Verified with a repo-wide grep (including `src/app/**`, dynamic imports,
the `*Routes.tsx` factories, `qa/**` and `scripts/**`) before the move. They
were moved here rather than deleted so their markup and design notes stay
readable; nothing in the build imports from `content/`.

| File | What it was | Why it went unused |
| --- | --- | --- |
| `HeroVideoCard.tsx` | Poster frame + play button that swapped in a `<video>` in place; the /lab/claude-lifecycle hero visual. | The page's AI-generated hero video and fragments were removed (commit 8385f00); the hero no longer has a clip to play. |
| `JourneyCarousel.tsx` | Autoplaying 1/2/3-up image carousel with pause-on-hover and wrap-around index. | Replaced on /lab/claude-lifecycle by real pattern flow diagrams (commit 225fada). The `journeyBuilder.carousel` copy block is still read by `JourneyBuilderPage.tsx` for the diagrams that succeeded it. |
| `HoverLift.tsx` | Client-side `motion` spring lift (`y`/`scale`) for server-rendered cards. | The card hover language moved to colour-only transitions (see the note inside `LabProjectGrid.tsx`); the last importer left with the Lab/Home card rebuilds. Its companion preset `springSoft` in `src/lib/motion.ts` was removed at the same time; `springSnap` stays (used by `NodeDetailPanel`). |
| `LabProjectGrid.tsx` | Three-column Lab project card grid shared by the home page and /lab. | Both pages grew their own layouts (`Site.tsx` side-by-side rows, `LabIndexPage.tsx` index) and stopped importing it. |

To restore one, `git mv` it back under `src/components/ui/` and import it; the
files still typecheck against the current `src/lib` modules.

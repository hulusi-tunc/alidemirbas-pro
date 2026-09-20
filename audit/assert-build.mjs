/* Proves the server you are measuring is the build you just made.

   THIS HAS COST THIS PROJECT TIME TWICE, both times producing findings that
   looked like real authoring bugs:

     - Batch B's first post-manifest guard run reported G5_NO_VISIBLE_ENDING
       and G6_DECISION_HIDDEN on five brand-new journeys, because a server
       left running from an earlier build was serving cached 404s for slugs
       that did not exist when it started.
     - Reconciling Batch B against the locale fix, `next start -p 4511`
       silently FAILED TO BIND - another worktree's server already held the
       port - so the measurement ran against a pre-merge build and reported
       a TR locale leak in `distinctFrom` names that did not exist.

   Both look like data problems and are not, which is the expensive part: you
   go and read the journey. `next start` exiting on a busy port is the nastier
   of the two, because the port answers 200 and every page renders.

   Next writes a fresh BUILD_ID for every build and echoes it in the RSC
   payload of every page, so comparing the two is enough and needs no
   instrumentation in the app. Every gate that measures a render calls this
   first and refuses to report numbers it cannot vouch for. */
import fs from "node:fs";

export async function assertServerBuild(port, root = new URL("..", import.meta.url).pathname) {
  let onDisk;
  try {
    onDisk = fs.readFileSync(root + ".next/BUILD_ID", "utf8").trim();
  } catch {
    throw new Error(
      `assert-build: no .next/BUILD_ID at ${root}. Run \`npm run build\` before a render gate - measuring a server whose build you cannot identify is how a stale render gets reported as a data defect.`,
    );
  }

  let html;
  try {
    const res = await fetch(`http://localhost:${port}/lab/journeys`);
    html = await res.text();
  } catch (e) {
    throw new Error(`assert-build: nothing answering on port ${port} (${String(e).slice(0, 80)}). Start the server you intend to measure.`);
  }

  if (!html.includes(onDisk)) {
    throw new Error(
      `assert-build: the server on port ${port} is NOT serving this checkout's build (${onDisk}).\n` +
        `  Most likely \`next start -p ${port}\` failed to bind because another worktree's server already holds the port - it exits, the old server keeps answering 200, and every page renders from the OLD build.\n` +
        `  Check with: ps -eo pid,args | grep next-server    then kill the stale one and start again.\n` +
        `  Do not interpret findings from this run: they describe a build you did not make.`,
    );
  }
  return onDisk;
}

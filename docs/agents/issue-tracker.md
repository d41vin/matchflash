# Issue tracker: Local Markdown

Issues and specs for this repository live as Markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature>/`
- The spec is `.scratch/<feature>/spec.md`
- Implementation issues are one file per ticket at `.scratch/<feature>/issues/<number>-<slug>.md`, numbered from `01`; never use a single combined tickets file.
- Comments and conversation history append to the bottom of an issue file under a `## Comments` heading.

## When a skill says "publish to the issue tracker"

Create a new file under `.scratch/<feature>/`, creating the directory if needed.

## When a skill says "fetch the relevant ticket"

Read the file at the referenced path. The user will normally provide the path or issue number directly.

## Wayfinding operations

Used by `/wayfinder`.

- **Map:** `.scratch/<feature>/map.md` — the notes, decisions-so-far, and fog body.
- **Child ticket:** `.scratch/<feature>/issues/NN-<slug>.md`, numbered from `01`, with the question in the body.
- A `Type:` line records the ticket type (`research`, `prototype`, `grilling`, or `task`); a `Status:` line records `claimed` or `resolved`.
- **Blocking:** a `Blocked by: NN, NN` line near the top. A ticket is unblocked when every listed file is `resolved`.
- **Frontier:** scan `.scratch/<feature>/issues/` for open, unblocked, unclaimed files; first by number wins.
- **Claim:** set `Status: claimed` and save before starting work.
- **Resolve:** append the answer under an `## Answer` heading, set `Status: resolved`, then append a context pointer to the map's decisions-so-far in `map.md`.

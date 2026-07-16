# Domain docs

How engineering skills should consume this repository's domain documentation when exploring the codebase.

## Before exploring, read these

- `CONTEXT.md` at the repository root; or
- `CONTEXT-MAP.md` at the repository root, if it exists. It points at one `CONTEXT.md` per context; read each one relevant to the topic.
- `docs/adr/` — read ADRs that touch the area being changed.

If any of these files do not exist, proceed silently. Do not flag their absence or suggest creating them upfront. The domain-modeling workflow creates them when terms or decisions are actually resolved.

## File structure

This is a single-context repository:

```text
/
├── CONTEXT.md
├── docs/adr/
└── src/
```

## Use the glossary's vocabulary

When naming a domain concept in an issue title, refactor proposal, hypothesis, or test name, use the term defined in `CONTEXT.md`. Do not drift to synonyms the glossary explicitly avoids. If a needed concept is not in the glossary, reconsider whether the project already has a term; otherwise, note the gap for domain modeling.

## Flag ADR conflicts

If proposed work contradicts an existing ADR, surface that conflict explicitly rather than silently overriding it.

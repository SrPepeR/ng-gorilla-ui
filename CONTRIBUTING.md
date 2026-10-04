# Contributing to ngx-gorilla-ui

Thanks for your interest in `ngx-gorilla-ui`. This guide covers the principles every change must respect, how branches and releases work, and what "done" means.

## Premises

These come before any other consideration. A change that breaks one of them is not merged.

1. **Accessibility is verified, not assumed.**
   - Every background and text pair passes WCAG AA contrast in every variant and in both themes, checked automatically.
   - Components honor `prefers-color-scheme`, `prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-contrast: more`, and `forced-colors`.
   - Everything works with a keyboard and a screen reader.
2. **Every token can be overridden from the app's CSS.**
   - Colors, sizes, spacing, radii, shadows, typography, and motion are CSS custom properties, not compiled values.
   - Library styles live in `@layer gorilla` and use low-specificity `:where()` selectors, so any app rule wins without `!important`.
   - Each component reads its own variables (for example `--gorilla-button-radius`), so it can be restyled app-wide, per component, or per instance.
   - Token names are public API: they are documented and follow semantic versioning.
3. **No abrupt changes.**
   - Every visual change (color, size, position, opacity, entering, and leaving) is a transition or an animation driven by motion tokens (`--gorilla-duration-*`, `--gorilla-easing-*`).
   - The only exception is `prefers-reduced-motion: reduce`, where durations drop to zero.
4. **Performance is a requirement.**
   - CSS before JavaScript, `OnPush`, signals, and zoneless compatibility.
   - One entry point per component, each with a size budget enforced in CI.
   - Animations use `transform` and `opacity` whenever possible.

## Branches

1. Every version has a `release/<version>` branch (for example `release/0.1.0`) created from `main`.
2. Work happens on a branch created from the current `release/<version>` (`feat/button`, `fix/...`, `docs/...`) and ends with a pull request into that `release/<version>`.
3. When everything planned for the version is merged, a pull request goes from `release/<version>` into `main`.
4. Nobody pushes directly to `main` or `release/*`. Both require a pull request with green CI.

## Releases

> **Planned:** the release workflow does not exist yet (roadmap point 0.8). Until it lands, merging into `main` does not tag or publish anything.

Once in place, merging a `release/<version>` pull request into `main` will trigger the release workflow. It:

1. Runs every CI check again.
2. Verifies that the version in the branch name matches `projects/ngx-gorilla-ui/package.json` and the first section of `CHANGELOG.md`.
3. Builds the library, creates the `v<version>` tag, and creates a GitHub Release with the changelog notes.
4. Publishes to npm with trusted publishing and provenance.

If any step fails, nothing is published.

## Definition of done

A component or change is done when:

- It meets the four premises above.
- It has behavior tests (Vitest in browser mode) and passes axe in both themes.
- Its documentation page in the catalog app is created or updated in the same pull request: usage guide, API, tokens, live examples, and accessibility notes. The documentation is built with the library itself.
- `CHANGELOG.md` has an entry under the version in progress.
- Lint, formatting, tests, build, and size budgets pass.

## Development

Requirements: Node 24 (see `.nvmrc`) and, the first time, the Chromium build used by the tests: `npx playwright install chromium`.

| Command | What it does |
|---|---|
| `npm start` | Builds the library and serves the catalog at `http://localhost:4200`. |
| `npm run watch` | Rebuilds the library on every change; run it next to `npm start`. |
| `npm test` | Runs the library and catalog unit tests once, in Chromium (Vitest browser mode). |
| `npm run test:watch` | Runs the library unit tests in watch mode. |
| `npm run lint` | Lints TypeScript and templates, including the accessibility rules. |
| `npm run format` | Formats the code with Prettier. |
| `npm run size` | Checks the size budget of each entry point against the last build. |
| `npm run verify` | Everything CI checks: lint, format, tests, build, and size budgets. Run it before opening a pull request. |

## Commits

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`...) and are written in English.

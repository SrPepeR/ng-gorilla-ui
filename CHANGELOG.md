# Changelog

All notable changes to `ngx-gorilla-ui`. The project follows [Semantic Versioning](https://semver.org/): `0.x` while the API settles, and `1.0.0` once the navigation and layout components ([roadmap](./docs/ROADMAP.md) point 5, in Spanish) are done.

The history of `ngx-monkey-ui`, the previous library, up to the unreleased `0.3.2`, is in the [`CHANGELOG.md` of the `ngx-monkey-ui-legacy` tag](https://github.com/SrPepeR/ng-gorilla-ui/blob/ngx-monkey-ui-legacy/CHANGELOG.md) (in Spanish).

## 0.1.0 (unreleased)

First version of `ngx-gorilla-ui`: the workspace and its tooling (roadmap point 0) and the foundations with the button (point 1).

### Added

- Design tokens in `ngx-gorilla-ui/styles/tokens.css`, inside `@layer gorilla` so any app rule overrides them without `!important`:
  - Eight 12-step palettes with `light-dark()` (gray, cyan, violet, magenta, green, amber, red, blue). The brand solids keep the `ngx-monkey-ui` tones in both themes.
  - Color roles (`primary`, `secondary`, `tertiary`, `neutral`, `success`, `warning`, `danger`, `info`) whose solid and subtle pairs pass WCAG AA in both themes, plus surfaces, text, borders, focus ring, and selection.
  - Spacing, radius, shadow, typography, control height, and motion scales.
  - Reduced motion (durations to `0s`), reduced transparency (the scrim becomes nearly opaque), more contrast, and forced colors support.
- `ngx-gorilla-ui/theme`: `GorillaTheme` (`theme`, `resolvedTheme`, `setTheme()`) and `provideGorillaTheme()`. Light, dark, and system themes; the choice is stored in `localStorage`, `system` follows `prefers-color-scheme` changes, and nothing is read or stored on the server.
- `ngx-gorilla-ui/core`: `GorillaVariant`, the directive that components add through `hostDirectives` to get the `variant`, `color`, and `size` inputs as host classes, with the `GorillaVariantName`, `GorillaColor`, and `GorillaSize` types.
- `ngx-gorilla-ui/button`: `GorillaButton` on the native `<button>` and `<a>` elements (`button[gorilla-button]`, `a[gorilla-button]`), with no wrapper:
  - Eight colors, five sizes (`xs` to `xl`), and four appearances (`filled`, `tonal`, `outlined`, `text`), in the `default` variant: slightly rounded corners, bold text, a glow in the role color on filled buttons, and a springy scale on hover and press.
  - `disabled` sets the native attribute on `<button>`; on `<a>` it removes `href` and sets `role="link"`, `aria-disabled="true"`, and `tabindex="-1"`, restoring the author's values when enabled (also after server-side rendering). No click handler runs while disabled.
  - Focus ring on keyboard focus only, transitions with the motion tokens, and `--gorilla-button-*` custom properties (hover and press transforms included) to override it globally, for a part of the page, or for one button.
  - The `variant` input arrives with the other five variants; for now every button uses `default`.

### Project

- Angular 22 workspace with the `ngx-gorilla-ui` library (primary entry point exporting `GORILLA_VERSION`) and the zoneless `ngx-gorilla-ui-catalog` documentation app. Requires Node 24.
- Tooling: unit tests with Vitest in browser mode (Playwright, Chromium), ESLint with `angular-eslint` (`gorilla` selector prefix, template accessibility rules, no `any`), and CI running lint, format, tests, and build on every pull request.
- Catalog pages for theming, tokens, and the button, with a light, dark, and system theme switcher.
- Size budget per entry point with `size-limit` (`npm run size`), checked in `verify` and in CI.
- Supported browsers: the last two versions of Chrome, Edge, Firefox, and Safari, desktop and mobile (`.browserslistrc`).
- Contribution rules in `CONTRIBUTING.md`: premises (verified accessibility, overridable tokens, no abrupt changes, performance), branch flow, releases, and definition of done.
- CI also runs on pushes to `release/**` branches.

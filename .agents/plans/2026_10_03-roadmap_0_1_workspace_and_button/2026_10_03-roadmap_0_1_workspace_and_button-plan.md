---
name: "2026_10_03-roadmap_0_1_workspace_and_button"
description: "Puntos 0 y 1 del roadmap: workspace de ngx-gorilla-ui en Angular 22, tooling, tokens, tema, directiva de variante, botón, documentación y workflow de release (versión 0.1.0)"
created_at: "2026-10-03T11:53:55Z"

created_by:
  tool: "Claude Code"
  model:
    name: "Claude Opus"
    version: "5.5"
    reasoning_effort: "low"

implemented_by:
  tool: "Claude Code"
  model:
    name: "Claude Opus"
    version: "5.5"
    reasoning_effort: "low"

last_implementation_at: "2026-10-04T09:45:00Z"
has_completed_all_phases: "false"
---

# Puntos 0 y 1: workspace de ngx-gorilla-ui y el botón

## Objetivo

Sustituir el workspace de `ngx-monkey-ui` por uno nuevo en Angular 22 con la librería `ngx-gorilla-ui` y su app de documentación, y validar la arquitectura de punta a punta con el primer componente: tokens, tema, directiva de variante y `gorilla-button` en sus seis variantes, accesible, documentado y listo para publicarse como `0.1.0`.

## Contexto

- Reglas del proyecto: [`AGENTS.md`](../../../AGENTS.md) (idioma, premisas, flujo de ramas, definición de terminado) y [`CONTRIBUTING.md`](../../../CONTRIBUTING.md).
- Roadmap y estado de cada punto: [`docs/ROADMAP.md`](../../../docs/ROADMAP.md), puntos 0 (0.4, 0.5, 0.7, 0.8) y 1 (1.1 a 1.8).
- Premisas, principios, decisiones técnicas, variantes y colores: [`docs/PROPUESTA-NGX-GORILLA-UI.md`](../../../docs/PROPUESTA-NGX-GORILLA-UI.md), secciones 3 y 7.
- Errores que no se pueden repetir: [`docs/ERRORES-A-EVITAR.md`](../../../docs/ERRORES-A-EVITAR.md). Este plan cubre E-02, E-03, E-04, E-05, E-11, E-14, E-22, E-24, R-02, R-03, R-06, R-07, R-09, R-12 y R-13 en lo que aplica al tema y al botón.
- Workspace actual (Angular 18.2), que se sustituye:
  - [`package.json`](../../../package.json): scripts con `ngx-monkey-ui`, Karma y Jasmine, `@angular-devkit/build-angular`, `engines.node` `^22.22.3`.
  - [`angular.json`](../../../angular.json): proyectos `ngx-monkey-ui` y `ngx-monkey-ui-tests`, y `cli.analytics` (se elimina).
  - [`tsconfig.json`](../../../tsconfig.json): flags estrictos que se conservan (`strict`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `strictTemplates`).
  - `eslint.config.js` (se borra en la fase 1 y se recrea en la fase 2): estructura que se conserva (typescript-eslint, angular-eslint con `templateAccessibility`, `eslint-config-prettier`), con el prefijo `monkey` que pasa a `gorilla`.
  - [`.prettierrc.json`](../../../.prettierrc.json), [`.prettierignore`](../../../.prettierignore) y [`.editorconfig`](../../../.editorconfig): se conservan.
  - [`.nvmrc`](../../../.nvmrc) (22.23.3, pasa a 24), `.hintrc` (se elimina), [`.vscode/`](../../../.vscode) y [`.claude/launch.json`](../../../.claude/launch.json) (pasan a apuntar al catálogo).
  - [`.github/workflows/ci.yml`](../../../.github/workflows/ci.yml): el job se llama `build-and-test` y **ese nombre no puede cambiar**, porque es el check obligatorio de la protección de `main` y `release/**`.
  - `projects/ngx-monkey-ui` y `projects/ngx-monkey-ui-tests`: se borran en la fase 1; siguen en el tag `ngx-monkey-ui-legacy`.
- Valores de partida del legacy:
  - `MonkeyStyle` en tema claro: primary `#40d2ec`, secondary `#967adc`, tertiary `#ff00ff`, success `#32cd32`, warning `#ffcc00`, danger `#dc3545`, info `#17a2b8`, fondo `#fbfbfb`/`#121212`. Decisión: **los tonos claros de primary, secondary y tertiary se usan en los dos temas** (en monkey el tema oscuro cambiaba de tono), con escalas de 12 pasos ajustadas para pasar AA.
  - Botón brutalist: borde de 2 px, radio 0, sombra sólida desplazada 8 px (`::after`), negrita. Botón glass: `backdrop-filter: blur(30px)`, radio 15 px, borde de 1 px translúcido, transición de 0,3 s.
  - Tests de aceptación a reescribir: `ThemeService` (E-11: persiste la elección y sigue a `prefers-color-scheme` mientras el usuario no elija; la elección guardada tiene prioridad sobre el sistema), `Styleable` (E-22: `disabled` vuelve a `false`), `MonkeyIconButton` (E-24: no reacciona a clics fuera del botón ni con el botón deshabilitado).
- Versiones actuales en npm (2026-10-03): `@angular/cli`, `@angular/cdk` y `@angular/aria` 22.2.1, `ng-packagr` 22.2.4, `angular-eslint` 22.5.0, `typescript-eslint` 8.71.0, `eslint` 10.12.0, `vitest` y `@vitest/browser-playwright` 5.0.3, `playwright` y `@playwright/test` 1.63.0, `@axe-core/playwright` 4.13.0, `size-limit` y `@size-limit/file` 14.1.0, `prettier` 3.9.9. TypeScript lo fija Angular 22 (`>=6.0 <6.1`): no usar la 7 aunque sea la última.
- Decisiones de este plan:
  - Ocho fases; cada una se implementa en su propia rama creada desde `release/0.1.0` y termina con una pull request hacia `release/0.1.0`.
  - El botón es un **atributo sobre el elemento nativo**: `<button gorilla-button>` y `<a gorilla-button>`, sin envoltorio, con `appearance` (`filled`, `tonal`, `outlined`, `text`).
  - La variante `default` se elige entre 2 o 3 propuestas que se muestran en el catálogo durante la fase 4.
  - La app de documentación es `projects/ngx-gorilla-ui-catalog` (inglés, construida con la librería).

## Contratos públicos

### Entry points de la librería

- `ngx-gorilla-ui`: entry point principal, solo exporta `GORILLA_VERSION: string`. No re-exporta los secundarios, para que el tree shaking dependa del import.
- `ngx-gorilla-ui/theme`:
  - `type GorillaThemeMode = 'light' | 'dark' | 'system'`.
  - `type GorillaResolvedTheme = 'light' | 'dark'`.
  - `interface GorillaThemeOptions { defaultTheme?: GorillaThemeMode; storageKey?: string }` (por defecto `'system'` y `'gorilla-theme'`).
  - `provideGorillaTheme(options?: GorillaThemeOptions): EnvironmentProviders`.
  - `class GorillaTheme` (`providedIn: 'root'`):
    - `readonly theme: Signal<GorillaThemeMode>`.
    - `readonly resolvedTheme: Signal<GorillaResolvedTheme>`.
    - `setTheme(mode: GorillaThemeMode): void`.
  - Efecto en el documento: `data-theme` (`light`, `dark` o ausente con `system`) y `color-scheme` en `<html>`, vía `DOCUMENT`, sin tocar nada en el servidor.
- `ngx-gorilla-ui/styles/tokens.css` (asset publicado): todos los tokens en `@layer gorilla`, ver Tokens.
- `ngx-gorilla-ui/core`:
  - `type GorillaVariantName = 'default' | 'brutalist' | 'glass' | 'material' | 'minimal' | 'swift'`.
  - `type GorillaColor = 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'`.
  - `type GorillaSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'`.
  - `directive GorillaVariant` (selector `[gorillaVariant]`, pensada para `hostDirectives`): inputs `variant` (por defecto `'default'`), `color` (por defecto `'primary'`), `size` (por defecto `'md'`); enlaza al host las clases `gorilla-variant-<variant>`, `gorilla-color-<color>` y `gorilla-size-<size>` con un `computed()`.
- `ngx-gorilla-ui/button`:
  - `type GorillaButtonAppearance = 'filled' | 'tonal' | 'outlined' | 'text'`.
  - `component GorillaButton`, selector `button[gorilla-button], a[gorilla-button]`, `OnPush`, `hostDirectives: [{ directive: GorillaVariant, inputs: ['variant', 'color', 'size'] }]`.
    - Inputs: `appearance: GorillaButtonAppearance` (por defecto `'filled'`) y `disabled: boolean` (`booleanAttribute`, por defecto `false`).
    - En `<button>`: refleja `disabled` en el atributo nativo. En `<a>`: pone `aria-disabled="true"`, `tabindex="-1"` y anula la navegación y los clics mientras está deshabilitado.
    - Sin outputs propios: se usa el `(click)` nativo.

### Tokens CSS (API pública, prefijo `--gorilla-`)

- Paletas primitivas: `--gorilla-<tono>-1` a `-12` para `gray`, `cyan`, `violet`, `magenta`, `green`, `amber`, `red` y `blue`.
- Roles de color (`primary`, `secondary`, `tertiary`, `neutral`, `success`, `warning`, `danger`, `info`): `--gorilla-<rol>-solid`, `-solid-hover`, `-solid-active`, `-on-solid`, `-subtle`, `-subtle-hover`, `-on-subtle` y `-border`.
- Superficies, texto, bordes e interacción: `--gorilla-background`, `--gorilla-surface`, `--gorilla-surface-raised`, `--gorilla-surface-overlay`, `--gorilla-scrim`, `--gorilla-text`, `--gorilla-text-muted`, `--gorilla-text-disabled`, `--gorilla-text-inverse`, `--gorilla-border`, `--gorilla-border-strong`, `--gorilla-border-disabled`, `--gorilla-focus-ring` y `--gorilla-selection`.
- Escalas: `--gorilla-space-<n>`, `--gorilla-radius-<xs…xl|full>`, `--gorilla-shadow-<1…4>`, `--gorilla-font-family`, `--gorilla-font-size-<xs…xl>`, `--gorilla-font-weight-<regular|medium|bold>`, `--gorilla-line-height-<tight|normal>`, `--gorilla-control-height-<xs…xl>`.
- Movimiento: `--gorilla-duration-<fast|normal|slow>` y `--gorilla-easing-<standard|emphasized|spring>`; con `prefers-reduced-motion: reduce` las duraciones valen `0s`.
- Botón: `--gorilla-button-height`, `--gorilla-button-padding-inline`, `--gorilla-button-radius`, `--gorilla-button-gap`, `--gorilla-button-font-size`, `--gorilla-button-font-weight`, `--gorilla-button-background`, `--gorilla-button-color`, `--gorilla-button-border-color`, `--gorilla-button-border-width`, `--gorilla-button-shadow`, `--gorilla-button-transition-duration`.

### Suites de tests

- `projects/ngx-gorilla-ui/theme/src/gorilla-theme.spec.ts` (`GorillaTheme`):
  - uses `system` when nothing is stored and no default is provided.
  - uses the provided `defaultTheme` when nothing is stored.
  - restores the stored choice over the system preference (E-11).
  - stores the choice under the configured key when `setTheme()` is called (E-11).
  - follows `prefers-color-scheme` changes while the mode is `system` (E-11).
  - ignores `prefers-color-scheme` changes once the user picks `light` or `dark`.
  - `setTheme('system')` removes `data-theme` and stores `system`.
  - restores an explicit `system` choice over a fixed `defaultTheme`.
  - writes `data-theme` and `color-scheme` on `<html>`.
  - does not touch the document, `localStorage` nor `matchMedia` on the server platform (R-06).
- `projects/ngx-gorilla-ui/styles/tokens.spec.ts` (tokens en navegador real):
  - defines every semantic color token in light and dark themes.
  - every role pair (`-solid`/`-on-solid`, `-subtle`/`-on-subtle`) and `surface`/`text` passes AA contrast in both themes.
  - motion durations resolve to `0s` under `prefers-reduced-motion: reduce`.
  - an unlayered app rule overrides a token without `!important`.
- `projects/ngx-gorilla-ui/core/src/gorilla-variant.spec.ts` (`GorillaVariant`):
  - applies the default classes (`gorilla-variant-default`, `gorilla-color-primary`, `gorilla-size-md`).
  - updates the host classes when an input changes, without duplicates (E-04).
  - keeps static classes and classes added by the host component (E-05).
  - does not subscribe to `window` events nor use timers (E-02).
- `projects/ngx-gorilla-ui/button/src/gorilla-button.spec.ts` (`GorillaButton`):
  - renders the projected content inside the native `<button>` with no wrapper element.
  - applies `variant`, `color`, `size` and `appearance` classes to the host.
  - reflects `disabled` on the native button and re-enables it when `disabled` goes back to `false` (E-22).
  - does not fire `click` handlers while disabled (E-24).
  - on `<a>`, sets `aria-disabled` and `tabindex="-1"` and blocks navigation while disabled.
  - keeps `type="button"` when given and does not override author attributes (`type`, `aria-*`).
  - has a visible focus ring with `:focus-visible` only for keyboard focus.
  - transitions background, color, border and shadow, and the transition duration is `0s` under reduced motion.
- `projects/ngx-gorilla-ui-catalog/e2e/a11y.spec.ts` (Playwright con `@axe-core/playwright`):
  - every catalog page has no axe violations in the light theme.
  - every catalog page has no axe violations in the dark theme.
  - the button page has no violations with `forced-colors: active` and `prefers-contrast: more`.
  - the glass variant falls back to an opaque background with `prefers-reduced-transparency: reduce`.
- `projects/ngx-gorilla-ui-catalog/src/app/app.spec.ts`: the catalog boots zoneless and renders the navigation.

### Textos visibles (catálogo, en inglés)

- Navegación: `Getting started`, `Theming`, `Tokens`, `Button`.
- Selector de tema: `Light`, `Dark`, `System`. Selectores del botón: `Variant`, `Color`, `Size`, `Appearance`, `Disabled`.
- Página del botón: secciones `Usage`, `Examples`, `API`, `Tokens`, `Accessibility`.

### CI y publicación

- `.github/workflows/ci.yml`: job `build-and-test` (mismo nombre) con lint, formato, tests unitarios en Chromium, build de la librería y del catálogo, `size-limit` y Playwright con axe.
- `.github/workflows/release.yml`: se ejecuta en `push` a `main`; publica `ngx-gorilla-ui` en npm con trusted publishing y procedencia, crea el tag `v<versión>` y la GitHub Release.

## Fases

### Fase 1: workspace de Angular 22 y catálogo que arranca

Sustituye el workspace de Angular 18 por uno nuevo en Angular 22 con la librería vacía y el catálogo, y borra `ngx-monkey-ui` en la misma pull request. Al terminar, `npm start` abre el catálogo y la CI lo construye.

- [x] Crear la rama `chore/gorilla-workspace` desde `release/0.1.0` (este plan va en ella).
- [x] Generar un workspace temporal con `ng new` (Angular 22.2, `--create-application=false`, estilos CSS) fuera del repositorio y copiar `angular.json`, `package.json`, `tsconfig.json` y `.gitignore`, conservando los flags estrictos del `tsconfig.json` actual y sin `cli.analytics`.
- [x] Borrar `projects/ngx-monkey-ui`, `projects/ngx-monkey-ui-tests`, `.hintrc` y las dependencias de Karma, Jasmine y `@angular-devkit/build-angular`.
- [x] Generar `projects/ngx-gorilla-ui` (`ng generate library`) con `package.json` `name: ngx-gorilla-ui`, `version: 0.0.0`, `sideEffects: false` y `peerDependencies` `@angular/core` y `@angular/common` `^22.2.0`; entry point principal con `GORILLA_VERSION`.
- [x] Generar `projects/ngx-gorilla-ui-catalog` (`ng generate application`, CSS, sin SSR, zoneless) con una página `Getting started` que muestra `GORILLA_VERSION` importado desde la librería por el `paths` del `tsconfig.json`.
- [x] Node 24: `.nvmrc` a la última 24 LTS y `engines.node` `^24.15.0`; `.browserslistrc` con las dos últimas versiones de Chrome, Edge, Firefox y Safari (escritorio y móvil).
- [x] Scripts de `package.json`: `start` (catálogo), `build` (librería y catálogo), `format`, `format:check` y `verify` (por ahora `format:check` y `build`).
- [x] Adaptar `.github/workflows/ci.yml` manteniendo el job `build-and-test`: `npm ci`, `format:check` y `build`.
- [x] Actualizar `.vscode/launch.json`, `.vscode/tasks.json` y `.claude/launch.json` al catálogo.
- [x] Marcar 0.4 y 0.7 en `docs/ROADMAP.md` y añadir la entrada en `CHANGELOG.md` (0.1.0).
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run verify`). Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest pull request titles. Do NOT proceed to the next phase until the user explicitly asks.

### Fase 2: tests en navegador, lint y CI completa

Añade el tooling de calidad sobre el workspace vacío: Vitest en modo navegador con Playwright, ESLint con el prefijo `gorilla` y la CI con todas las comprobaciones.

- [x] Crear la rama `chore/gorilla-tooling` desde `release/0.1.0`.
- [x] Vitest con `@angular/build:unit-test` en la librería y el catálogo, en modo navegador con Playwright (Chromium, headless en CI), con `vitest`, `@vitest/browser-playwright` y `playwright`.
- [x] Primer test real: `app.spec.ts` del catálogo (arranca zoneless y pinta la navegación), y `version.spec.ts` en la librería (`GORILLA_VERSION` coincide con su `package.json`).
- [x] ESLint con `angular-eslint` 22 y `typescript-eslint` en flat config: prefijo `gorilla` para componentes (kebab-case) y directivas (camelCase), `templateAccessibility`, `eslint-config-prettier`, y reglas `no-explicit-any` y `ban-ts-comment` como error (R-12).
- [x] Scripts `lint`, `test`, `test:ci` y `verify` (`lint`, `format:check`, `test:ci` y `build`).
- [x] CI: `npx playwright install --with-deps chromium`, `lint`, `test:ci`, con caché de los navegadores de Playwright.
- [x] Documentar en `CONTRIBUTING.md` los comandos (`npm start`, `npm test`, `npm run verify`).
- [x] Marcar 0.5 en `docs/ROADMAP.md` y añadir la entrada en `CHANGELOG.md`.
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run verify`). Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest pull request titles. Do NOT proceed to the next phase until the user explicitly asks.

### Fase 3: tokens y tema

Primer entry point real: los tokens en CSS y `GorillaTheme`. El catálogo muestra los tokens en los dos temas con un selector de tema, y permite revisar la paleta antes de construir el botón.

- [x] Crear la rama `feat/theme-tokens` desde `release/0.1.0`.
- [x] `styles/tokens.css` con la capa `@layer gorilla`: paletas primitivas de 12 pasos (gris neutro, cian, violeta y magenta desde los tonos claros de `MonkeyStyle`, y verde, ámbar, rojo y azul para los estados), roles semánticos con `light-dark()`, superficies, texto, bordes, interacción, escalas y movimiento, publicado como asset en `ng-package.json`.
- [x] Reglas de preferencias en los tokens: `prefers-reduced-motion` (duraciones a `0s`), `prefers-contrast: more` (bordes y texto reforzados) y `forced-colors` (colores del sistema).
- [x] Entry point `ngx-gorilla-ui/theme` con `GorillaTheme`, `provideGorillaTheme()` y sus tipos, sin acceso directo a `window`, `document` ni `localStorage` (`DOCUMENT`, `isPlatformBrowser`). Ajustar el target `test` de la librería (`include`) y `tsconfig.lib.json` para que cubran las carpetas de los entry points secundarios, que quedan fuera de `src/`.
- [x] Suites `gorilla-theme.spec.ts` y `tokens.spec.ts` con todos sus casos.
- [x] Catálogo: `provideGorillaTheme()`, selector `Light`/`Dark`/`System` en la cabecera y páginas `Theming` (cómo usar el tema y sobrescribir tokens) y `Tokens` (paletas, roles con su contraste, escalas).
- [x] Revisar con el usuario las paletas en el catálogo y ajustar los pasos que no pasen AA. Las paletas se generan con `npm run tokens:palette` (`scripts/generate-palette.mjs`), que falla si un par no pasa AA.
- [x] Marcar 1.1 y 1.2 en `docs/ROADMAP.md` y añadir la entrada en `CHANGELOG.md`.
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run verify`). Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest pull request titles. Do NOT proceed to the next phase until the user explicitly asks.

### Fase 4: directiva de variante y botón `default`

La directiva `GorillaVariant` y el botón completo en la variante `default`: ocho colores, cinco tamaños, cuatro apariencias, `disabled` y transiciones. El aspecto de `default` se elige entre propuestas en el catálogo.

- [x] Crear la rama `feat/button` desde `release/0.1.0`.
- [x] Entry point `ngx-gorilla-ui/core` con `GorillaVariant` y sus tipos, y la suite `gorilla-variant.spec.ts`.
- [x] Entry point `ngx-gorilla-ui/button` con `GorillaButton` sobre `button` y `a`, estilos en `@layer gorilla` con selectores `:where()`, variables propias `--gorilla-button-*` y transiciones con los tokens de movimiento.
- [ ] Implementar 2 o 3 propuestas de la variante `default` (por ejemplo suave y redondeada, geométrica y nítida, expresiva y tonal) en una página temporal del catálogo; el usuario elige una y se borran las demás.
- [x] Suite `gorilla-button.spec.ts` con todos sus casos.
- [ ] `size-limit` con `@size-limit/file` sobre el build de cada entry point (`core`, `theme`, `button`): medir y fijar el límite con un 10 % de margen; script `size` en `verify` y en la CI.
- [ ] Página `Button` del catálogo con ejemplos de colores, tamaños, apariencias y `disabled` (la documentación completa llega en la fase 7).
- [ ] Añadir la entrada en `CHANGELOG.md` y marcar 1.3 en `docs/ROADMAP.md` (1.4 se marca en la fase 5).
- [ ] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run verify`). Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest pull request titles. Do NOT proceed to the next phase until the user explicitly asks.

### Fase 5: las otras cinco variantes

Añade `brutalist`, `glass`, `material`, `minimal` y `swift` al botón, cada una con su forma, elevación, bordes y movimiento, leyendo los mismos tokens de color.

- [ ] Crear la rama `feat/button-variants` desde `release/0.1.0`.
- [ ] `brutalist`: bordes gruesos, sombra sólida desplazada sin desenfoque, esquinas rectas, negrita (partiendo del legacy: 2 px y 8 px), con la sombra que se recoge al pulsar.
- [ ] `glass`: fondo translúcido con `backdrop-filter` (partiendo de `blur(30px)` y radio 15 px), borde fino claro, y fondo opaco de respaldo con `@supports not (backdrop-filter: blur(1px))` y con `prefers-reduced-transparency: reduce`.
- [ ] `material`: forma de Material 3 Expressive (píldora que se cuadra al pulsar), capa de estado con opacidad para hover, foco y pulsación, elevación tonal y curva de muelle.
- [ ] `minimal`: sin sombras, borde fino o ninguno, acentos de color contenidos y mucho aire.
- [ ] `swift`: esquinas continuas grandes, estilo de botón de iOS (filled, tinted, bordered, plain para las cuatro apariencias) y animación suave de escala al pulsar.
- [ ] Ampliar `gorilla-button.spec.ts`: cada variante aplica su clase, sus tokens de forma y mantiene las transiciones; `glass` sin `backdrop-filter` cae al fondo opaco.
- [ ] Página `Button`: matriz de variantes por apariencia y color, en los dos temas.
- [ ] Revisar el límite de `size-limit` del botón.
- [ ] Marcar 1.4 en `docs/ROADMAP.md` y añadir la entrada en `CHANGELOG.md`.
- [ ] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run verify`). Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest pull request titles. Do NOT proceed to the next phase until the user explicitly asks.

### Fase 6: accesibilidad y preferencias comprobadas en la CI

Comprueba en navegador real que el botón cumple las premisas 1, 2 y 3 en las seis variantes y los dos temas, y lo deja vigilado en la CI con Playwright y axe.

- [ ] Crear la rama `test/a11y` desde `release/0.1.0`.
- [ ] Playwright (`@playwright/test`) con `webServer` sobre el catálogo y `@axe-core/playwright`; suite `e2e/a11y.spec.ts` con todos sus casos.
- [ ] Corregir lo que salga: contraste de cada combinación variante, apariencia y color; anillo de `:focus-visible` visible sobre cualquier fondo; `forced-colors` y `prefers-contrast: more` en las seis variantes.
- [ ] Comprobar con tests que un token sobrescrito en la app (global, por componente y por instancia) cambia el botón sin `!important`.
- [ ] Script `e2e`, añadido a `verify` y a la CI (job `build-and-test`).
- [ ] Marcar 1.5 y 1.7 en `docs/ROADMAP.md` y añadir la entrada en `CHANGELOG.md`.
- [ ] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run verify`). Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest pull request titles. Do NOT proceed to the next phase until the user explicitly asks.

### Fase 7: documentación del botón y despliegue

Convierte el catálogo en la documentación pública: página completa del botón y la app desplegada en Vercel con vista previa por pull request.

- [ ] Crear la rama `docs/button-page` desde `release/0.1.0`.
- [ ] Página `Button` con `Usage` (importar el entry point, `tokens.css` y el tema), `Examples` en vivo, `API` (inputs, tipos, valores por defecto), `Tokens` (variables que se pueden sobrescribir, con ejemplo) y `Accessibility` (teclado, `<a>` deshabilitado, preferencias del usuario).
- [ ] Playground con los selectores `Variant`, `Color`, `Size`, `Appearance` y `Disabled`, que muestra el código del ejemplo.
- [ ] Página `Getting started` con instalación, `provideGorillaTheme()` y la carga de `tokens.css`.
- [ ] Crear el proyecto nuevo de Vercel conectado al repositorio (lo hace el usuario o Claude con su permiso): directorio de salida `dist/ngx-gorilla-ui-catalog/browser`, rewrites a `index.html` en `vercel.json` y vista previa por pull request.
- [ ] Enlazar la documentación desde `README.md`.
- [ ] Marcar 1.6 y 1.8 en `docs/ROADMAP.md` y añadir la entrada en `CHANGELOG.md`.
- [ ] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run verify`). Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest pull request titles. Do NOT proceed to the next phase until the user explicitly asks.

### Fase 8: workflow de release y versión 0.1.0

Automatiza la publicación y deja `release/0.1.0` lista para la pull request hacia `main`.

- [ ] Crear la rama `ci/release-workflow` desde `release/0.1.0`.
- [ ] `.github/workflows/release.yml` en `push` a `main` cuando el commit es el merge de una `release/<versión>`: repite las comprobaciones de la CI, comprueba que la versión de la rama coincide con `projects/ngx-gorilla-ui/package.json` y con la primera sección de `CHANGELOG.md`, construye la librería, publica con `npm publish --provenance` desde `dist/ngx-gorilla-ui` (permiso `id-token: write`, npm ≥ 11.5.1), y crea el tag `v<versión>` y la GitHub Release con las notas del changelog. Si algo falla, no se publica nada.
- [ ] Script de comprobación de versión (`scripts/check-release-version.mjs`) usado por el workflow, con un test. Comprueba también que `GORILLA_VERSION` (`projects/ngx-gorilla-ui/src/version.ts`) coincide con la versión de la rama.
- [ ] Confirmar si npm permite configurar el trusted publisher antes de que exista el paquete; si no, documentar el paso manual de la primera publicación. El usuario configura el trusted publisher en npm.
- [ ] Versión `0.1.0` en `projects/ngx-gorilla-ui/package.json` y `CHANGELOG.md` con la sección `0.1.0` completa.
- [ ] Quitar de `CONTRIBUTING.md` y `AGENTS.md` la nota de que el workflow de release todavía no existe.
- [ ] Marcar 0.8, y los puntos 0 y 1, en `docs/ROADMAP.md`.
- [ ] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run verify`). Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest pull request titles. Do NOT proceed to the next phase until the user explicitly asks.

## Siguiente paso

Cerrar la fase 3: que el usuario revise las paletas y los roles en la página `Tokens` del catálogo, en los dos temas, y ajustar lo que pida; después, la fase 4 (directiva de variante y botón `default`) en la rama `feat/button`.

The gorilla moved into its new Angular 22 home, 🐢 💨 (Turbotuga™, [Codely](https://codely.com)'s mascot) carried the boxes, a robot inspects every room, and the walls just got painted in light and dark. 🏠 🦍 🐢 💨 🤖 🎨

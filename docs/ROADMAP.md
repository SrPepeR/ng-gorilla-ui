# Roadmap de ngx-gorilla-ui

Hoja de ruta de `ngx-gorilla-ui`. El porqué de cada decisión, las premisas, los principios de arquitectura, las variantes y los tokens de color están en la [propuesta](./PROPUESTA-NGX-GORILLA-UI.md), y los errores que no se pueden repetir, en [`ERRORES-A-EVITAR.md`](./ERRORES-A-EVITAR.md).

## Cómo se trabaja

- Cada punto es una o varias pull requests con su plan en `.agents/plans`, siguiendo el flujo de ramas y releases de la [sección 7 de la propuesta](./PROPUESTA-NGX-GORILLA-UI.md#7-flujo-de-trabajo).
- Cada componente nace cumpliendo las premisas de la [sección 3 de la propuesta](./PROPUESTA-NGX-GORILLA-UI.md#3-premisas-y-principios). Eso incluye señales, `OnPush`, variantes por directiva y tokens propios sobreescribibles. También transiciones en todos sus cambios de estado, tests de comportamiento, test de accesibilidad con axe, su límite de tamaño y su página de documentación.
- Al terminar un sub-punto se marca aquí, en la misma pull request.
- Versiones: la `0.1.0` incluye los puntos 0 y 1. La `1.0.0` se publica al terminar el punto 5.

## Puntos

- [ ] 0. Cerrar ngx-monkey-ui y preparar el workspace.
  - [x] 0.1. Terminar el punto 13 de `ngx-monkey-ui` (fase 5: `CHANGELOG.md` y documentación), mergear `fix/functional-bugs` y crear el tag `ngx-monkey-ui-legacy`, sin publicar la `0.3.2`.
  - [x] 0.2. Descartar los puntos 14 a 27 del roadmap de `ngx-monkey-ui` (ver [Antecedentes](#antecedentes-ngx-monkey-ui)). La propuesta y este roadmap pasan a `docs/`, el análisis pasa a ser `docs/ERRORES-A-EVITAR.md`, y `CHANGELOG.md` y `README.md` empiezan de nuevo, en inglés, para `ngx-gorilla-ui`.
  - ~~0.3. (Opcional) Desplegar el catálogo legacy en Vercel como referencia visual fija.~~ Descartado: para comparar basta con un `git worktree` del tag.
  - [x] 0.4. Workspace limpio en Angular 22 con `projects/ngx-gorilla-ui` y `projects/ngx-gorilla-ui-catalog`; borrar `ngx-monkey-ui` y `ngx-monkey-ui-tests` de `main` en la misma pull request.
  - [x] 0.5. Node 24, Vitest (`@angular/build:unit-test`) en modo navegador con Playwright, ESLint y Prettier adaptados, `.browserslistrc` con las dos últimas versiones de los navegadores principales, CI con lint, formato, tests y build en cada pull request y en cada push a `main` y a `release/**`. Catálogo zoneless.
  - [x] 0.6. Cerrar las decisiones de nombres. Renombrado el repositorio a `ng-gorilla-ui`.
  - [x] 0.7. Flujo de ramas: rama `release/0.1.0` y protección de `main` y de `release/*` (pull request obligatoria con la CI `build-and-test` en verde, sin borrado ni force-push), `CONTRIBUTING.md`, `AGENTS.md` y la CI en los push a `release/**`.
  - [ ] 0.8. Workflow de release:
    - Se ejecuta al mergear en `main` una pull request desde `release/<versión>`, con la CI en verde.
    - Comprueba que la versión de la rama coincide con `package.json` y `CHANGELOG.md`.
    - Crea el tag `v<versión>` y la GitHub Release con las notas del changelog.
    - Publica en npm con trusted publishing y procedencia. Configurar el trusted publisher en npm es un paso manual del propietario del paquete.

- [ ] 1. Fundamentos, con el botón como primer componente.
  - Un solo componente para validar toda la arquitectura de punta a punta antes de multiplicarla.
  - Decisiones a tomar al planificar este punto:
    - El aspecto de la variante `default`, que da identidad a la librería.
    - Los tonos de `primary`, `secondary` y `tertiary`: partir de `MonkeyStyle` o una paleta nueva.
    - Si el botón tiene niveles de énfasis (`appearance`: `filled`, `tonal`, `outlined`, `text`).
  - [x] 1.1. Tokens: paletas primitivas y tokens semánticos de color (ver [Colores](./PROPUESTA-NGX-GORILLA-UI.md#colores) en la propuesta), escala de tamaños `xs` a `xl`, radios, sombras, espaciado, tipografía y movimiento (duraciones a 0 con `prefers-reduced-motion`), con `light-dark()` y en `@layer gorilla`.
  - [x] 1.2. `GorillaTheme`: `theme` como señal, `setTheme('light' | 'dark' | 'system')` con `system` por defecto, persistencia y seguimiento del sistema, sin acceso directo a `window` (los tests del E-11 como criterio).
  - [x] 1.3. Directiva `GorillaVariant` (`color`, `variant`, `size`) aplicada con `hostDirectives`.
  - [ ] 1.4. `gorilla-button` en las seis variantes, los ocho roles de color y los cinco tamaños, con `disabled` (los tests del E-22 y E-24 como criterio). Fijar su límite de tamaño en el CI.
  - [ ] 1.5. Comprobados para el botón en los dos temas:
    - `:focus-visible` y contraste AA.
    - Transiciones en todos sus estados.
    - `prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-contrast` y `forced-colors`.
    - Que sus tokens se pueden sobreescribir desde el CSS de la aplicación.
  - [ ] 1.6. Documentación (el catálogo, construido con la propia librería): página del botón con guía de uso, API, ejemplos en vivo, tokens que se pueden sobreescribir y un selector de tema, variante, color y tamaño.
  - [ ] 1.7. Playwright con `@axe-core/playwright` en el CI sobre el catálogo, en los dos temas.
  - [ ] 1.8. Documentación desplegada en un proyecto nuevo de Vercel, con vista previa por pull request.

- [ ] 2. Componentes de presentación.
  - [ ] 2.1. `gorilla-icon` (`aria-hidden` por defecto) y proveedor de iconos configurable, con Lucide en SVG en línea por defecto.
  - [ ] 2.2. `gorilla-icon-button` con `aria-label` obligatorio.
  - [ ] 2.3. `gorilla-card` y `gorilla-stack` (sustituye a `monkey-list`, con `gap` y dirección).
  - [ ] 2.4. `gorilla-heading` con nivel semántico (sustituye a `monkey-header` y `monkey-subheader`).
  - [ ] 2.5. `gorilla-image` y `gorilla-avatar` con `alt` obligatorio (los tests de E-08 y E-09 como criterio).
  - [ ] 2.6. `gorilla-spinner` con `role="status"`, `gorilla-progress-bar`, `gorilla-skeleton`.
  - [ ] 2.7. `gorilla-badge` y `gorilla-chip`.

- [ ] 3. Formularios.
  - [ ] 3.1. `gorilla-input` (texto, email, password con visibilidad, url, search, mes, semana) con `ControlValueAccessor`.
  - [ ] 3.2. `gorilla-number-input` y campos de fecha y hora, con los criterios del E-15.
  - [ ] 3.3. `gorilla-checkbox`, `gorilla-switch` (`role="switch"`) y `gorilla-radio-group`, con ids únicos (E-19).
  - [ ] 3.4. `gorilla-textarea` y `gorilla-slider`.
  - [ ] 3.5. `gorilla-select` sobre Angular Aria (listbox o combobox).
  - [ ] 3.6. Mensajes de error en inglés por defecto, con `aria-describedby` y `aria-invalid`, configurables y traducibles por `InjectionToken` (criterios de E-06 y E-23).
  - [ ] 3.7. Compatibilidad comprobada con Signal Forms y Reactive Forms en el catálogo.

- [ ] 4. Overlays.
  - [ ] 4.1. Directiva `gorillaTooltip` sobre el CDK Overlay: foco, hover, Escape, `role="tooltip"` y `aria-describedby` (WCAG 1.4.13; criterios del E-20).
  - [ ] 4.2. `gorilla-menu` (desplegable) sobre Angular Aria.
  - [ ] 4.3. `gorilla-dialog` con focus trap y cierre con Escape.
  - [ ] 4.4. `GorillaToast`: servicio con cola, varias notificaciones a la vez y `aria-live`, sin depender de que la app pinte un componente (sustituye a `MonkeyAlertService`).

- [ ] 5. Navegación y layout.
  - [ ] 5.1. `gorilla-layout` con zonas de cabecera, lateral y contenido, en CSS Grid y `position: sticky`.
  - [ ] 5.2. `gorilla-navbar` y `gorilla-sidenav` (sustituyen a `monkey-menu` y `monkey-aside-menu`), con apertura por teclado y táctil y `Router` opcional.
  - [ ] 5.3. `gorilla-tabs` y `gorilla-accordion` sobre Angular Aria.
  - [ ] 5.4. `gorilla-breadcrumbs` y `gorilla-pagination`.

- [ ] 6. Componentes avanzados.
  - [ ] 6.1. `gorilla-table` con ordenación.
  - [ ] 6.2. Date picker y time picker.
  - [ ] 6.3. File upload con arrastrar y soltar.
  - [ ] 6.4. Stepper.
  - [ ] 6.5. Empty state.
  - [ ] 6.6. Fondo de degradados animados solo con CSS (`@property` para interpolar), si se quiere conservar la idea de `MonkeyBackgroundService`.

- [ ] 7. Publicación.
  - [ ] 7.1. Tema personalizable: `theme.css` precompilado y paleta sobreescribible con variables CSS; un mixin de Sass solo si aporta algo sobre eso.
  - [ ] 7.2. README con instalación, tema, iconos y cómo autoalojar una fuente distinta de la del sistema, que enlaza a la documentación.
  - ~~7.3. Catálogo desplegado en un proyecto nuevo de Vercel, con vista previa por pull request.~~ Adelantado al 1.8: la documentación tiene que estar publicada desde el primer componente.
  - [ ] 7.4. SSR habilitado en el catálogo como comprobación.
  - [ ] 7.5. Publicar la `1.0.0` al terminar el punto 5, con la API revisada. El workflow de release se adelanta al 0.8.

## Antecedentes: ngx-monkey-ui

Antes de `ngx-gorilla-ui`, este repositorio desarrolló `ngx-monkey-ui`. Su roadmap completo, con la descripción de cada punto, sigue en el [`ROADMAP.md` del tag `ngx-monkey-ui-legacy`](https://github.com/SrPepeR/ng-gorilla-ui/blob/ngx-monkey-ui-legacy/ROADMAP.md), y su changelog, en el [`CHANGELOG.md` del mismo tag](https://github.com/SrPepeR/ng-gorilla-ui/blob/ngx-monkey-ui-legacy/CHANGELOG.md).

### Lo que se implementó

- **0 a 10.** Versiones `0.1.0` a `0.3.1` sobre Angular 16 a 18:
  - El sistema de estilos `Styleable` con las variantes `brutalist`, `flat`, `ghost`, `glass`, `glow` y `discreet`, y el tema claro y oscuro.
  - Los componentes de primer a cuarto nivel y los formularios.
  - La página de login, el fondo animado y `MonkeyScreenService`.
- **11. Análisis en profundidad.** Errores confirmados con su archivo y línea, y riesgos. Hoy es la checklist [`ERRORES-A-EVITAR.md`](./ERRORES-A-EVITAR.md).
- **12. Red de seguridad.**
  - La suite compila y pasa, y Node quedó fijado.
  - Se añadieron GitHub Actions, `angular-eslint`, Prettier y `.git-blame-ignore-revs`. Todo pasa al workspace nuevo.
  - Se escribieron tests de comportamiento, y los errores conocidos quedaron como `xit` con su `E-xx`.
- **13. Corrección de los errores funcionales** E-06 a E-12 y E-14 a E-25, cada uno con un test que fallaba antes, en una `0.3.2` que no se publicó. Esos tests son los criterios de aceptación de los componentes equivalentes de este roadmap.

### Lo que se descartó

Los puntos 14 a 27 se descartaron al decidir rehacer la librería. Arreglar y portar una base sin usuarios obligaba a mantener su API, y `Styleable`, funcionando en cada paso. Lo que pedía cada punto sigue vivo aquí o en la propuesta:

| Punto de `ngx-monkey-ui` | Dónde queda en `ngx-gorilla-ui` |
|---|---|
| 14. Sanear `Styleable` y el ciclo de vida | Sin herencia: directiva `GorillaVariant` (principio 2, punto 1.3). |
| 15. Contrato del paquete npm | Entry points secundarios y `peerDependencies` desde el workspace nuevo (principio 9, puntos 0.4 y 7). |
| 16. Port a Angular 22 | El workspace nace en Angular 22 (0.4). |
| 17. API moderna (standalone, señales, zoneless) | Principios 2, 4 y 5. |
| 18. Formularios integrados | Principio 6 y punto 3. |
| 19. Sistema de temas y tokens | Premisa 2, principio 3 y puntos 1.1, 1.2 y 7.1. |
| 20. Accesibilidad | Premisa 1 y principio 1; axe en el CI (1.7). |
| 21. SSR y navegador | Principio 8 y punto 7.4. |
| 22. Layout de aplicación explícito | Puntos 5.1 y 5.2. |
| 23. Fuentes e iconos sin terceros | Principio 10 y punto 2.1. |
| 24. Overlays con API propia | Punto 4. |
| 25. Documentación y catálogo | Puntos 1.6, 1.8 y 7.2. |
| 26. Publicación automatizada | Punto 0.8. |
| 27. Nuevos componentes | Puntos 2 a 6. |

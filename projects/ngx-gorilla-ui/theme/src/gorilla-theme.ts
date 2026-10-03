import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  computed,
  DestroyRef,
  EnvironmentProviders,
  inject,
  Injectable,
  InjectionToken,
  makeEnvironmentProviders,
  PLATFORM_ID,
  provideEnvironmentInitializer,
  signal,
} from '@angular/core';

/** Theme chosen by the user: a fixed one, or `system` to follow `prefers-color-scheme`. */
export type GorillaThemeMode = 'light' | 'dark' | 'system';

/** Theme actually applied once `system` is resolved. */
export type GorillaResolvedTheme = 'light' | 'dark';

/** Options of `provideGorillaTheme()`. */
export interface GorillaThemeOptions {
  /** Theme used while the user has not chosen one. Defaults to `system`. */
  defaultTheme?: GorillaThemeMode;
  /** `localStorage` key where the user's choice is stored. Defaults to `gorilla-theme`. */
  storageKey?: string;
}

const DEFAULT_OPTIONS: Required<GorillaThemeOptions> = {
  defaultTheme: 'system',
  storageKey: 'gorilla-theme',
};

const GORILLA_THEME_OPTIONS = new InjectionToken<Required<GorillaThemeOptions>>(
  'GORILLA_THEME_OPTIONS',
  { factory: () => DEFAULT_OPTIONS },
);

const DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * Light, dark and system themes for the app.
 *
 * It writes `data-theme` and `color-scheme` on `<html>`, which the tokens of
 * `ngx-gorilla-ui/styles/tokens.css` read through `light-dark()`. The user's choice is stored in
 * `localStorage`; while it is `system`, the theme follows `prefers-color-scheme` changes.
 * On the server it never touches the document, `localStorage` nor `matchMedia`.
 */
@Injectable({ providedIn: 'root' })
export class GorillaTheme {
  private readonly document = inject(DOCUMENT);
  private readonly options = inject(GORILLA_THEME_OPTIONS);
  private readonly window = isPlatformBrowser(inject(PLATFORM_ID))
    ? this.document.defaultView
    : null;
  private readonly darkQuery = this.window?.matchMedia?.(DARK_QUERY) ?? null;
  private readonly systemIsDark = signal(this.darkQuery?.matches ?? false);
  private readonly mode = signal<GorillaThemeMode>(
    this.readStoredTheme() ?? this.options.defaultTheme,
  );

  /** Theme chosen by the user, or the default one. */
  readonly theme = this.mode.asReadonly();

  /** Theme applied to the document: `system` resolved with `prefers-color-scheme`. */
  readonly resolvedTheme = computed<GorillaResolvedTheme>(() => {
    const mode = this.mode();
    if (mode !== 'system') {
      return mode;
    }
    return this.systemIsDark() ? 'dark' : 'light';
  });

  constructor() {
    const onSystemChange = (event: MediaQueryListEvent) => this.systemIsDark.set(event.matches);
    this.darkQuery?.addEventListener('change', onSystemChange);
    inject(DestroyRef).onDestroy(() =>
      this.darkQuery?.removeEventListener('change', onSystemChange),
    );
    this.applyToDocument(this.mode());
  }

  /** Applies a theme and stores it, `system` included, so it overrides a fixed default. */
  setTheme(mode: GorillaThemeMode): void {
    this.mode.set(mode);
    this.storeTheme(mode);
    this.applyToDocument(mode);
  }

  private applyToDocument(mode: GorillaThemeMode): void {
    if (!this.window) {
      return;
    }
    const root = this.document.documentElement;
    if (mode === 'system') {
      root.removeAttribute('data-theme');
      root.style.removeProperty('color-scheme');
    } else {
      root.setAttribute('data-theme', mode);
      root.style.setProperty('color-scheme', mode);
    }
  }

  private readStoredTheme(): GorillaThemeMode | null {
    const stored = this.storage((storage) => storage.getItem(this.options.storageKey));
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : null;
  }

  private storeTheme(mode: GorillaThemeMode): void {
    this.storage((storage) => storage.setItem(this.options.storageKey, mode));
  }

  /** Runs an operation on `localStorage`, ignoring browsers that block it (private modes). */
  private storage<T>(operation: (storage: Storage) => T): T | null {
    try {
      return this.window ? operation(this.window.localStorage) : null;
    } catch {
      return null;
    }
  }
}

/**
 * Configures `GorillaTheme` and applies the theme as soon as the app starts.
 *
 * ```ts
 * bootstrapApplication(App, { providers: [provideGorillaTheme({ defaultTheme: 'dark' })] });
 * ```
 */
export function provideGorillaTheme(options: GorillaThemeOptions = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: GORILLA_THEME_OPTIONS,
      useValue: {
        defaultTheme: options.defaultTheme ?? DEFAULT_OPTIONS.defaultTheme,
        storageKey: options.storageKey ?? DEFAULT_OPTIONS.storageKey,
      },
    },
    provideEnvironmentInitializer(() => inject(GorillaTheme)),
  ]);
}

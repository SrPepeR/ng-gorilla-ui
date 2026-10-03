import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GorillaTheme, GorillaThemeOptions, provideGorillaTheme } from './gorilla-theme';

const STORAGE_KEY = 'gorilla-theme';

/** Replaces `matchMedia` with a controllable `prefers-color-scheme: dark` query. */
function fakeSystemTheme(initiallyDark: boolean) {
  const listeners: ((event: MediaQueryListEvent) => void)[] = [];
  const query = {
    matches: initiallyDark,
    addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) =>
      listeners.push(listener),
    removeEventListener: vi.fn(),
  } as unknown as MediaQueryList;
  const matchMedia = vi.spyOn(window, 'matchMedia').mockReturnValue(query);
  return {
    matchMedia,
    change(dark: boolean) {
      listeners.forEach((listener) => listener({ matches: dark } as MediaQueryListEvent));
    },
  };
}

function createTheme(options?: GorillaThemeOptions, platform = 'browser'): GorillaTheme {
  TestBed.configureTestingModule({
    providers: [provideGorillaTheme(options), { provide: PLATFORM_ID, useValue: platform }],
  });
  return TestBed.inject(GorillaTheme);
}

describe('GorillaTheme', () => {
  const root = document.documentElement;

  beforeEach(() => localStorage.clear());

  afterEach(() => {
    localStorage.clear();
    root.removeAttribute('data-theme');
    root.style.removeProperty('color-scheme');
    vi.restoreAllMocks();
  });

  it('uses `system` when nothing is stored and no default is provided', () => {
    fakeSystemTheme(true);
    const theme = createTheme();

    expect(theme.theme()).toBe('system');
    expect(theme.resolvedTheme()).toBe('dark');
  });

  it('uses the provided `defaultTheme` when nothing is stored', () => {
    fakeSystemTheme(false);
    const theme = createTheme({ defaultTheme: 'dark' });

    expect(theme.theme()).toBe('dark');
    expect(theme.resolvedTheme()).toBe('dark');
  });

  it('keeps the defaults when options are explicitly `undefined`', () => {
    fakeSystemTheme(false);
    const theme = createTheme({ defaultTheme: undefined, storageKey: undefined });

    expect(theme.theme()).toBe('system');
    theme.setTheme('dark');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
  });

  it('restores the stored choice over the system preference (E-11)', () => {
    fakeSystemTheme(true);
    localStorage.setItem(STORAGE_KEY, 'light');
    const theme = createTheme();

    expect(theme.theme()).toBe('light');
    expect(theme.resolvedTheme()).toBe('light');
  });

  it('stores the choice under the configured key when `setTheme()` is called (E-11)', () => {
    fakeSystemTheme(false);
    const theme = createTheme({ storageKey: 'my-app-theme' });

    theme.setTheme('dark');

    expect(localStorage.getItem('my-app-theme')).toBe('dark');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('follows `prefers-color-scheme` changes while the mode is `system` (E-11)', () => {
    const system = fakeSystemTheme(false);
    const theme = createTheme();

    system.change(true);
    expect(theme.resolvedTheme()).toBe('dark');

    system.change(false);
    expect(theme.resolvedTheme()).toBe('light');
  });

  it('ignores `prefers-color-scheme` changes once the user picks `light` or `dark`', () => {
    const system = fakeSystemTheme(false);
    const theme = createTheme();

    theme.setTheme('light');
    system.change(true);

    expect(theme.resolvedTheme()).toBe('light');
  });

  it("`setTheme('system')` removes `data-theme` and stores `system`", () => {
    fakeSystemTheme(false);
    const theme = createTheme();
    theme.setTheme('dark');

    theme.setTheme('system');

    expect(root.hasAttribute('data-theme')).toBe(false);
    expect(root.style.getPropertyValue('color-scheme')).toBe('');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('system');
  });

  it('restores an explicit `system` choice over a fixed `defaultTheme`', () => {
    fakeSystemTheme(true);
    localStorage.setItem(STORAGE_KEY, 'system');
    const theme = createTheme({ defaultTheme: 'light' });

    expect(theme.theme()).toBe('system');
    expect(theme.resolvedTheme()).toBe('dark');
  });

  it('writes `data-theme` and `color-scheme` on `<html>`', () => {
    fakeSystemTheme(false);
    const theme = createTheme({ defaultTheme: 'dark' });

    expect(root.getAttribute('data-theme')).toBe('dark');
    expect(root.style.getPropertyValue('color-scheme')).toBe('dark');

    theme.setTheme('light');

    expect(root.getAttribute('data-theme')).toBe('light');
    expect(root.style.getPropertyValue('color-scheme')).toBe('light');
  });

  it('does not touch the document, `localStorage` nor `matchMedia` on the server platform (R-06)', () => {
    const { matchMedia } = fakeSystemTheme(true);
    const getItem = vi.spyOn(Storage.prototype, 'getItem');
    const setItem = vi.spyOn(Storage.prototype, 'setItem');

    const theme = createTheme(undefined, 'server');
    theme.setTheme('dark');

    expect(theme.resolvedTheme()).toBe('dark');
    expect(matchMedia).not.toHaveBeenCalled();
    expect(getItem).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
    expect(root.hasAttribute('data-theme')).toBe(false);
  });
});

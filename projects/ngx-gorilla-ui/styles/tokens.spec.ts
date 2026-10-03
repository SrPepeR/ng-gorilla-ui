import { cdp } from 'vitest/browser';
import tokensCss from './tokens.css' with { loader: 'text' };

const ROLES = [
  'primary',
  'secondary',
  'tertiary',
  'neutral',
  'success',
  'warning',
  'danger',
  'info',
];
const ROLE_SUFFIXES = [
  'solid',
  'solid-hover',
  'solid-active',
  'on-solid',
  'subtle',
  'subtle-hover',
  'on-subtle',
  'border',
];
const SEMANTIC_TOKENS = [
  ...ROLES.flatMap((role) => ROLE_SUFFIXES.map((suffix) => `--gorilla-${role}-${suffix}`)),
  '--gorilla-background',
  '--gorilla-surface',
  '--gorilla-surface-raised',
  '--gorilla-surface-overlay',
  '--gorilla-scrim',
  '--gorilla-text',
  '--gorilla-text-muted',
  '--gorilla-text-disabled',
  '--gorilla-text-inverse',
  '--gorilla-border',
  '--gorilla-border-strong',
  '--gorilla-border-disabled',
  '--gorilla-focus-ring',
  '--gorilla-selection',
];
const THEMES = ['light', 'dark'] as const;

/** Resolves a token on `<html>` to sRGB channels through a canvas. */
function resolveColor(token: string): [number, number, number] {
  const probe = document.createElement('span');
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();

  const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  if (!context) {
    throw new Error('A 2D canvas is required to resolve colors');
  }
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

function contrast(foreground: string, background: string): number {
  const luminance = (rgb: [number, number, number]) => {
    const [r, g, b] = rgb.map((channel) => {
      const c = channel / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [high, low] = [
    luminance(resolveColor(foreground)),
    luminance(resolveColor(background)),
  ].sort((a, b) => b - a);
  return (high + 0.05) / (low + 0.05);
}

function rootValue(token: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
}

describe('tokens.css', () => {
  const root = document.documentElement;
  let style: HTMLStyleElement;

  beforeEach(() => {
    style = document.createElement('style');
    style.textContent = tokensCss;
    document.head.append(style);
  });

  afterEach(async () => {
    style.remove();
    root.removeAttribute('data-theme');
    await cdp().send('Emulation.setEmulatedMedia', { features: [] });
  });

  for (const theme of THEMES) {
    describe(`in the ${theme} theme`, () => {
      beforeEach(() => root.setAttribute('data-theme', theme));

      it('defines every semantic color token', () => {
        for (const token of SEMANTIC_TOKENS) {
          expect(rootValue(token), token).not.toBe('');
        }
      });

      it('every role pair and `surface`/`text` pass AA contrast', () => {
        const pairs: [string, string][] = [
          ['--gorilla-text', '--gorilla-background'],
          ['--gorilla-text', '--gorilla-surface'],
          ['--gorilla-text-muted', '--gorilla-background'],
          ['--gorilla-text-muted', '--gorilla-surface'],
          ...ROLES.flatMap((role): [string, string][] => [
            [`--gorilla-${role}-on-solid`, `--gorilla-${role}-solid`],
            [`--gorilla-${role}-on-solid`, `--gorilla-${role}-solid-hover`],
            [`--gorilla-${role}-on-solid`, `--gorilla-${role}-solid-active`],
            [`--gorilla-${role}-on-subtle`, `--gorilla-${role}-subtle`],
            [`--gorilla-${role}-on-subtle`, `--gorilla-${role}-subtle-hover`],
          ]),
        ];

        for (const [foreground, background] of pairs) {
          expect(
            contrast(foreground, background),
            `${foreground} on ${background}`,
          ).toBeGreaterThanOrEqual(4.5);
        }
        // Non-text contrast (WCAG 1.4.11) for the focus ring.
        expect(contrast('--gorilla-focus-ring', '--gorilla-background')).toBeGreaterThanOrEqual(3);
      });
    });
  }

  it('motion durations resolve to `0s` under `prefers-reduced-motion: reduce`', async () => {
    expect(rootValue('--gorilla-duration-normal')).toBe('200ms');

    await cdp().send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });

    for (const speed of ['fast', 'normal', 'slow']) {
      expect(rootValue(`--gorilla-duration-${speed}`)).toBe('0s');
    }
  });

  it('the scrim becomes nearly opaque under `prefers-reduced-transparency: reduce`', async () => {
    root.setAttribute('data-theme', 'light');
    const alpha = () => {
      const probe = document.createElement('span');
      probe.style.color = 'var(--gorilla-scrim)';
      document.body.append(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return Number(/\/\s*([\d.]+)\)|,\s*([\d.]+)\)$/.exec(color)?.slice(1).find(Boolean) ?? 1);
    };
    expect(alpha()).toBeLessThan(0.5);

    await cdp().send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }],
    });

    expect(alpha()).toBeGreaterThanOrEqual(0.85);
  });

  for (const theme of THEMES) {
    it(`muted text, borders and on-subtle roles reach their strongest step under \`prefers-contrast: more\` (${theme})`, async () => {
      root.setAttribute('data-theme', theme);
      await cdp().send('Emulation.setEmulatedMedia', {
        features: [{ name: 'prefers-contrast', value: 'more' }],
      });

      const strongest: [string, string][] = [
        ['--gorilla-text-muted', '--gorilla-gray-12'],
        ['--gorilla-border', '--gorilla-gray-11'],
        ['--gorilla-border-strong', '--gorilla-gray-12'],
        ['--gorilla-primary-on-subtle', '--gorilla-cyan-12'],
        ['--gorilla-secondary-on-subtle', '--gorilla-violet-12'],
        ['--gorilla-tertiary-on-subtle', '--gorilla-magenta-12'],
        ['--gorilla-neutral-on-subtle', '--gorilla-gray-12'],
        ['--gorilla-success-on-subtle', '--gorilla-green-12'],
        ['--gorilla-warning-on-subtle', '--gorilla-amber-12'],
        ['--gorilla-danger-on-subtle', '--gorilla-red-12'],
        ['--gorilla-info-on-subtle', '--gorilla-blue-12'],
      ];
      for (const [token, step] of strongest) {
        expect(resolveColor(token), token).toEqual(resolveColor(step));
      }
    });
  }

  it('surfaces, text, borders, focus and selection use system colors under `forced-colors: active`', async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      features: [{ name: 'forced-colors', value: 'active' }],
    });

    const systemColors: Record<string, string> = {
      '--gorilla-background': 'Canvas',
      '--gorilla-surface': 'Canvas',
      '--gorilla-surface-raised': 'Canvas',
      '--gorilla-surface-overlay': 'Canvas',
      '--gorilla-text': 'CanvasText',
      '--gorilla-text-muted': 'CanvasText',
      '--gorilla-text-disabled': 'GrayText',
      '--gorilla-border': 'CanvasText',
      '--gorilla-border-strong': 'CanvasText',
      '--gorilla-border-disabled': 'GrayText',
      '--gorilla-focus-ring': 'Highlight',
      '--gorilla-selection': 'Highlight',
    };
    for (const [token, color] of Object.entries(systemColors)) {
      expect(rootValue(token), token).toBe(color);
    }
  });

  it('an unlayered app rule overrides a token without `!important`', () => {
    const appStyle = document.createElement('style');
    appStyle.textContent = ':root { --gorilla-primary-solid: rgb(1, 2, 3); }';
    document.head.append(appStyle);

    expect(rootValue('--gorilla-primary-solid')).toBe('rgb(1, 2, 3)');
    appStyle.remove();
  });
});

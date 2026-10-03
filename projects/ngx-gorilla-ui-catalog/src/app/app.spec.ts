import { TestBed } from '@angular/core/testing';
import axe from 'axe-core';
import { provideRouter, Router } from '@angular/router';
import { GorillaTheme } from 'ngx-gorilla-ui/theme';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.removeProperty('color-scheme');
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    });
  });

  it('boots without zone.js', () => {
    expect(typeof (globalThis as { Zone?: unknown }).Zone).toBe('undefined');
  });

  it('renders the skip link and the documentation navigation', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('a.skip-link')?.getAttribute('href')).toBe('#main');
    const links = Array.from(
      element.querySelectorAll('nav[aria-label="Documentation"] a'),
      (link) => link.textContent?.trim(),
    );
    expect(links).toEqual(['Getting started', 'Theming', 'Tokens']);
  });

  it('renders the theme switcher with the light, dark and system options', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    const options = Array.from(
      element.querySelectorAll<HTMLInputElement>('gorilla-theme-switcher input[type="radio"]'),
      (input) => input.value,
    );
    expect(options).toEqual(['light', 'dark', 'system']);
  });

  for (const path of ['/', '/theming', '/tokens']) {
    for (const theme of ['light', 'dark'] as const) {
      it(`has no axe violations on ${path} in the ${theme} theme`, async () => {
        TestBed.inject(GorillaTheme).setTheme(theme);
        const fixture = TestBed.createComponent(App);
        document.body.append(fixture.nativeElement);
        await TestBed.inject(Router).navigateByUrl(path);
        await fixture.whenStable();
        // Measure the final colors, not the middle of the theme transition.
        while (document.getAnimations().length > 0) {
          await Promise.allSettled(document.getAnimations().map((animation) => animation.finished));
        }

        const results = await axe.run(fixture.nativeElement as HTMLElement);

        expect(
          results.violations.flatMap((violation) =>
            violation.nodes.map(
              (node) =>
                `${violation.id}: ${node.target.join(' ')} ${node.any.map((check) => check.message).join(' ')}`,
            ),
          ),
        ).toEqual([]);
        fixture.nativeElement.remove();
      });
    }
  }

  it('applies the theme picked in the switcher', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    element.querySelector<HTMLInputElement>('gorilla-theme-switcher input[value="dark"]')?.click();
    await fixture.whenStable();

    expect(TestBed.inject(GorillaTheme).theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(
      element.querySelector<HTMLInputElement>('gorilla-theme-switcher input[value="dark"]')
        ?.checked,
    ).toBe(true);
  });
});

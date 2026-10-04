import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { cdp, userEvent } from 'vitest/browser';
import tokensCss from '../../styles/tokens.css' with { loader: 'text' };
import { GorillaColor, GorillaSize, GorillaVariantName } from 'ngx-gorilla-ui/core';
import { GorillaButton, GorillaButtonAppearance } from './gorilla-button';

@Component({
  imports: [GorillaButton],
  template: `
    <button
      gorilla-button
      [variant]="variant()"
      [color]="color()"
      [size]="size()"
      [appearance]="appearance()"
      [disabled]="disabled()"
      (click)="clicks.set(clicks() + 1)"
    >
      <span class="label">Save</span>
    </button>
    <a gorilla-button href="#target" [disabled]="disabled()" (click)="clicks.set(clicks() + 1)"
      >Link</a
    >
    <button
      gorilla-button
      type="button"
      aria-label="Close dialog"
      aria-describedby="hint"
      class="author"
    >
      ×
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Page {
  readonly variant = signal<GorillaVariantName>('default');
  readonly color = signal<GorillaColor>('primary');
  readonly size = signal<GorillaSize>('md');
  readonly appearance = signal<GorillaButtonAppearance>('filled');
  readonly disabled = signal(false);
  readonly clicks = signal(0);
}

describe('GorillaButton', () => {
  let style: HTMLStyleElement;

  beforeEach(() => {
    style = document.createElement('style');
    style.textContent = tokensCss;
    document.head.append(style);
  });

  afterEach(async () => {
    style.remove();
    await cdp().send('Emulation.setEmulatedMedia', { features: [] });
  });

  async function render() {
    const fixture = TestBed.createComponent(Page);
    document.body.append(fixture.nativeElement);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const [button, author] = Array.from(element.querySelectorAll('button'));
    const link = element.querySelector('a') as HTMLAnchorElement;
    onTestFinished(() => fixture.nativeElement.remove());
    return { fixture, page: fixture.componentInstance, button, link, author };
  }

  it('renders the projected content inside the native `<button>` with no wrapper element', async () => {
    const { button } = await render();

    expect(button.children).toHaveLength(1);
    expect(button.firstElementChild?.className).toBe('label');
    expect(button.textContent?.trim()).toBe('Save');
  });

  it('applies `variant`, `color`, `size` and `appearance` classes to the host', async () => {
    const { fixture, page, button } = await render();

    expect([...button.classList]).toEqual(
      expect.arrayContaining([
        'gorilla-button',
        'gorilla-button-filled',
        'gorilla-variant-default',
        'gorilla-color-primary',
        'gorilla-size-md',
      ]),
    );

    page.color.set('danger');
    page.size.set('lg');
    page.appearance.set('outlined');
    await fixture.whenStable();

    expect([...button.classList]).toEqual(
      expect.arrayContaining([
        'gorilla-button-outlined',
        'gorilla-color-danger',
        'gorilla-size-lg',
      ]),
    );
    expect(button.classList).not.toContain('gorilla-button-filled');
  });

  it('reflects `disabled` on the native button and re-enables it when `disabled` goes back to `false` (E-22)', async () => {
    const { fixture, page, button } = await render();
    expect(button.disabled).toBe(false);

    page.disabled.set(true);
    await fixture.whenStable();
    expect(button.disabled).toBe(true);

    page.disabled.set(false);
    await fixture.whenStable();
    expect(button.disabled).toBe(false);
  });

  it('does not fire `click` handlers while disabled (E-24)', async () => {
    const { fixture, page, button } = await render();
    page.disabled.set(true);
    await fixture.whenStable();

    button.querySelector('span')?.click();
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(page.clicks()).toBe(0);

    page.disabled.set(false);
    await fixture.whenStable();
    await userEvent.click(button);
    expect(page.clicks()).toBe(1);
  });

  it('on `<a>`, sets `aria-disabled` and `tabindex="-1"` and blocks navigation while disabled', async () => {
    const { fixture, page, link } = await render();
    expect(link.hasAttribute('aria-disabled')).toBe(false);
    expect(link.hasAttribute('tabindex')).toBe(false);

    page.disabled.set(true);
    await fixture.whenStable();
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.getAttribute('tabindex')).toBe('-1');

    const hash = location.hash;
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    expect(location.hash).toBe(hash);
    expect(page.clicks()).toBe(0);

    page.disabled.set(false);
    await fixture.whenStable();
    expect(link.hasAttribute('aria-disabled')).toBe(false);
    expect(link.hasAttribute('tabindex')).toBe(false);
  });

  it('keeps `type="button"` when given and does not override author attributes (`type`, `aria-*`)', async () => {
    const { author } = await render();

    expect(author.getAttribute('type')).toBe('button');
    expect(author.getAttribute('aria-label')).toBe('Close dialog');
    expect(author.getAttribute('aria-describedby')).toBe('hint');
    expect(author.classList).toContain('author');
    expect(author.classList).toContain('gorilla-button');
  });

  it('has a visible focus ring with `:focus-visible` only for keyboard focus', async () => {
    const { button, link } = await render();
    const outline = () => getComputedStyle(button).outlineColor;
    const ring = () => {
      const probe = document.createElement('span');
      probe.style.color = 'var(--gorilla-focus-ring)';
      document.body.append(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    };
    // Finish the outline transition before reading it.
    const settle = () =>
      Promise.allSettled(button.getAnimations().map((animation) => animation.finish()));

    await userEvent.click(button);
    await settle();
    expect(button.matches(':focus-visible')).toBe(false);
    expect(outline()).toBe('rgba(0, 0, 0, 0)');

    // Come back to the button from the next one with the keyboard.
    link.focus();
    await userEvent.tab({ shift: true });
    await settle();
    expect(document.activeElement).toBe(button);
    expect(button.matches(':focus-visible')).toBe(true);
    expect(outline()).toBe(ring());
  });

  it('transitions background, color, border and shadow, and the transition duration is `0s` under reduced motion', async () => {
    const { button } = await render();
    const properties = getComputedStyle(button)
      .transitionProperty.split(',')
      .map((property) => property.trim());

    expect(properties).toEqual(
      expect.arrayContaining(['background-color', 'color', 'border-color', 'box-shadow']),
    );
    expect(getComputedStyle(button).transitionDuration).not.toBe('0s');

    await cdp().send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });

    expect(getComputedStyle(button).transitionDuration).toBe('0s');
  });
});

import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  createComponent,
  EnvironmentInjector,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { cdp, userEvent } from 'vitest/browser';
import tokensCss from '../../styles/tokens.css' with { loader: 'text' };
import { GorillaColor, GorillaSize } from 'ngx-gorilla-ui/core';
import { GorillaButton, GorillaButtonAppearance } from './gorilla-button';

@Component({
  imports: [GorillaButton],
  template: `
    <button
      gorilla-button
      [color]="color()"
      [size]="size()"
      [appearance]="appearance()"
      [disabled]="disabled()"
      (click)="clicks.set(clicks() + 1)"
    >
      <span class="label">Save</span>
    </button>
    <a
      gorilla-button
      href="#target"
      [disabled]="disabled()"
      [attr.tabindex]="linkTabIndex()"
      [attr.aria-disabled]="linkAriaDisabled()"
      (click)="clicks.set(clicks() + 1)"
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
  readonly color = signal<GorillaColor>('primary');
  readonly size = signal<GorillaSize>('md');
  readonly appearance = signal<GorillaButtonAppearance>('filled');
  readonly disabled = signal(false);
  readonly clicks = signal(0);
  readonly linkTabIndex = signal<string | null>(null);
  readonly linkAriaDisabled = signal<string | null>(null);
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

  it('applies the `default` variant, `color`, `size` and `appearance` classes to the host', async () => {
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

  it('on `<a>`, removes `href`, sets `role="link"`, `aria-disabled` and `tabindex="-1"` and blocks navigation while disabled', async () => {
    const { fixture, page, link } = await render();
    expect(link.getAttribute('href')).toBe('#target');
    expect(link.hasAttribute('aria-disabled')).toBe(false);
    expect(link.hasAttribute('tabindex')).toBe(false);

    page.disabled.set(true);
    await fixture.whenStable();
    expect(link.hasAttribute('href')).toBe(false);
    expect(link.getAttribute('role')).toBe('link');
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.getAttribute('tabindex')).toBe('-1');
    expect(JSON.parse(link.getAttribute('data-gorilla-author') ?? '')).toEqual({
      href: '#target',
      role: null,
      tabindex: null,
      'aria-disabled': null,
    });

    // Without `href`, no activation navigates: click, middle click or `Enter`.
    const hash = location.hash;
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(click);
    link.dispatchEvent(new MouseEvent('auxclick', { bubbles: true, cancelable: true, button: 1 }));
    expect(click.defaultPrevented).toBe(true);
    expect(location.hash).toBe(hash);
    expect(page.clicks()).toBe(0);

    page.disabled.set(false);
    await fixture.whenStable();
    expect(link.getAttribute('href')).toBe('#target');
    expect(link.hasAttribute('role')).toBe(false);
    expect(link.hasAttribute('aria-disabled')).toBe(false);
    expect(link.hasAttribute('tabindex')).toBe(false);
    expect(link.hasAttribute('data-gorilla-author')).toBe(false);
  });

  it('on `<a>`, restores the author `tabindex` and `aria-disabled` current at the time of disabling', async () => {
    const { fixture, page, link } = await render();
    link.setAttribute('tabindex', '3');
    link.setAttribute('aria-disabled', 'false');

    page.disabled.set(true);
    await fixture.whenStable();
    expect(link.getAttribute('tabindex')).toBe('-1');
    expect(link.getAttribute('aria-disabled')).toBe('true');

    page.disabled.set(false);
    await fixture.whenStable();
    expect(link.getAttribute('tabindex')).toBe('3');
    expect(link.getAttribute('aria-disabled')).toBe('false');
  });

  it('on `<a>`, keeps `tabindex` and `aria-disabled` while disabled when author bindings change them', async () => {
    const { fixture, page, link } = await render();
    page.disabled.set(true);
    await fixture.whenStable();

    page.linkTabIndex.set('5');
    page.linkAriaDisabled.set('false');
    await fixture.whenStable();
    // The attribute observer runs in a microtask after the bindings write.
    await Promise.resolve();
    expect(link.getAttribute('tabindex')).toBe('-1');
    expect(link.getAttribute('aria-disabled')).toBe('true');

    page.disabled.set(false);
    await fixture.whenStable();
    expect(link.getAttribute('tabindex')).toBe('5');
    expect(link.getAttribute('aria-disabled')).toBe('false');

    // An author value equal to the disabled one is still the author's.
    page.linkTabIndex.set('2');
    await fixture.whenStable();
    page.disabled.set(true);
    await fixture.whenStable();
    page.linkTabIndex.set('-1');
    page.linkAriaDisabled.set('true');
    await fixture.whenStable();
    await Promise.resolve();
    page.disabled.set(false);
    await fixture.whenStable();
    expect(link.getAttribute('tabindex')).toBe('-1');
    expect(link.getAttribute('aria-disabled')).toBe('true');
  });

  it('on `<a>`, keeps the author values through the server render and the hydration of a disabled link', () => {
    const environmentInjector = TestBed.inject(EnvironmentInjector);
    const appRef = TestBed.inject(ApplicationRef);
    // Creates the button on an existing element, as hydration does with the server markup.
    const create = (hostElement: HTMLElement, disabled: boolean) => {
      const ref = createComponent(GorillaButton, { environmentInjector, hostElement });
      ref.setInput('disabled', disabled);
      appRef.attachView(ref.hostView);
      appRef.tick();
      return ref;
    };

    // Server: no `MutationObserver`; render a disabled link and serialize it.
    vi.stubGlobal('MutationObserver', undefined);
    const serverLink = document.createElement('a');
    serverLink.setAttribute('href', '#target');
    serverLink.setAttribute('tabindex', '4');
    serverLink.textContent = 'Link';
    const serverRef = create(serverLink, true);
    const html = serverLink.outerHTML;
    serverRef.destroy();
    vi.unstubAllGlobals();

    // Client: parse the server markup and hydrate it, still disabled.
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.append(container);
    onTestFinished(() => container.remove());
    const link = container.firstElementChild as HTMLAnchorElement;
    expect(link.hasAttribute('href')).toBe(false);
    expect(link.getAttribute('tabindex')).toBe('-1');
    const clientRef = create(link, true);
    expect(link.hasAttribute('href')).toBe(false);
    expect(link.getAttribute('role')).toBe('link');
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.getAttribute('tabindex')).toBe('-1');

    clientRef.setInput('disabled', false);
    appRef.tick();
    expect(link.getAttribute('href')).toBe('#target');
    expect(link.getAttribute('tabindex')).toBe('4');
    expect(link.hasAttribute('role')).toBe(false);
    expect(link.hasAttribute('aria-disabled')).toBe(false);
    expect(link.hasAttribute('data-gorilla-author')).toBe(false);
    clientRef.destroy();
  });

  it('reads the hover and press transforms from `--gorilla-button-*-transform` and darkens while pressed', async () => {
    const { button } = await render();
    button.style.setProperty('--gorilla-button-hover-transform', 'translateY(-2px)');
    button.style.setProperty('--gorilla-button-active-transform', 'translateY(2px)');
    button.style.setProperty('--gorilla-button-transition-duration', '0s');
    const resolve = (token: string) => {
      const probe = document.createElement('span');
      probe.style.color = `var(${token})`;
      document.body.append(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    };

    await userEvent.hover(button);
    expect(getComputedStyle(button).transform).toBe('matrix(1, 0, 0, 1, 0, -2)');
    expect(getComputedStyle(button).backgroundColor).toBe(resolve('--gorilla-primary-solid-hover'));
    await userEvent.unhover(button);
    expect(getComputedStyle(button).transform).toBe('none');

    // Holding Space on the focused button keeps it `:active`.
    button.focus();
    await userEvent.keyboard('[Space>]');
    expect(button.matches(':active')).toBe(true);
    expect(getComputedStyle(button).transform).toBe('matrix(1, 0, 0, 1, 0, 2)');
    expect(getComputedStyle(button).backgroundColor).toBe(
      resolve('--gorilla-primary-solid-active'),
    );
    await userEvent.keyboard('[/Space]');
    expect(getComputedStyle(button).transform).toBe('none');
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

  it('transitions background, color, border and shadow, and the transition duration is `0s` under reduced motion, whatever the app sets', async () => {
    const { button } = await render();
    const properties = getComputedStyle(button)
      .transitionProperty.split(',')
      .map((property) => property.trim());

    expect(properties).toEqual(
      expect.arrayContaining([
        'background-color',
        'color',
        'border-color',
        'border-width',
        'box-shadow',
        'min-block-size',
        'padding-inline',
        'font-size',
        'transform',
      ]),
    );
    expect(getComputedStyle(button).transitionDuration).not.toBe('0s');

    await cdp().send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });

    expect(getComputedStyle(button).transitionDuration).toBe('0s');
    // Also when the app sets its own duration.
    button.style.setProperty('--gorilla-button-transition-duration', '300ms');
    expect(getComputedStyle(button).transitionDuration).toBe('0s');
  });
});

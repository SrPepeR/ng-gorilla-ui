import {
  AfterViewChecked,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  Renderer2,
  untracked,
  ViewEncapsulation,
} from '@angular/core';
import { GorillaVariant } from 'ngx-gorilla-ui/core';

/** Emphasis of a button, independent of its variant and color. */
export type GorillaButtonAppearance = 'filled' | 'tonal' | 'outlined' | 'text';

/**
 * Button on the native `<button>` or `<a>` element, with no wrapper.
 *
 * ```html
 * <button gorilla-button color="success" size="lg" (click)="save()">Save</button>
 * <a gorilla-button appearance="text" href="/docs">Docs</a>
 * ```
 *
 * `color` and `size` come from `GorillaVariant`. Every visual value is a
 * `--gorilla-button-*` custom property in `@layer gorilla`, so the app overrides it globally, for a
 * part of the page or for one button without `!important`. Use the native `(click)` event: while
 * the button is disabled no click handler runs, on `<button>` and on `<a>`.
 */
@Component({
  selector: 'button[gorilla-button], a[gorilla-button]',
  template: '<ng-content />',
  styleUrl: './gorilla-button.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // `variant` is not forwarded yet: only `default` is styled, and the other variants arrive with
  // their styles (an input without a visible effect is E-14).
  hostDirectives: [{ directive: GorillaVariant, inputs: ['color', 'size'] }],
  host: {
    class: 'gorilla-button',
    '[class]': 'appearanceClass()',
    '[attr.disabled]': 'isButton && disabled() ? "" : null',
    // The disabled look follows the input only, not an `aria-disabled` the author restores.
    '[class.gorilla-button-disabled]': 'disabled()',
  },
})
export class GorillaButton implements AfterViewChecked {
  /** Emphasis: `filled` (default), `tonal`, `outlined` or `text`. */
  readonly appearance = input<GorillaButtonAppearance>('filled');
  /**
   * Disables the button: no click handlers on either element, and on `<a>` no `href` (so no
   * navigation of any kind) and no focus by `Tab`.
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly isButton: boolean;
  protected readonly appearanceClass = computed(() => `gorilla-button-${this.appearance()}`);
  /** Takes back the attributes of a disabled `<a>` after a render pass changed them. */
  private syncDisabledLink: (() => void) | null = null;

  constructor() {
    const element: HTMLElement = inject(ElementRef).nativeElement;
    this.isButton = element.tagName === 'BUTTON';

    // A capturing listener on the element itself runs before the author's `(click)` handlers, so
    // it can stop them and the navigation of a disabled `<a>`. A disabled `<button>` gets no
    // clicks from the browser, but `dispatchEvent()` still reaches it.
    const blockWhileDisabled = (event: Event) => {
      if (this.disabled()) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    element.addEventListener('click', blockWhileDisabled, { capture: true });

    // On `<a>`, `disabled` takes over `href`, `role`, `aria-disabled` and `tabindex`. The author's
    // values are kept aside while disabled (also the ones they set or bind later) and come back on
    // re-enable.
    const observer = this.isButton ? null : this.manageDisabledLink(element);
    inject(DestroyRef).onDestroy(() => {
      observer?.disconnect();
      element.removeEventListener('click', blockWhileDisabled, { capture: true });
    });
  }

  /**
   * Runs after every render pass of the parent, also on the server, so author bindings that
   * changed a disabled link's attributes are caught even where there is no `MutationObserver`.
   */
  ngAfterViewChecked(): void {
    this.syncDisabledLink?.();
  }

  /**
   * Swaps the author's attributes of an `<a>` for the disabled ones and back.
   *
   * Without `href` nothing can navigate (middle click, context menu, `Enter`), and `role="link"`
   * keeps it announced as a link, now with `aria-disabled="true"` and out of the tab order.
   *
   * The author's values also live in `data-gorilla-author` while disabled, so a link rendered
   * disabled on the server finds them on hydration instead of reading the disabled ones. Returns
   * the observer of the author's writes, `null` on the server, where there is no
   * `MutationObserver`; there, `ngAfterViewChecked` catches the author's writes after each render
   * pass (the observer also catches a write of the same value as the disabled one).
   */
  private manageDisabledLink(element: HTMLElement): MutationObserver | null {
    const owned: Record<string, string | null> = {
      href: null,
      role: 'link',
      tabindex: '-1',
      'aria-disabled': 'true',
    };
    const marker = 'data-gorilla-author';
    const authorValues = new Map<string, string | null>();
    const renderer = inject(Renderer2);
    const write = (name: string, value: string | null) =>
      value === null
        ? renderer.removeAttribute(element, name)
        : renderer.setAttribute(element, name, value);
    const writeOwned = () => {
      renderer.setAttribute(element, marker, JSON.stringify(Object.fromEntries(authorValues)));
      for (const name of Object.keys(owned)) {
        write(name, owned[name]);
      }
    };
    // The observer is off during our own writes, so every record it gets is an author write, even
    // one that sets the same value as ours.
    const options: MutationObserverInit = { attributeFilter: Object.keys(owned) };
    const keepAuthorWrites = (records: MutationRecord[]) => {
      for (const { attributeName } of records) {
        if (attributeName) {
          authorValues.set(attributeName, element.getAttribute(attributeName));
        }
      }
    };
    const observer =
      typeof MutationObserver === 'undefined'
        ? null
        : new MutationObserver((records) => {
            observer?.disconnect();
            keepAuthorWrites(records);
            writeOwned();
            observer?.observe(element, options);
          });
    let disabledLink = false;
    this.syncDisabledLink = () => {
      if (!disabledLink) {
        return;
      }
      let changed = false;
      for (const name of Object.keys(owned)) {
        const value = element.getAttribute(name);
        if (value !== owned[name]) {
          authorValues.set(name, value);
          changed = true;
        }
      }
      if (changed) {
        observer?.disconnect();
        writeOwned();
        observer?.observe(element, options);
      }
    };

    effect(() => {
      const disabled = this.disabled();
      untracked(() => {
        if (disabled && !disabledLink) {
          disabledLink = true;
          const saved = readMarker(element.getAttribute(marker));
          for (const name of Object.keys(owned)) {
            authorValues.set(name, name in saved ? saved[name] : element.getAttribute(name));
          }
          writeOwned();
          observer?.observe(element, options);
        } else if (!disabled && disabledLink) {
          disabledLink = false;
          keepAuthorWrites(observer?.takeRecords() ?? []);
          observer?.disconnect();
          authorValues.forEach((value, name) => write(name, value));
          authorValues.clear();
          renderer.removeAttribute(element, marker);
        }
      });
    });
    return observer;
  }
}

/**
 * Reads the author values a server render left in `data-gorilla-author`. The markup can come from
 * anywhere, so anything that is not an object of strings and `null`s is ignored.
 */
function readMarker(value: string | null): Record<string, string | null> {
  let parsed: unknown;
  try {
    parsed = value ? JSON.parse(value) : null;
  } catch {
    return {};
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(parsed).filter(
      (entry): entry is [string, string | null] =>
        entry[1] === null || typeof entry[1] === 'string',
    ),
  );
}

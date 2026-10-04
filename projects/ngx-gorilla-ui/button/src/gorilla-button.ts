import {
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
  },
})
export class GorillaButton {
  /** Emphasis: `filled` (default), `tonal`, `outlined` or `text`. */
  readonly appearance = input<GorillaButtonAppearance>('filled');
  /** Disables the button: no focus by `Tab` on `<a>` and no click handlers on either element. */
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly isButton: boolean;
  protected readonly appearanceClass = computed(() => `gorilla-button-${this.appearance()}`);

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

    // On `<a>`, `disabled` takes over `aria-disabled` and `tabindex`. The author's values are kept
    // aside while disabled (also the ones they set or bind later) and come back on re-enable.
    const owned: Record<string, string> = { tabindex: '-1', 'aria-disabled': 'true' };
    const authorValues = new Map<string, string | null>();
    const renderer = inject(Renderer2);
    const write = (name: string, value: string | null) =>
      value === null
        ? renderer.removeAttribute(element, name)
        : renderer.setAttribute(element, name, value);
    // Watches the author's writes while disabled; there is no `MutationObserver` on the server.
    const keepOwned = (records: MutationRecord[]) => {
      for (const { attributeName } of records) {
        const value = attributeName && element.getAttribute(attributeName);
        if (attributeName && value !== owned[attributeName]) {
          authorValues.set(attributeName, value ?? null);
          write(attributeName, owned[attributeName]);
        }
      }
    };
    const observer =
      typeof MutationObserver === 'undefined' ? null : new MutationObserver(keepOwned);

    if (!this.isButton) {
      effect(() => {
        const disabled = this.disabled();
        untracked(() => {
          if (disabled && authorValues.size === 0) {
            for (const name of Object.keys(owned)) {
              authorValues.set(name, element.getAttribute(name));
              write(name, owned[name]);
            }
            observer?.observe(element, { attributeFilter: Object.keys(owned) });
          } else if (!disabled && authorValues.size > 0) {
            keepOwned(observer?.takeRecords() ?? []);
            observer?.disconnect();
            authorValues.forEach((value, name) => write(name, value));
            authorValues.clear();
          }
        });
      });
    }
    inject(DestroyRef).onDestroy(() => {
      observer?.disconnect();
      element.removeEventListener('click', blockWhileDisabled, { capture: true });
    });
  }
}

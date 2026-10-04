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

    // On `<a>`, `disabled` takes over `aria-disabled` and `tabindex`. The author's values are read
    // right before disabling, so the ones set or bound after creation come back on re-enable.
    if (!this.isButton) {
      const renderer = inject(Renderer2);
      const restore = (name: string, value: string | null) =>
        value === null
          ? renderer.removeAttribute(element, name)
          : renderer.setAttribute(element, name, value);
      let authorAttributes: { tabindex: string | null; ariaDisabled: string | null } | null = null;
      effect(() => {
        const disabled = this.disabled();
        untracked(() => {
          if (disabled && !authorAttributes) {
            authorAttributes = {
              tabindex: element.getAttribute('tabindex'),
              ariaDisabled: element.getAttribute('aria-disabled'),
            };
            renderer.setAttribute(element, 'aria-disabled', 'true');
            renderer.setAttribute(element, 'tabindex', '-1');
          } else if (!disabled && authorAttributes) {
            restore('tabindex', authorAttributes.tabindex);
            restore('aria-disabled', authorAttributes.ariaDisabled);
            authorAttributes = null;
          }
        });
      });
    }
    inject(DestroyRef).onDestroy(() =>
      element.removeEventListener('click', blockWhileDisabled, { capture: true }),
    );
  }
}

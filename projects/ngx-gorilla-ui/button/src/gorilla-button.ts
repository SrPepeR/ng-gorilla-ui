import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  HostAttributeToken,
  inject,
  input,
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
 * `variant`, `color` and `size` come from `GorillaVariant`. Every visual value is a
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
  hostDirectives: [{ directive: GorillaVariant, inputs: ['variant', 'color', 'size'] }],
  host: {
    class: 'gorilla-button',
    '[class]': 'appearanceClass()',
    '[attr.disabled]': 'isButton && disabled() ? "" : null',
    '[attr.aria-disabled]': '!isButton && disabled() ? "true" : authorAriaDisabled',
    '[attr.tabindex]': '!isButton && disabled() ? "-1" : authorTabIndex',
  },
})
export class GorillaButton {
  /** Emphasis: `filled` (default), `tonal`, `outlined` or `text`. */
  readonly appearance = input<GorillaButtonAppearance>('filled');
  /** Disables the button: no focus by `Tab` on `<a>` and no click handlers on either element. */
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly isButton: boolean;
  protected readonly authorTabIndex = inject(new HostAttributeToken('tabindex'), {
    optional: true,
  });
  protected readonly authorAriaDisabled = inject(new HostAttributeToken('aria-disabled'), {
    optional: true,
  });
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
    inject(DestroyRef).onDestroy(() =>
      element.removeEventListener('click', blockWhileDisabled, { capture: true }),
    );
  }
}

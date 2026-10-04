import { computed, Directive, input } from '@angular/core';

/** Visual language of a component: shape, elevation, borders and motion. */
export type GorillaVariantName =
  'default' | 'brutalist' | 'glass' | 'material' | 'minimal' | 'swift';

/** Color role a component reads its `--gorilla-<role>-*` tokens from. */
export type GorillaColor =
  'primary' | 'secondary' | 'tertiary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';

/** Size of a component, from `xs` to `xl`. */
export type GorillaSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Variant, color and size of a component, applied as host classes.
 *
 * Components add it through `hostDirectives` and style the classes it binds
 * (`gorilla-variant-<variant>`, `gorilla-color-<color>` and `gorilla-size-<size>`):
 *
 * ```ts
 * @Component({
 *   hostDirectives: [{ directive: GorillaVariant, inputs: ['variant', 'color', 'size'] }],
 * })
 * ```
 *
 * The classes come from a `computed()`, so they change with the inputs and nothing else: no
 * listeners, no timers, and the host keeps its own static and bound classes.
 */
@Directive({
  selector: '[gorillaVariant]',
  host: { '[class]': 'classes()' },
})
export class GorillaVariant {
  /** Visual language. Defaults to `default`. */
  readonly variant = input<GorillaVariantName>('default');
  /** Color role. Defaults to `primary`. */
  readonly color = input<GorillaColor>('primary');
  /** Size. Defaults to `md`. */
  readonly size = input<GorillaSize>('md');

  /** Host classes for the current inputs. */
  protected readonly classes = computed(
    () =>
      `gorilla-variant-${this.variant()} gorilla-color-${this.color()} gorilla-size-${this.size()}`,
  );
}

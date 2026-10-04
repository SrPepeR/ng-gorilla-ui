import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GorillaButton, GorillaButtonAppearance } from 'ngx-gorilla-ui/button';
import { GorillaColor, GorillaSize } from 'ngx-gorilla-ui/core';

/** Button page: colors, appearances, sizes and the disabled state. */
@Component({
  selector: 'gorilla-button-page',
  imports: [GorillaButton],
  templateUrl: './button.html',
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonPage {
  protected readonly colors: GorillaColor[] = [
    'primary',
    'secondary',
    'tertiary',
    'neutral',
    'success',
    'warning',
    'danger',
    'info',
  ];
  protected readonly appearances: GorillaButtonAppearance[] = [
    'filled',
    'tonal',
    'outlined',
    'text',
  ];
  protected readonly sizes: GorillaSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

  protected readonly inputs = [
    {
      name: 'color',
      type: 'GorillaColor',
      default: "'primary'",
      description:
        'Color role: primary, secondary, tertiary, neutral, success, warning, danger or info.',
    },
    {
      name: 'size',
      type: 'GorillaSize',
      default: "'md'",
      description: 'Height, padding and font size: xs, sm, md, lg or xl.',
    },
    {
      name: 'appearance',
      type: 'GorillaButtonAppearance',
      default: "'filled'",
      description: 'Emphasis: filled, tonal, outlined or text.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables the button. Accepts the bare attribute (disabled).',
    },
  ];

  protected readonly tokens = [
    ['--gorilla-button-height', 'Minimum height; by default the control height of the size.'],
    ['--gorilla-button-padding-inline', 'Horizontal padding; by default it grows with the size.'],
    ['--gorilla-button-radius', 'Corner radius (--gorilla-radius-md).'],
    ['--gorilla-button-gap', 'Space between an icon and the label (--gorilla-space-2).'],
    ['--gorilla-button-font-size', 'Font size; by default the font size of the size.'],
    ['--gorilla-button-font-weight', 'Font weight (--gorilla-font-weight-bold).'],
    ['--gorilla-button-background', 'Background, in every state.'],
    ['--gorilla-button-color', 'Text color, in every state.'],
    ['--gorilla-button-border-color', 'Border color, in every state.'],
    ['--gorilla-button-border-width', 'Border width: 2px on outlined, 1px on the rest.'],
    ['--gorilla-button-shadow', 'Shadow: a glow in the role color on filled.'],
    ['--gorilla-button-hover-transform', 'Transform on hover (scale(1.03)).'],
    ['--gorilla-button-active-transform', 'Transform while pressed (scale(0.95)).'],
    ['--gorilla-button-focus-ring-width', 'Width of the keyboard focus ring (2px).'],
    ['--gorilla-button-focus-ring-offset', 'Gap between the button and its focus ring (2px).'],
    [
      '--gorilla-button-transition-duration',
      'Duration of every transition (--gorilla-duration-normal).',
    ],
  ];

  protected readonly tokensSnippet = `/* The whole app. */
:root {
  --gorilla-button-radius: var(--gorilla-radius-full);
}

/* One part of the page, or a single button with a class of its own. */
.toolbar {
  --gorilla-button-height: 2rem;
  --gorilla-button-hover-transform: none;
}`;

  protected readonly usageSnippet = `import { Component } from '@angular/core';
import { GorillaButton } from 'ngx-gorilla-ui/button';

@Component({
  selector: 'app-actions',
  imports: [GorillaButton],
  template: \`
    <button gorilla-button type="button" color="success" (click)="save()">Save</button>
    <a gorilla-button appearance="text" href="/docs">Read the docs</a>
  \`,
})
export class Actions {
  save(): void {
    // Save the changes.
  }
}`;
}

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

  protected readonly usageSnippet = `import { GorillaButton } from 'ngx-gorilla-ui/button';

@Component({
  imports: [GorillaButton],
  template: \`
    <button gorilla-button type="button" color="success" (click)="save()">Save</button>
    <a gorilla-button appearance="text" href="/docs">Read the docs</a>
  \`,
})`;
}

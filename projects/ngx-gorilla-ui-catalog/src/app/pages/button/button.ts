import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GorillaButton, GorillaButtonAppearance } from 'ngx-gorilla-ui/button';
import { GorillaColor, GorillaSize } from 'ngx-gorilla-ui/core';

/** A candidate look for the `default` variant. */
interface Proposal {
  id: string;
  name: string;
  description: string;
}

/**
 * Button page. For now it compares the candidate looks of the `default` variant; once one is
 * picked, it becomes the library default and this page shows the button examples.
 */
@Component({
  selector: 'gorilla-button-page',
  imports: [GorillaButton],
  templateUrl: './button.html',
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonPage {
  protected readonly proposals: Proposal[] = [
    {
      id: 'soft',
      name: 'A. Soft and rounded',
      description:
        'Rounded corners, a light shadow on filled buttons, a 1px lift on hover and a small shrink when pressed.',
    },
    {
      id: 'crisp',
      name: 'B. Geometric and crisp',
      description:
        'Square corners, no shadows, semibold text and a flat press that moves the button down by 1px.',
    },
    {
      id: 'expressive',
      name: 'C. Expressive and tonal',
      description:
        'Pill shape, bold text, a glow in the role color on filled buttons and a springy scale on hover and press.',
    },
  ];

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
}

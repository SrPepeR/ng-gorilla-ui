import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GorillaTheme, GorillaThemeMode } from 'ngx-gorilla-ui/theme';

/** Segmented control to pick the light, dark or system theme of the catalog. */
@Component({
  selector: 'gorilla-theme-switcher',
  template: `
    <fieldset class="switcher">
      <legend class="visually-hidden">Theme</legend>
      @for (option of options; track option.mode) {
        <label class="option">
          <input
            type="radio"
            name="gorilla-theme"
            [value]="option.mode"
            [checked]="theme.theme() === option.mode"
            (change)="theme.setTheme(option.mode)"
          />
          <span>{{ option.label }}</span>
        </label>
      }
    </fieldset>
  `,
  styles: `
    .switcher {
      display: inline-flex;
      gap: var(--gorilla-space-1);
      margin: 0;
      padding: var(--gorilla-space-1);
      border: 1px solid var(--gorilla-border);
      border-radius: var(--gorilla-radius-full);
      transition: border-color var(--gorilla-duration-fast) var(--gorilla-easing-standard);
    }

    .option {
      position: relative;
      display: inline-flex;
    }

    input {
      position: absolute;
      inset: 0;
      margin: 0;
      opacity: 0;
      cursor: pointer;
    }

    span {
      padding: var(--gorilla-space-1) var(--gorilla-space-3);
      border-radius: var(--gorilla-radius-full);
      font-size: var(--gorilla-font-size-sm);
      transition:
        background-color var(--gorilla-duration-fast) var(--gorilla-easing-standard),
        color var(--gorilla-duration-fast) var(--gorilla-easing-standard);
    }

    input:checked + span {
      background: var(--gorilla-neutral-solid);
      color: var(--gorilla-neutral-on-solid);
    }

    input:focus-visible + span {
      outline: 2px solid var(--gorilla-focus-ring);
      outline-offset: 2px;
    }

    /* Forced colors repaint both states alike: mark the checked option with system colors. */
    @media (forced-colors: active) {
      input:checked + span {
        forced-color-adjust: none;
        background: Highlight;
        color: HighlightText;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSwitcher {
  protected readonly theme = inject(GorillaTheme);
  protected readonly options: { mode: GorillaThemeMode; label: string }[] = [
    { mode: 'light', label: 'Light' },
    { mode: 'dark', label: 'Dark' },
    { mode: 'system', label: 'System' },
  ];
}

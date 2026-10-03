import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeSwitcher } from './shared/theme-switcher';

@Component({
  selector: 'gorilla-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ThemeSwitcher],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly links = [
    { path: '/', label: 'Getting started' },
    { path: '/theming', label: 'Theming' },
    { path: '/tokens', label: 'Tokens' },
  ];
}

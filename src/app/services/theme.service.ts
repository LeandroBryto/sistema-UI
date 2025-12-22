import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = new BehaviorSubject<boolean>(true);
  isDarkMode$ = this.darkMode.asObservable();

  constructor(@Inject(DOCUMENT) private document: Document) {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.setTheme(savedTheme === 'dark');
    } else {
      // Default to dark
      this.setTheme(true);
    }
  }

  toggleTheme() {
    this.setTheme(!this.darkMode.value);
  }

  private setTheme(isDark: boolean) {
    this.darkMode.next(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Switch PrimeNG Theme
    const themeLink = this.document.getElementById('theme-css') as HTMLLinkElement;
    const themeName = isDark ? 'aura-dark-indigo' : 'aura-light-indigo';
    
    if (themeLink) {
        themeLink.href = `assets/themes/${themeName}/theme.css`;
    }

    // Toggle app-dark class on HTML element (required for Sakai Layout)
    const htmlElement = this.document.documentElement;
    if (isDark) {
        htmlElement.classList.add('app-dark');
    } else {
        htmlElement.classList.remove('app-dark');
    }

    // Toggle Body Class for global styles (compatibility)
    const bodyElement = this.document.body;
    if (isDark) {
      bodyElement.classList.remove('light-theme');
      bodyElement.classList.add('dark-theme');
    } else {
      bodyElement.classList.remove('dark-theme');
      bodyElement.classList.add('light-theme');
    }
  }
  
  isDark(): boolean {
    return this.darkMode.value;
  }
}

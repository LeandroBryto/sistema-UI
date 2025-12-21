import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = new BehaviorSubject<boolean>(true);
  isDarkMode$ = this.darkMode.asObservable();

  constructor() {
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
    
    if (isDark) {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    }
  }
  
  isDark(): boolean {
    return this.darkMode.value;
  }
}

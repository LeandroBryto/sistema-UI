import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private readonly STORAGE_KEY = 'app_conta_permissions';

  constructor(private auth: AuthService) {}

  // Get list of user IDs who have access
  private getAllowedUserIds(): number[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  // Check if current user has access
  canAccessConta(): boolean {
    if (this.auth.isAdmin()) return true; // Admins always have access
    
    const username = this.auth.getUsername();
    if (!username) return false;

    const allowedUsernames = this.getAllowedUsernames();
    // Case insensitive check
    return allowedUsernames.some(u => u.toLowerCase() === username.toLowerCase());
  }

  // Admin methods
  getAllowedUsernames(): string[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error parsing permission data', e);
      return [];
    }
  }

  grantAccess(username: string): void {
    const list = this.getAllowedUsernames();
    // Avoid duplicates (case insensitive check)
    if (!list.some(u => u.toLowerCase() === username.toLowerCase())) {
      list.push(username); // Store original case just in case
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    }
  }

  revokeAccess(username: string): void {
    let list = this.getAllowedUsernames();
    // Remove case insensitive
    list = list.filter(u => u.toLowerCase() !== username.toLowerCase());
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
  }

  toggleAccess(username: string, grant: boolean): void {
    if (grant) this.grantAccess(username);
    else this.revokeAccess(username);
  }
}

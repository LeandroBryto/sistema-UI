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
    
    // For now, we need the user ID. AuthService usually has it.
    // If AuthService doesn't expose ID directly, we might need to decode token or fetch profile.
    // Let's assume we can get it or use username if ID not available.
    // Looking at AuthService (previous search), it has getUsername().
    // Let's use username for mapping permissions as it's easier to retrieve without an async call.
    const username = this.auth.getUsername();
    if (!username) return false;

    const allowedUsernames = this.getAllowedUsernames();
    return allowedUsernames.includes(username);
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
    if (!list.includes(username)) {
      list.push(username);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    }
  }

  revokeAccess(username: string): void {
    let list = this.getAllowedUsernames();
    list = list.filter(u => u !== username);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
  }

  toggleAccess(username: string, grant: boolean): void {
    if (grant) this.grantAccess(username);
    else this.revokeAccess(username);
  }
}

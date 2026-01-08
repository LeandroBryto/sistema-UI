import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UpgradeService {
  private showModalSubject = new BehaviorSubject<boolean>(false);
  showModal$ = this.showModalSubject.asObservable();

  showUpgradeModal() {
    this.showModalSubject.next(true);
  }

  hideUpgradeModal() {
    this.showModalSubject.next(false);
  }
}
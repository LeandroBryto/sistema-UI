import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
// import { UpgradeService } from '../../../../services/upgrade.service';

@Component({
  selector: 'app-sistema-estudos-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, ProgressBarModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  // constructor(private upgradeService: UpgradeService) {}

  openUpgradeModal() {
    // this.upgradeService.showUpgradeModal();
    console.log('Upgrade modal');
  }

}

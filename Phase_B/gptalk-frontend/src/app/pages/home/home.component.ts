import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MiscUtils } from '../../core/utils/misc.utils';
import { PanelModule } from 'primeng/panel';
import { AvatarModule } from 'primeng/avatar';
import { MyProfileService } from '../my-profile/my-profile.service';
import { DailyWordComponent } from './daily-word/daily-word.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    PanelModule,
    AvatarModule,
    DailyWordComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly myProfileService = inject(MyProfileService);


  protected readonly util = MiscUtils;

  date = new Date();
  myProfile$ = this.myProfileService.getUserProfile();

  // Returns the current part of day based on the user's timezone
  getTimeOfDay() {
    const hrs = this.date.getHours();
    if (hrs < 12 ) {
      return "Morning";
    }
    else if (hrs >= 12 && hrs <= 17) {
      return "Afternoon";
    }
    else {
      return "Evening";
    }
  }
}

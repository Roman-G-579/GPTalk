import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { MiscUtils } from '../../core/utils/misc.utils';
import { PanelModule } from 'primeng/panel';
import { DailyWordService } from '../../core/services/daily-word.service';
import { Language } from '../../../models/enums/language.enum';
import { DailyWord } from '../../../models/daily-word.interface';
import { AvatarModule } from 'primeng/avatar';
import { MyProfileService } from '../my-profile/my-profile.service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    PanelModule,
    AvatarModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly wtd = inject(DailyWordService);
  private readonly myProfileService = inject(MyProfileService);


  protected readonly util = MiscUtils;

  languageIconRecord: Record<Language, string> = {
    English: 'assets/profile/languages/english.png',
    Spanish: 'assets/profile/languages/spanish.png',
    Russian: 'assets/profile/languages/russian.png',
    Hebrew: 'assets/profile/languages/hebrew.png',
  };

  date = new Date();
  myProfile$ = this.myProfileService.getUserProfile();

  dailyWord = this.wtd.dailyWord;
  ngOnInit() {
    this.wtd.getDailyWord().then();
  }

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

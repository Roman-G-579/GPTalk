import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { UserAvatarComponent } from '../../../../core/common/user-avatar/user-avatar.component';
import { SinceDatePipe } from '../../../../core/pipes/since-date.pipe';
import { UserProfile } from '../../interfaces/user-profile.interface';

@Component({
	selector: 'app-profile-details',
	standalone: true,
	imports: [CommonModule, UserAvatarComponent, ButtonModule, SinceDatePipe],
	templateUrl: './profile-details.component.html',
	styleUrl: './profile-details.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileDetailsComponent {
	profile = input.required<UserProfile>();

  getTopLanguage() {
    const languages = this.profile().languages;
    let topLanguage = languages[0];
    for (const language of languages) {
      if (language.exp > topLanguage.exp) {
        topLanguage = language;
      }
    }
    return topLanguage;
  }
}

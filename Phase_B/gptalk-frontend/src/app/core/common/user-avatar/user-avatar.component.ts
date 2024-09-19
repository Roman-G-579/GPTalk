import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';

@Component({
	selector: 'app-user-avatar',
	standalone: true,
	imports: [CommonModule, AvatarModule],
	templateUrl: './user-avatar.component.html',
	styleUrl: './user-avatar.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAvatarComponent {
	imgUrl = input<string | undefined>('');
	size = input<'xlarge' | 'large'>('large');
}

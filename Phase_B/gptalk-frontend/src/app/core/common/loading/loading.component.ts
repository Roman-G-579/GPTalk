import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';

@Component({
	selector: 'app-loading',
	standalone: true,
	imports: [CommonModule, LottieComponent],
	templateUrl: './loading.component.html',
	styleUrl: './loading.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingComponent {
  loadingOptions: AnimationOptions = {
    path: '/assets/lottie/loading.json'
  };

  text = input('Loading...');
}

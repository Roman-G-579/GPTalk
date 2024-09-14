import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Button } from 'primeng/button';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LearnService } from '../learn.service';

@Component({
	selector: 'app-results-screen',
	standalone: true,
	imports: [Button, RouterLink],
	templateUrl: './results-screen.component.html',
	styleUrl: './results-screen.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsScreenComponent {
	protected readonly lrn = inject(LearnService);
	private readonly router = inject(Router);
	private readonly route = inject(ActivatedRoute);

	totalExercises = this.lrn.totalExercises;
	lessonExp = this.lrn.lessonExp;
	correctAnswers = this.totalExercises() - this.lrn.mistakesCounter();

	navigateHome() {
		void this.router.navigate(['../home'], { relativeTo: this.route });
	}
}

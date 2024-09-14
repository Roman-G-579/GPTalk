import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { TagModule } from 'primeng/tag';

@Component({
	selector: 'app-about',
	standalone: true,
	imports: [CommonModule, CarouselModule, TagModule],
	templateUrl: './about.component.html',
	styleUrl: './about.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
	software = [
		{
			name: 'Angular',
			image: 'assets/software-logos/Angular.png',
		},
		{
			name: 'MongoDB',
			image: 'assets/software-logos/MongoDB.png',
		},
		{
			name: 'Express.js',
			image: 'assets/software-logos/Express.png',
		},
		{
			name: 'OpenAI',
			image: 'assets/software-logos/OpenAI.png',
		},
		{
			name: 'Jest',
			image: 'assets/software-logos/Jest.png',
		},
	];
}

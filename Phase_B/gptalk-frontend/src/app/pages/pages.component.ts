import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
	selector: 'app-pages',
	standalone: true,
	imports: [CommonModule, RouterOutlet],
	templateUrl: './pages.component.html',
	styleUrls: ['./pages.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagesComponent {
	title = 'Angular Master';
}

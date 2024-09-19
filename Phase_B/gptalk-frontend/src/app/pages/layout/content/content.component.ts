import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
	selector: 'app-content',
	standalone: true,
	imports: [CommonModule, RouterOutlet],
	templateUrl: './content.component.html',
	styleUrl: './content.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentComponent {}

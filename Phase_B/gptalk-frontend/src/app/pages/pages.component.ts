import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { ContentComponent } from './layout/content/content.component';

@Component({
	selector: 'app-pages',
	standalone: true,
	imports: [CommonModule, SidebarComponent, ContentComponent],
	templateUrl: './pages.component.html',
	styleUrls: ['./pages.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagesComponent {
	title = 'Angular Master';
}

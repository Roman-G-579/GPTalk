import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
	standalone: true,
	imports: [RouterOutlet],
	selector: 'app-root',
	template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {
	ngOnInit() {
		const message = `
    %c
    🔥 Angular template created with ♥

    🔥 Created by Oneill19: http://github.com/oneill19
    `;
		const styles = [
			'font-size: 12px',
			'font-family: monospace',
			'display: inline-block',
			'color: #ED2939',
			'padding: 8px',
			'width: 100%',
			'margin-bottom: 13px',
			'border: 1px dashed',
		].join(';');
		console.log(message, styles);
	}
}

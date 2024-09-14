import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'sinceDate',
	standalone: true,
})
export class SinceDatePipe implements PipeTransform {
	transform(value: string): string {
		const date = new Date(value);

		// Get the month name
		const monthNames = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December',
		];
		const month = monthNames[date.getUTCMonth()]; // getUTCMonth() returns month index 0-11

		// Get the year
		const year = date.getUTCFullYear();

		// Format the date as "Since Month Year"
		return `Since ${month} ${year}`;
	}
}

export interface Achievement {
	title: string;
	level: number;
	goal: number;
	icon: string;
	type: 'streak' | 'exp' | 'mistakes' | 'lessons' | 'languages';
	progress: number;
}
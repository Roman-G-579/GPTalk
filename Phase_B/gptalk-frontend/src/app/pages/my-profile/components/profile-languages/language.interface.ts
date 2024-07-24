export interface Language {
	_id?: string,
	user: string,
	language: 'English' | 'Spanish' | 'Russian' | 'Hebrew',
	rank: 'Novice' | 'Expert' | 'Master',
}

export interface Language {
	language: 'English' | 'Spanish' | 'Russian' | 'Hebrew',
	rank: 'Novice' | 'Advanced' | 'Master',
  exp: number,
  expToNextRank: number
}

import { Language } from '../../../core/enums/language.enum';

export interface Result {
	_id?: string;
	exp: number;
	date: Date;
	language: Language;
	user: string;
}

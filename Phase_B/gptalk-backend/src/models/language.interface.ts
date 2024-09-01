import { Schema, model } from 'mongoose';
import { LanguageEnum } from './enums/language.enum';

export interface Language {
	_id?: Schema.Types.ObjectId,
	user: Schema.Types.ObjectId,
	language: LanguageEnum,
	rank: 'Novice' | 'Expert' | 'Master',
}

const languageSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		language: {
			type: String,
			enum: Object.values(LanguageEnum),
			required: true,
		},
		rank: {
			type: String,
			default: 'Novice',
		},
	}
);

export const LanguageModel = model<Language>('Language', languageSchema);
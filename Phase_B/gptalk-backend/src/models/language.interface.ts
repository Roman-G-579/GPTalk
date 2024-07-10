import { Schema, model } from 'mongoose';

export interface Language {
	_id?: Schema.Types.ObjectId,
	user: Schema.Types.ObjectId,
	language: 'English' | 'Spanish' | 'Russian' | 'Hebrew',
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
			required: true,
		},
		rank: {
			type: String,
			default: 'Novice',
		},
	}
);

export const LanguageModel = model<Language>('Language', languageSchema);
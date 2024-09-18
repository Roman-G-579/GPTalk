import { model, Schema } from 'mongoose';
import { LanguageEnum } from './enums/language.enum';

export interface DailyWord {
	_id: Schema.Types.ObjectId;
	date: Date;
	word: string;
	definition: string;
	example: string;
	translation: string;
	language: LanguageEnum;
}

const dailyWordSchema = new Schema(
	{
		date: {
			type: Date,
			default: new Date(),
		},
		word: {
			type: String,
			required: true,
		},
		definition: {
			type: String,
			required: true,
		},
		example: {
			type: String,
			required: true,
		},
		translation: {
			type: String,
			required: true,
		},
		language: {
			type: String,
			enum: LanguageEnum,
			required: true,
		},
		translationLanguage: {
			type: String,
			enum: LanguageEnum,
			required: true,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

export const DailyWordModel = model<DailyWord>('DailyWord', dailyWordSchema);

import { model, Schema } from 'mongoose';
import { Language } from './language.interface';

export interface DailyWord {
	_id: Schema.Types.ObjectId;
	date: Date;
	word: string;
	definition: string;
	example: string;
	translation: string;
	language: string;
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
			required: true,
		}
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

export const DailyWordModel = model<DailyWord>('DailyWord', dailyWordSchema);

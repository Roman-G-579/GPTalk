import { Schema, model } from 'mongoose';
import { LanguageEnum } from './enums/language.enum';

export interface Result {
	_id?: Schema.Types.ObjectId;
	exp: number;
	date: Date;
	language: LanguageEnum;
	user: Schema.Types.ObjectId;
}

const resultSchema = new Schema(
	{
		exp: {
			type: Number,
			required: true,
		},
		date: {
			type: Date,
			default: new Date(),
		},
		language: {
			type: String,
			enum: Object.values(LanguageEnum),
			required: true,
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

export const ResultModel = model<Result>('Result', resultSchema);

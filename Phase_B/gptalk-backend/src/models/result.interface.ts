import { Schema, model } from 'mongoose';

export interface Result {
	_id?: Schema.Types.ObjectId;
	exp: number;
	date: Date;
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

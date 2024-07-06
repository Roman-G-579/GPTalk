import { model, Schema } from 'mongoose';

export interface VisitLog {
	_id?: Schema.Types.ObjectId;
	user: Schema.Types.ObjectId;
	date: Date;
}

const visitLogSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		date: {
			type: Date,
			reuired: true,
			default: new Date(),
		},
	},
	{
		timestamps: true,
	},
);

export const VisitLogModel = model<VisitLog>('VisitLog', visitLogSchema);

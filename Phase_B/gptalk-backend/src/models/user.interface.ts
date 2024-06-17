import { Schema, model } from 'mongoose';

export interface User {
	_id?: Schema.Types.ObjectId;
	username: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
}

const userSchema = new Schema(
	{
		username: {
			type: String,
			required: true,
		},
		firstName: {
			type: String,
			required: true,
		},
		lastName: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	},
);

export const UserModel = model<User>('User', userSchema);

import { Schema, model } from 'mongoose';

export enum Role {
	ADMIN = 'ADMIN',
	PRO = 'PRO',
	USER = 'USER',
}

export interface User {
	_id?: Schema.Types.ObjectId;
	username: string;
	email: string;
	age: number;
	role: Role;
}

const userSchema = new Schema(
	{
		username: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		age: {
			type: Number,
			required: true,
		},
		role: {
			type: String,
			required: true,
			enum: Role,
		},
	},
	{
		timestamps: true,
	},
);

export const UserModel = model<User>('User', userSchema);

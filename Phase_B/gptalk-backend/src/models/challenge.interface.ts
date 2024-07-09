import { Schema, model } from 'mongoose';

export interface Challenge {
  date: Date;
  numberOfQuestions: number;
  mistakes: number;
  user: Schema.Types.ObjectId;
  result: Schema.Types.ObjectId;
}

const challengeSchema = new Schema(
  {
    date: {
      type: Date,
      default: new Date(),
    },
    numberOfQuestions: {
      type: Number,
      required: true,
    },
    mistakes: {
      type: Number,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    result: {
      type: Schema.Types.ObjectId,
      ref: 'Result',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const ChallengeModel = model<Challenge>('Challenge', challengeSchema);
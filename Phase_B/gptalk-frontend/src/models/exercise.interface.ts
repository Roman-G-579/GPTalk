import { ExerciseType } from './enums/exercise-type.enum';

export interface Exercise {
  type: ExerciseType;
  instructions: string;
  question?: string;
  choices?: string[];
  wordPairs?: [string, string][]; //Left string - the word in language 1, right string - the equivalent in language 2
  randomizedWordPairs?: [string, string][];
  answer?: string;
}

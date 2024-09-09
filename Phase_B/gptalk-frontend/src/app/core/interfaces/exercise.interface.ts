import { ExerciseType } from '../enums/exercise-type.enum';

export interface Exercise {
  type: ExerciseType;
  heading?: string; // Concise goal of the current exercise
  instructions?: string; // Detailed instructions of the current exercise
  question?: string;
  prompt?: string; // Opening statement in conversation (CompleteTheConversation)
  cat_a?: string; // category a (MatchTheCategory)
  cat_b?: string; // category b (MatchTheCategory)
  words_a?: string[]; // category a words (MatchTheCategory)
  words_b?: string[]; // category b words (MatchTheCategory)
  sentenceBeforeBlank?: string; // Part of sentence before the missing word (FillInTheBlank)
  sentenceAfterBlank?: string; // Part of sentence after the missing word (FillInTheBlank)
  choices?: string[];
  correctPairs?: [string, string][];
  randomizedPairs?: [string, string][]; // The word pairs with each column being independently shuffled
  answer?: string;
  translation?: string;
  translations?: string[]; // Array of translated strings (TranslateWord)
}

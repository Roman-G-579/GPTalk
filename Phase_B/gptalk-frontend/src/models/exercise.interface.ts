import { ExerciseType } from './enums/exercise-type.enum';
import { Language } from './enums/language.enum';
import { SafeHtml } from '@angular/platform-browser';

export interface Exercise {
  type: ExerciseType;
  language?: Language;
  heading?: string; // Concise goal of the current exercise
  instructions: string; // Detailed instructions of the current exercise
  question?: string;
  choices?: string[];
  correctPairs?: [string, string][]; // Left string - the word in language 1, right string - the equivalent in language 2
  randomizedPairs?: [string, string][]; // The word pairs with each column being independently shuffled
  answer?: string;
  translation?: string;
}

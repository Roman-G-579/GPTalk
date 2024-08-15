import { Language } from '../../../../models/enums/language.enum';

export interface DailyWord {
  word: string;
  definition: string;
  example: string;
  translation: string;
  language: Language;
}

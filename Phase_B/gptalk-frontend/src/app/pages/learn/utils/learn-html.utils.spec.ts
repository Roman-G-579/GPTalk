import {ElementRef, signal, WritableSignal} from "@angular/core";
import {LearnHtmlUtils} from "./learn-html.utils";
import {Exercise} from "../../../core/interfaces/exercise.interface";
import {ExerciseType} from "../../../core/enums/exercise-type.enum";
import {Language} from "../../../core/enums/language.enum";

describe('LearnHtmlUtils', () => {
  describe('forceFocus', () => {
    it('should focus on the input field if inputFieldRef is provided', () => {
      const mockElementRef = {
        nativeElement: {
          focus: jest.fn()
        }
      } as unknown as ElementRef;

      LearnHtmlUtils.forceFocus(mockElementRef);
      expect(mockElementRef.nativeElement.focus).toHaveBeenCalled();
    });

    it('should not throw an error if inputFieldRef is not provided', () => {
      expect(() => LearnHtmlUtils.forceFocus(null as never)).not.toThrow();
    });
  });

  describe('elemContainsAnswer', () => {
    it('should return true if the choice matches the exercise answer', () => {
      const exerciseSignal: WritableSignal<Exercise> = signal({
        type: ExerciseType.FillInTheBlank,
        answer: 'correctAnswer',
      });

      expect(LearnHtmlUtils.elemContainsAnswer('correctAnswer', exerciseSignal)).toBe(true);
    });

    it('should return false if the choice does not match the exercise answer', () => {
      const exerciseSignal: WritableSignal<Exercise> = signal({
        type: ExerciseType.FillInTheBlank,
        answer: 'wrongAnswer',
      });

      expect(LearnHtmlUtils.elemContainsAnswer('correctAnswer', exerciseSignal)).toBe(false);
    });
  });

  describe('langDirection', () => {
    it('should return "rtl" for Hebrew language', () => {
      const languageSignal: WritableSignal<Language> = signal(Language.Hebrew);

      expect(LearnHtmlUtils.langDirection(languageSignal)).toBe('rtl');
    });

    it('should return "ltr" for non-Hebrew languages', () => {
      const languageSignal: WritableSignal<Language> = signal(Language.English);

      expect(LearnHtmlUtils.langDirection(languageSignal)).toBe('ltr');
    });
  });
});

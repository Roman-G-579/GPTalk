import { ElementRef, WritableSignal } from '@angular/core';
import { Exercise } from '../../../core/interfaces/exercise.interface';
import { Language } from '../../../core/enums/language.enum';

/**
 * Contains functions used by the Learn component's html templates
 */
export class LearnHtmlUtils {
	/**
	 * Refocuses on the text input element (used whenever the element loses focus)
	 */
	static forceFocus(inputFieldRef: ElementRef) {
		if (inputFieldRef) {
			//If the input element is active
			inputFieldRef.nativeElement.focus();
		}
	}

	/**
	 * Returns true if the HTML element that called the function contains the correct answer
	 * @param choice the string displayed on the element that called the function
	 * @param exercise signal containing the current exercise data
	 */
	static elemContainsAnswer(choice: string, exercise: WritableSignal<Exercise>): boolean {
		return exercise().answer === choice;
	}

	/**
	 * Compares the user's input and the actual answer, and highlights words
	 * that do not match the exercise's answer
	 * @param inputText the text entered by the user
	 * @param exercise the exercise object that contains the answer that the user's input is to be compared against
	 */
	static highlightMistakes(inputText: string, exercise: WritableSignal<Exercise>) {
		// Split both the input and the answer into words
		const inputWords = inputText
			.replace(/[,.!?:]/g, '')
			.trim()
			.toLowerCase()
			.split(/\s+/);
		const answerWords = exercise().answer?.split(/\s+/) ?? [];

		// Iterate over the maximum length between the input and answer words
		const highlightedWords = inputWords.map((word, index) => {
			// First, check if the words match at the current index
			if (answerWords[index] !== undefined && word === answerWords[index]) {
				return word; // No highlighting needed
			}

			// If there's a mismatch, check within a distance of 1 index
			const isNearbyMatch =
				(index > 0 && answerWords[index - 1] === word) || // Previous word matches
				(index < answerWords.length - 1 && answerWords[index + 1] === word); // Next word matches

			if (isNearbyMatch) {
				return word; // Skip highlighting if a nearby match is found
			}

			// Highlight the word if no nearby match is found
			return word && `<strong>${word}</strong>`;
		});

		return highlightedWords.join(' ');
	}
}

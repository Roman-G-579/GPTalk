import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DragDropModule } from 'primeng/dragdrop';
import { LearnHtmlUtils } from '../utils/learn-html.utils';
import { LearnVerificationUtils } from '../utils/learn-verification.utils';
import { LearnService } from '../learn.service';
import { Button } from 'primeng/button';
import { NgForOf } from '@angular/common';

@Component({
	selector: 'app-match-the-category',
	standalone: true,
	imports: [DragDropModule, Button, NgForOf],
	templateUrl: './match-the-category.component.html',
	styleUrl: './match-the-category.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchTheCategoryComponent {
	protected readonly utilHtml = LearnHtmlUtils;
	protected readonly vrf = LearnVerificationUtils;

	protected readonly lrn = inject(LearnService);

	exerciseData = this.lrn.exerciseData;
	isExerciseDone = this.lrn.isExerciseDone;

	categoryMatches = this.lrn.categoryMatches;
	draggedWord = this.lrn.draggedWord;
	/**
	 * Handles the start of the drag event
	 *
	 * Used by exercises: MatchTheCategory
	 * @param word the value of the element being dragged
	 */
	dragStart(word: string) {
		this.draggedWord.set(word);
	}

	/**
	 * Clears the draggedWord value, signifying the end of a drag event
	 *
	 * Used by exercises: MatchTheCategory
	 */
	dragEnd() {
		this.draggedWord.set('');
	}

	/**
	 * Handles the drop part of a drag-and-drop event by moving the item
	 * that called the method to one of the category containers
	 *
	 * Used by exercises: MatchTheCategory
	 * @param catIndex the index of the category represented by the target category container
	 */
	drop(catIndex: number) {
		const draggedWord = this.draggedWord();
		if (!draggedWord) return;

		const cat1Arr = this.categoryMatches().cat1;
		const cat2Arr = this.categoryMatches().cat2;
		const wordBankArr = this.categoryMatches().wordBank;

		// Moves draggedWord from one array to the other
		const addToCategory = (targetArr: string[], otherArr: string[]) => {
			// If the word is not in this category already, add it
			if (!targetArr.includes(draggedWord)) {
				targetArr.push(draggedWord);
			}
			// Remove word from the other category
			if (otherArr.includes(draggedWord)) {
				otherArr.splice(otherArr.indexOf(draggedWord), 1);
			}
			// Remove word from word bank
			if (wordBankArr.includes(draggedWord)) {
				wordBankArr.splice(wordBankArr.indexOf(draggedWord), 1);
			}
		};
		// Move word to the array of the category matching the given index
		catIndex === 0 ? addToCategory(cat1Arr, cat2Arr) : addToCategory(cat2Arr, cat1Arr);

		// Updates the categories and wordBank arrays
		this.categoryMatches.update((data) => {
			data.cat1 = cat1Arr;
			data.cat2 = cat2Arr;
			data.wordBank = wordBankArr;
			return data;
		});
	}
}

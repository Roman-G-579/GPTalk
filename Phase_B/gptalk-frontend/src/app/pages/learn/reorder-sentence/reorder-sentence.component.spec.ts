import { ReorderSentenceComponent } from './reorder-sentence.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Exercise } from '../../../core/interfaces/exercise.interface';
import { ExerciseType } from '../../../core/enums/exercise-type.enum';
import { Language } from '../../../core/enums/language.enum';
import { LearnService } from '../learn.service';

class MockLearnService {
	isExerciseDone = signal<boolean>(false);
	isCorrectAnswer = signal<boolean>(false);

	exerciseData = signal<Exercise>({
		type: ExerciseType.FillInTheBlank,
		heading: '',
		instructions: '',
		question: '',
		choices: [],
		correctPairs: [],
		randomizedPairs: [],
		answer: '',
		translation: '',
	});

	lessonLanguage = signal<Language>(Language.English);
	chosenWords = signal<string[]>([]);
}
describe('ReorderSentenceComponent', () => {
	let rsComp: ReorderSentenceComponent;
	let fixture: ComponentFixture<ReorderSentenceComponent>;

	let mockLearnService: MockLearnService;

	beforeEach(async () => {
		mockLearnService = new MockLearnService();

		await TestBed.configureTestingModule({
			providers: [{ provide: LearnService, useValue: mockLearnService }],
		}).compileComponents();

		// Creates a fixture and gets the component instance
		fixture = TestBed.createComponent(ReorderSentenceComponent);
		rsComp = fixture.componentInstance;
	});

	it('should initialize with data from LearnService', () => {
		expect(rsComp.exerciseData()).toEqual(mockLearnService.exerciseData());
		expect(rsComp.lessonLanguage()).toBe(Language.English);
		expect(rsComp.isExerciseDone()).toBe(false);
		expect(rsComp.isCorrectAnswer()).toBe(false);
	});

	it('should toggle word selection correctly', () => {
		mockLearnService.exerciseData.update((data) => {
			data.choices?.push('this', 'is', 'a', 'test');
			return data;
		});

		// First word of the sentence is added to chosenWords
		rsComp.toggleWordSelection(0);
		expect(mockLearnService.chosenWords()).toContain('this');

		// First word of the sentence is removed from chosenWords
		rsComp.toggleWordSelection(0);
		expect(mockLearnService.chosenWords()).not.toContain('this');
	});

	it('should remove a word from chosenWords', () => {
		mockLearnService.chosenWords.update((data) => {
			data.push('this', 'is', 'a', 'test');
			return data;
		});

		// Assert that 'is' is removed from the chosenWords array
		rsComp.removeWord(1);
		expect(mockLearnService.chosenWords()).toEqual(['this', 'a', 'test']);
	});
});

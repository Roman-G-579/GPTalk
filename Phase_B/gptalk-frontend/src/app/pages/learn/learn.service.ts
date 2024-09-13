import {computed, inject, Injectable, signal} from '@angular/core';
import {Exercise} from '../../core/interfaces/exercise.interface';
import {ExerciseType} from '../../core/enums/exercise-type.enum';
import {Language} from '../../core/enums/language.enum';
import {Language as ILanguage} from '../my-profile/components/profile-languages/language.interface';
import {MiscUtils as util} from '../../core/utils/misc.utils';
import {LearnInitializerUtils as init} from './utils/learn-initializer.utils';
import {Subject} from 'rxjs';
import {AuthService} from '../../core/services/auth.service';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {RewardVals} from '../../core/enums/exp-vals.enum';
import {Difficulty} from 'src/app/core/enums/difficulty.enum';

@Injectable({
	providedIn: 'root',
})
export class LearnService {
	private readonly authService = inject(AuthService);
	private readonly http = inject(HttpClient);
	private readonly apiUrl = `${environment.apiUrl}`;

	// Signals child components that the active exercise has changed
	onExerciseSwitch: Subject<unknown> = new Subject();

	// Booleans
	isExerciseDone = signal<boolean>(false); // Changes to true once an exercise is over
	isLessonOver = signal<boolean>(false); // Changes to true once the lesson is over
	isCorrectAnswer = signal<boolean>(false); // Changes to true if user answers correctly

	// Counters
	mistakesCounter = signal<number>(0); // Counts the mistakes in the lesson's exercises
	totalExercises = signal<number>(0); // Stores the total amount of exercises in the current lesson

	// The user's total exp
	totalExp = this.authService.totalExp;

  // exp gained in current lesson
	lessonExp = signal<number>(0);

	// Counts the number of penalties for the exercise
	// Penalties are given for wrong matches in MatchTheWords and hints used by the user
	penalties = signal<number>(0);

	// Contains a string that gives a hint related to the solution of the current exercise
	hintText = signal<string>('');

	headingText = signal<string>(''); // Contains instructions or exercise feedback

	// MatchTheWords-specific signals
	matchResults = signal<[boolean, boolean][]>([]); // Contains boolean pairs that signify whether the matches are correct or not
	chosenPair = signal<[string, string]>(['', '']); // Contains the current chosen pair of words in the "match the words" exercise

	// MatchTheCategory-specific signals
	categoryMatches = signal<{ wordBank: string[]; cat1: string[]; cat2: string[] }>({
		wordBank: [],
		cat1: [],
		cat2: [],
	});
	draggedWord = signal<string>('');

	// ReorderWords-specific signal
	// Contains an array of strings that are used to construct the answer sentence
	chosenWords = signal<string[]>([]);

	exerciseArr = signal<Exercise[]>([]);

	exerciseData = signal<Exercise>({
		type: ExerciseType.FillInTheBlank,
		heading: '',
		instructions: '',
		question: '',
		choices: [''],
		correctPairs: [],
		randomizedPairs: [],
		answer: '',
		translation: '',
	});

  // The user's selected language for the current lesson
	lessonLanguage = signal<Language>(Language.NOT_SELECTED);

  // Sets the difficulty level based on the user's rank in the selected language
  // (in lessonLanguage)
	lessonLanguageRank = computed(() => {
		if (this.lessonLanguage() === Language.NOT_SELECTED) {
			return 'Novice';
		}

		const selectedLanguage = this.authService
			.languages()
			.find((language: ILanguage) => language.language === this.lessonLanguage()) || {
			language: this.lessonLanguage(),
			rank: Difficulty.Novice,
		};

		return selectedLanguage?.rank;
	});

	/**
	 * Sets up the data and parameters for the current lesson
	 * @param exercisesArr the array of generated exercises
	 */
	setUpLesson(exercisesArr: Exercise[]) {
		this.exerciseArr.set(exercisesArr);
		this.totalExercises.set(exercisesArr.length); // Sets the exercises count

		init.initializeLessonParams(this.mistakesCounter, this.lessonExp);

		this.setUpNextExercise();
	}
	/**
	 * Sets up the data and parameters for the next exercise in the lesson
	 */
	setUpNextExercise() {
		// Retrieves the next exercise from the array
		const curExercise: Exercise | null = this.exerciseArr().length
			? util.exerciseArrShift(this.exerciseArr)
			: null;

		if (curExercise) {
			// Sets the data in the exerciseData signal
			this.exerciseData.set(curExercise);

			this.runInitializers();
		}
		// If the exercise array is empty, display the results screen
		else {
			this.postResult().subscribe();
			this.endLesson();
		}
	}

	/**
	 * Prepares the signal values for the results screen at the end of a lesson
	 */
	endLesson() {
		this.headingText.set(`Lesson finished`);
		this.isLessonOver.set(true);
		this.isExerciseDone.set(true);
		this.lessonLanguage.set(Language.NOT_SELECTED);
	}

	/**
	 * Resets the fields and states, and runs the relevant initializer functions
	 */
	runInitializers() {
		// Resets the states of all exercise-data related signals
		this.isExerciseDone.set(false);
		this.isCorrectAnswer.set(false);
		this.hintText.set('');
		// Signals the child components to initialize their input fields
		this.onExerciseSwitch.next(true);

		// Exercise-specific initializations

		if (this.exerciseData().type === ExerciseType.MatchTheWords) {
			init.initializeMatchTheWords(this.matchResults, this.penalties, this.exerciseData);
		}

		if (this.exerciseData().type === ExerciseType.MatchTheCategory) {
			init.initializeMatchTheCategory(this.categoryMatches, this.exerciseData);
		}

		if (this.exerciseData().type === ExerciseType.ReorderSentence) {
			this.chosenWords.set([]);
		}

		// Normalizes the exercise's strings for easier comparison
		util.lowerCaseAndNormalizeAll(this.exerciseData);

		// Sets the current exercise's heading string
		this.headingText.set(this.exerciseData().heading ?? '');
	}

	/**
	 * Marks the current exercise as "done", sets the result,
	 * updates the number of correct answers in the lesson, and adds XP
	 * if the answer was correct
	 * @param status exercise result - true means "correct", false means "incorrect"
	 */
	setExerciseResult(status: boolean) {
		this.isExerciseDone.set(true);
		this.isCorrectAnswer.set(status);

		if (status) {
			this.headingText.set(`Correct!`);

			// Updates the exp counters for a correct answer
			this.addExp();
		} else {
			this.headingText.set(`Incorrect.`);
			this.mistakesCounter.update((val) => val + 1);
		}
	}

	/**
	 * Updates the hint text string using a word from the exercise's answer at the cost of some exp
	 */
	displayHint() {
		this.hintText.update((text) => {
			const curHintWords = text.split(' '); // Create a Set of current words in the hint text
			const answerWords = this.exerciseData().answer?.split(' '); // Split answer into individual words

			// Find the first word in the answer that isn't already in the hint text
			const nextWord = answerWords?.find((word) => !curHintWords.includes(word));

			// If a new word is found, add it to the text
			if (nextWord) {
				text += ' ' + nextWord;
			}
			return text;
		});

		this.penalties.update((value) => value + 1);
	}
	/**
	 *  Adds a specific amount of xp (based on a const's value) is added to the totalExp counter.
	 *  If the current the mistakes counter is not zero,
	 *  the user gets a penalty to his exp reward based on the amount of mistakes.
	 */
	addExp() {
		// Sets the exp reward based on the current exercise type
		let expAmount: number;
    const currentExercise: ExerciseType = this.exerciseData().type;

      switch (currentExercise) {
        case ExerciseType.ChooseTheTense:
          expAmount = RewardVals.easyExercise;
          break;
        case ExerciseType.TranslateTheSentence:
        case ExerciseType.MatchTheCategory:
          expAmount = RewardVals.hardExercise;
          break;
        default:
          expAmount = RewardVals.exercise;
      }

		// Deducts exp from the final reward sum based on mistakes or hints used
		const expAfterPenalties = Math.max(0, expAmount - this.penalties() * 10);

		this.lessonExp.set(this.lessonExp() + expAfterPenalties);
		this.totalExp.set(this.totalExp() + expAfterPenalties);
	}

	/**
	 * Saves the lesson result to the database
	 */
	postResult() {
		const email = this.authService.userData().email;
		const { href } = new URL(`profile/postResult`, this.apiUrl);

		return this.http.post(href, {
			exp: this.lessonExp(),
			email: email,
			numberOfQuestions: this.totalExercises(),
			mistakes: this.mistakesCounter(),
			language: this.lessonLanguage(),
		});
	}
}

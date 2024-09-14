import {ComponentFixture, TestBed} from '@angular/core/testing';
import {LearnComponent} from './learn.component';
import {of} from 'rxjs';
import {LearnService} from "./learn.service";
import {LessonGeneratorService} from "./lesson-generator.service";
import {Exercise} from "../../core/interfaces/exercise.interface";
import {Language} from "../../core/enums/language.enum";
import {Difficulty} from "../../core/enums/difficulty.enum";
import {ResultsScreenComponent} from "./results-screen/results-screen.component";
import {ExerciseType} from "../../core/enums/exercise-type.enum";
import {computed, signal, WritableSignal} from "@angular/core";
import {TranslateWordComponent} from "./translate-word/translate-word.component";
import {Language as ILanguage} from "../my-profile/components/profile-languages/language.interface";

class MockLessonGeneratorService {
  generateLesson = jest.fn();
}

class MockLearnService {
  isExerciseDone: WritableSignal<boolean> = signal<boolean>(false);
  isLessonOver: WritableSignal<boolean> = signal<boolean>(false);
  exerciseData = signal<Exercise>({
    type: ExerciseType.TranslateWord,
    heading: '',
    instructions: '',
    question: '',
    choices: [""],
    correctPairs: [],
    randomizedPairs: [],
    answer: '',
    translation: ''
  });
  lessonLanguage: WritableSignal<Language> = signal<Language>(Language.English);
  lessonLanguageRank = jest.fn();
  setUpLesson = jest.fn();
}

describe('LearnComponent', () => {
  let lrnComp: LearnComponent;
  let fixture: ComponentFixture<LearnComponent>;

  let mockLgService: MockLessonGeneratorService;
  let mockLearnService: MockLearnService;

  beforeEach(() => {
    mockLgService = new MockLessonGeneratorService();
    mockLearnService = new MockLearnService();

    TestBed.configureTestingModule({
      providers: [
        LearnComponent,
        { provide: LessonGeneratorService, useValue: mockLgService },
        { provide: LearnService, useValue: mockLearnService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LearnComponent);
    lrnComp = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(lrnComp).toBeTruthy();
  });

  it('should call generateLesson on initialization and handle the response', () => {
    const LESSON_AMOUNT = 2;
    const mockExercises: Exercise[] = [
      {
        type: ExerciseType.TranslateTheSentence,
        question: "קוראים לי דני",
        answer: "My name is Danny"
      },
      {
        type: ExerciseType.TranslateTheSentence,
        question: "הוא אוכל תפוח",
        answer: "He is eating an apple"
      }
    ];

    jest.spyOn(mockLearnService,'lessonLanguageRank').mockReturnValue("Advanced");
    // Mock the generateLesson method to return an observable
    mockLgService.generateLesson.mockReturnValue(of(mockExercises));

    // Call the callGenerator method
    lrnComp.callGenerator(Language.English);

    // Check that generateLesson is called with correct arguments
    expect(mockLgService.generateLesson).toHaveBeenCalledWith(Language.English, Difficulty.Advanced, lrnComp.EXERCISE_AMOUNT);

    // Check that setUpLesson is called with the mock exercises
    expect(mockLearnService.setUpLesson).toHaveBeenCalledWith(mockExercises);
  });

  it('should return the correct component based on current exercise type', () => {
    // Checks if the returned currentComponent matches the exercise type in exerciseData
    const currentComponent = lrnComp.currentExercise;
    expect(currentComponent).toBe(TranslateWordComponent);

    lrnComp.isLessonOver.set(true);

    // Checks if the returned currentComponent is ResultsScreenComponent once a lesson is over
    const currentComponentAfterLesson = lrnComp.currentExercise;
    expect(currentComponentAfterLesson).toBe(ResultsScreenComponent);
  });

});

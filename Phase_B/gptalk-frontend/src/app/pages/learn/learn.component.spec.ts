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
import {signal, WritableSignal} from "@angular/core";
import {TranslateWordComponent} from "./translate-word/translate-word.component";

class MockLessonGeneratorService {
  generateLesson = jest.fn();
}

class MockLearnService {
  isDone: WritableSignal<boolean> = signal<boolean>(false);
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
  lessonLanguage = { set: jest.fn() };
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

    jest.spyOn(lrnComp['lgService'], 'generateLesson').mockImplementation(() => {
      return of(mockExercises);
    });

    jest.spyOn(lrnComp['lrn'], 'setUpLesson').mockImplementation(() => {
      return;
    })

    lrnComp.ngOnInit();

    expect(lrnComp['lgService'].generateLesson).toHaveBeenCalledWith(Language.Hebrew, Difficulty.Expert, LESSON_AMOUNT);
    expect(lrnComp['lrn'].setUpLesson).toHaveBeenCalledWith(mockExercises);
  });

  it('should return the correct component based on current exercise type', () => {
    const currentComponent = lrnComp.currentExercise;
    expect(currentComponent).toBe(TranslateWordComponent);

    lrnComp.isLessonOver.set(true);

    const currentComponentAfterLesson = lrnComp.currentExercise;
    expect(currentComponentAfterLesson).toBe(ResultsScreenComponent);
  });
});

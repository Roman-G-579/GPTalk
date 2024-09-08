import {TestBed} from '@angular/core/testing';
import {LearnService} from './learn.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {Exercise} from "../../core/interfaces/exercise.interface";
import {ExerciseType} from "../../core/enums/exercise-type.enum";
import {AuthService} from "../../core/services/auth.service";
import {LearnInitializerUtils} from "./utils/learn-initializer.utils";
import {MiscUtils} from "../../core/utils/misc.utils";
import {RewardVals} from "../../core/enums/exp-vals.enum";
import {signal} from "@angular/core";
import {UserResponse} from "../../core/interfaces/user-response.interface";
import {environment} from "../../../environments/environment";
import {of} from "rxjs";
import {Language} from "../../core/enums/language.enum";

class MockAuthService {
  totalExp = signal<number>(0);
  userData = signal<Omit<UserResponse, 'totalExp'>>({
    __v: 0,
    _id: '',
    createdAt: new Date(),
    email: 'test@example.com',
    firstName: '',
    lastName: '',
    username: '',
    userAvatar: '',
  });
}

jest.mock('./utils/learn-initializer.utils');
jest.mock('../../core/utils/misc.utils');

// Mock setup for exercises
const mockExercises: Exercise[] = [
  {
    type: ExerciseType.FillInTheBlank,
  },
  {
    type: ExerciseType.TranslateTheSentence,
  },
  {
    type: ExerciseType.CompleteTheConversation,
  }
];

describe('LearnService', () => {
  let learnService: LearnService;
  let mockAuthService: MockAuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    mockAuthService = new MockAuthService();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        LearnService,
        { provide: AuthService, useValue: mockAuthService },
      ]
    });

    learnService = TestBed.inject(LearnService);
    httpMock = TestBed.inject(HttpTestingController);

  });

  afterEach(() => {
    jest.clearAllMocks();

    httpMock.verify(); // Verifies that no unmatched requests are outstanding

  });

  it('should create the service', () => {
    expect(learnService).toBeTruthy();
  });

  describe('setUpLesson', () => {
    it('should set up the lesson correctly when setUpLesson is called', () => {
      const initializeLessonParamsSpy = jest.spyOn(LearnInitializerUtils, 'initializeLessonParams');

      jest.spyOn(learnService, 'setUpNextExercise').mockImplementation(() => {
        return;
      });

      learnService.setUpLesson(mockExercises);

      expect(learnService.exerciseArr()).toEqual(mockExercises);
      expect(learnService.totalExercises()).toBe(mockExercises.length);

      expect(initializeLessonParamsSpy).toHaveBeenCalledWith(
        learnService.mistakesCounter,
        learnService.lessonExp
      );
    });
  });

  describe('runInitializers', () => {
    it('should run initializers correctly when runInitializers is called', () => {
      // Mock exercise data and exercise type
      jest.spyOn(learnService, 'exerciseData').mockReturnValue({ type: ExerciseType.MatchTheWords, heading: 'Test Heading' });

      // Spy on initialization functions and utility functions
      const initializeMatchTheWordsSpy = jest.spyOn(LearnInitializerUtils, 'initializeMatchTheWords');
      const initializeMatchTheCategorySpy = jest.spyOn(LearnInitializerUtils, 'initializeMatchTheCategory');
      const lowerCaseAndNormalizeAllSpy = jest.spyOn(MiscUtils, 'lowerCaseAndNormalizeAll');

      learnService.runInitializers();

      expect(initializeMatchTheWordsSpy).toHaveBeenCalledWith(
        learnService.matchResults,
        learnService.penalties,
        learnService.exerciseData
      );
      expect(initializeMatchTheCategorySpy).not.toHaveBeenCalled();

      // Verify the utility function is called to normalize strings
      expect(lowerCaseAndNormalizeAllSpy).toHaveBeenCalledWith(learnService.exerciseData);
    });

    it('should call initializeMatchTheCategory when exercise type is MatchTheCategory', () => {
      // Mock exercise data to have type MatchTheCategory
      jest.spyOn(learnService, 'exerciseData').mockReturnValue({ type: ExerciseType.MatchTheCategory });

      const initializeMatchTheCategorySpy = jest.spyOn(LearnInitializerUtils, 'initializeMatchTheCategory');

      learnService.runInitializers();

      // Verify that initializeMatchTheCategory was called
      expect(initializeMatchTheCategorySpy).toHaveBeenCalledWith(learnService.categoryMatches, learnService.exerciseData);
    });
  });

  describe('setUpNextExercise', () => {
    it('should set the next exercise and call runInitializers when exercises are available', () => {
      const firstExerciseInArray =   mockExercises[0]; // Sample exercise data
      jest.spyOn(learnService, 'exerciseArr').mockReturnValue(mockExercises);
      const exerciseArrShiftSpy = jest.spyOn(MiscUtils, 'exerciseArrShift').mockReturnValue(firstExerciseInArray); // Mock the utility function
      const runInitializersSpy = jest.spyOn(learnService, 'runInitializers');

      learnService.setUpNextExercise();

      expect(exerciseArrShiftSpy).toHaveBeenCalledWith(learnService.exerciseArr);
      expect(learnService.exerciseData()).toEqual(firstExerciseInArray);
      expect(runInitializersSpy).toHaveBeenCalled();
    });

    it('should call postResult and displayResultsScreen when no exercises are available', () => {
      jest.spyOn(learnService, 'exerciseArr').mockReturnValue([]); // Mock empty exercise array

      // Mock postResult returning an observable
      const postResultSpy = jest.spyOn(learnService, 'postResult').mockReturnValue(of({}));
      const displayResultsScreenSpy = jest.spyOn(learnService, 'endLesson');

      learnService.setUpNextExercise();

      expect(postResultSpy).toHaveBeenCalled();
      expect(displayResultsScreenSpy).toHaveBeenCalled();
    });
  });

  describe('setExerciseResult', () => {
    it('should mark the exercise as done and correct when status is true', () => {
      jest.spyOn(learnService, 'addExp');

      learnService.setExerciseResult(true);

      expect(learnService.isDone()).toBe(true);
      expect(learnService.isCorrectAnswer()).toBe(true);
      expect(learnService.headingText()).toBe('Correct!');

      expect(learnService.addExp).toHaveBeenCalled();
    });

    it('should mark the exercise as done and incorrect when status is false', () => {
      const initialMistakes = learnService.mistakesCounter();

      learnService.setExerciseResult(false);

      expect(learnService.isDone()).toBe(true);
      expect(learnService.isCorrectAnswer()).toBe(false);
      expect(learnService.headingText()).toBe('Incorrect.');

      expect(learnService.mistakesCounter()).toBe(initialMistakes + 1);
    });
  });

  describe('addExp', () => {
    it('should correctly calculate and add experience points when there are no mistakes', () => {
      // Initialize the lessonExp and totalExp to be zero
      learnService.lessonExp.set(0);
      learnService.totalExp.set(0);
      learnService.penalties.set(0);

      learnService.addExp();

      // Check if values of lessonExp and totalExp are equal to the amount of added exp
      expect(learnService.lessonExp()).toBe(RewardVals.exercise);
      expect(learnService.totalExp()).toBe(RewardVals.exercise);
    });

    it('should correctly calculate and add experience points with mistakes', () => {
      learnService.lessonExp.set(0);
      learnService.totalExp.set(0);
      learnService.penalties.set(2);

      const expectedExp = Math.max(0, RewardVals.exercise - 2 * 10);

      learnService.addExp();

      // Check if experience points are added correctly with a penalty
      expect(learnService.lessonExp()).toBe(expectedExp);
      expect(learnService.totalExp()).toBe(expectedExp);
    });

    it('should not add negative experience points', () => {
      learnService.lessonExp.set(0);
      learnService.totalExp.set(0);
      learnService.penalties.set(20); // Assume many mistakes leading to negative exp

      learnService.addExp();

      // Check if experience points are not negative
      expect(learnService.lessonExp()).toBe(0);
      expect(learnService.totalExp()).toBe(0);
    });
  });

  describe('postResult', () => {
    it('should post lesson result to the database', () => {
      const email = 'test@example.com'; // Mock email

      // Mock lesson results
      const lessonExp = 50;
      const totalExercises = 10;
      const mistakesCounter = 2;
      const language = Language.English;

      const expectedUrl = `${environment.apiUrl}profile/postResult`;

      learnService.lessonExp.set(lessonExp);
      learnService.totalExercises.set(totalExercises);
      learnService.mistakesCounter.set(mistakesCounter);
      learnService.lessonLanguage.set(language);

      learnService.postResult().subscribe();

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('POST');
      //TODO: handle language related nonesense
      expect(req.request.body).toEqual({
        exp: lessonExp,
        email: email,
        numberOfQuestions: totalExercises,
        mistakes: mistakesCounter,
        language: language
      });

      // Flush the mock HTTP response to ensure the request completes
      req.flush({});
    });
  });
});

import {signal} from "@angular/core";
import {Exercise} from "../../../core/interfaces/exercise.interface";
import {ExerciseType} from "../../../core/enums/exercise-type.enum";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {LearnService} from "../learn.service";
import {MatchTheWordsComponent} from "./match-the-words.component";

class MockLearnService {
  isExerciseDone = signal<boolean>(false);

  exerciseData = signal<Exercise>({
    type: ExerciseType.FillInTheBlank,
    heading: '',
    instructions: '',
    question: '',
    choices: [],
    correctPairs: [],
    randomizedPairs: [],
    answer: '',
    translation: ''
  });

  matchResults = signal<[boolean,boolean][]>([]);
  chosenPair = signal<[string, string]>(["",""]);
  penalties = signal<number>(0);

  setExerciseResult = jest.fn();
}

describe('MatchTheWordsComponent', () => {
  let mtwComp: MatchTheWordsComponent;
  let fixture: ComponentFixture<MatchTheWordsComponent>;

  let mockLearnService: MockLearnService;

  beforeEach(async () => {
    mockLearnService = new MockLearnService();

    await TestBed.configureTestingModule({
      providers: [
        {provide: LearnService, useValue: mockLearnService},
      ]
    }).compileComponents();

    // Creates a fixture and gets the component instance
    fixture = TestBed.createComponent(MatchTheWordsComponent);
    mtwComp = fixture.componentInstance;
  });

  it('should initialize with data from LearnService', () => {
    expect(mtwComp.exerciseData()).toEqual(mockLearnService.exerciseData());
    expect(mtwComp.isExerciseDone()).toBe(false);
  });

  it('should choose a match correctly', () => {
    mtwComp.chooseMatch('טסט', 0);
    expect(mockLearnService.chosenPair()).toEqual(['טסט', '']);
  });

  it('should call verifyMatch if two words have been chosen', () => {

    // Mocks the verification of a word match
    const verifyMatchMock = jest.spyOn(
      mtwComp['vrf'],
      'verifyMatch').mockImplementation((): "matchFound" => {
      return "matchFound";
    });

    mtwComp.chooseMatch('טסט', 0);
    mtwComp.chooseMatch('test', 1);

    expect(verifyMatchMock).toHaveBeenCalledWith(
      mockLearnService.chosenPair,
      mockLearnService.matchResults,
      mockLearnService.exerciseData
    );
  });

  it('should set exercise result if all matches are found', () => {
    // Mocks the verification of a word match
    jest.spyOn(mtwComp['vrf'],'verifyMatch').mockImplementation((): "allMatchesFound" => {
        return "allMatchesFound";
    });

    mtwComp.chooseMatch('טסט', 0);
    mtwComp.chooseMatch('test', 1);

    expect(mockLearnService.setExerciseResult).toHaveBeenCalledWith(true);
    expect(mockLearnService.chosenPair()).toEqual(['', '']);
  });

  it('should increment penalty counter on wrong match', () => {
    // Mocks the verification of a word match
    jest.spyOn(mtwComp['vrf'],'verifyMatch').mockImplementation((): "wrongMatch" => {
      return "wrongMatch";
    });
    mtwComp.chooseMatch('leftWord', 0);
    mtwComp.chooseMatch('rightWord', 1);

    expect(mockLearnService.penalties()).toBe(1);
    expect(mockLearnService.chosenPair()).toEqual(['', '']);
  });
});

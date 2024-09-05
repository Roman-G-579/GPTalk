import {signal} from "@angular/core";
import {Exercise} from "../../../core/interfaces/exercise.interface";
import {ExerciseType} from "../../../core/enums/exercise-type.enum";
import {MatchTheCategoryComponent} from "./match-the-category.component";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {LearnService} from "../learn.service";

class MockLearnService {
  isDone = signal<boolean>(false);

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

  draggedWord = signal<string>("");
  categoryMatches = signal<{wordBank: string[], cat1: string[], cat2: string[]}>({
    wordBank: [],
    cat1: [],
    cat2: []
  });

}

describe('MatchTheCategoryComponent', () => {
  let mtgComp: MatchTheCategoryComponent;
  let fixture: ComponentFixture<MatchTheCategoryComponent>;

  let mockLearnService: MockLearnService;

  beforeEach(async () => {
    mockLearnService = new MockLearnService();

    await TestBed.configureTestingModule({
      providers: [
        {provide: LearnService, useValue: mockLearnService},
      ]
    }).compileComponents();

    // Creates a fixture and gets the component instance
    fixture = TestBed.createComponent(MatchTheCategoryComponent);
    mtgComp = fixture.componentInstance;
  });

  it('should initialize with data from LearnService', () => {
    expect(mtgComp.exerciseData()).toEqual(mockLearnService.exerciseData());
    expect(mtgComp.isDone()).toBe(false);
  });

  it('should set draggedWord on dragStart', () => {
    mtgComp.dragStart('word1');
    expect(mockLearnService.draggedWord()).toBe('word1');
  });

  it('should clear draggedWord on dragEnd', () => {
    mockLearnService.draggedWord.set('word1');
    mtgComp.dragEnd();
    expect(mockLearnService.draggedWord()).toBe('');
  });

  it('should correctly handle drop to category 1', () => {
    mockLearnService.draggedWord.set('word1');
    mtgComp.drop(0);

    const { cat1, cat2, wordBank } = mockLearnService.categoryMatches();
    expect(cat1).toContain('word1');
    expect(cat2).not.toContain('word1');
    expect(wordBank).not.toContain('word1');
  });

  it('should correctly handle drop to category 2', () => {
    mockLearnService.draggedWord.set('word2');
    mtgComp.drop(1);

    const { cat1, cat2, wordBank } = mockLearnService.categoryMatches();
    expect(cat2).toContain('word2');
    expect(cat1).not.toContain('word2');
    expect(wordBank).not.toContain('word2');
  });

  it('should not perform drop if no word is dragged', () => {
    // Drop is called, but no word is currently found in draggedWord
    mtgComp.drop(0);

    // Both categories are expected to stay empty since there is no word to be dropped
    expect(mockLearnService.categoryMatches().cat1).toEqual([]);
    expect(mockLearnService.categoryMatches().cat2).toEqual([]);
  });

});

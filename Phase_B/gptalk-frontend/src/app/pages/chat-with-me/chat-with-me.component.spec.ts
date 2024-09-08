import {ChatWithMeComponent} from "./chat-with-me.component";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {ChatWithMeService} from "./chat-with-me.service";
import {ToastrService} from "ngx-toastr";
import {Router} from "@angular/router";
import {of, throwError} from "rxjs";
import {Language} from "../../core/enums/language.enum";
import {Confirmation, ConfirmationService} from "primeng/api";

class MockChatWithMeService {
  chat = jest.fn();
  grade = jest.fn();
}

class MockToastrService {
  error = jest.fn();
}

class MockRouter {
  navigateByUrl = jest.fn();  // Mock the navigate method
}

describe('ChatWithMeComponent', () => {
  let chatComp: ChatWithMeComponent;
  let fixture: ComponentFixture<ChatWithMeComponent>;

  let mockChatWithMeService: MockChatWithMeService;
  let mockToastrService: MockToastrService;
  let mockRouter: MockRouter;

  beforeEach(async () => {
    mockChatWithMeService = new MockChatWithMeService();
    mockToastrService = new MockToastrService();
    mockRouter = new MockRouter();

    await TestBed.configureTestingModule({
      providers: [
        {provide: ChatWithMeService, useValue: mockChatWithMeService},
        {provide: ToastrService, useValue: mockToastrService},
        {provide: Router, useValue: mockRouter},
      ]
    }).compileComponents();

    // Creates a fixture and gets the component instance
    fixture = TestBed.createComponent(ChatWithMeComponent);
    chatComp = fixture.componentInstance;
  });

  function setInitialPrompt() {
    chatComp.textContent = 'Hello';
    chatComp.language.set(Language.English);
    chatComp.conversation.set([]);
  }

  it('should add user message to conversation and call chat service', () => {
    setInitialPrompt();

    const mockResponse = { feedback: 'Good', followUpQuestion: 'Do you want to continue?' };
    mockChatWithMeService.chat.mockReturnValue(of(mockResponse));

    chatComp.chat();

    expect(mockChatWithMeService.chat).toHaveBeenCalledWith('Hello', Language.English, [{ role: 'user', content: 'Hello' }]);

    //TODO: address the extra space at the end of followUpQuestion in mockResponse
    const updatedConversation = chatComp.conversation().map((item) => ({
      ...item,
      content: item.content.trim(),
    }));

    expect(updatedConversation).toEqual([
      { role: 'user', content: 'Hello' },
      { role: 'system', content: 'Good.\nDo you want to continue?' }
    ]);

    // User input value resets after receiving a response
    expect(chatComp.textContent).toBe('');
  });

  it('should handle error during chat', () => {
    setInitialPrompt();

    mockChatWithMeService.chat.mockReturnValue(throwError(() => new Error('Chat error')));

    chatComp.chat();

    expect(mockChatWithMeService.chat).toHaveBeenCalledWith('Hello', Language.English, [{ role: 'user', content: 'Hello' }]);

    // Check that the ToastrService displays the correct error message
    expect(mockToastrService.error).toHaveBeenCalledWith('Chat error occured!', 'Error!');
  });

  it('should handle grading and open dialog', () => {
    const mockGrade = { grade: 80 };

    chatComp.language.set(Language.English);
    chatComp.conversation.set([{ role: 'user', content: 'Hello' }]);

    mockChatWithMeService.grade.mockReturnValue(of(mockGrade));

    // Mocks the acceptance of a confirm dialog
    const confirmDialogMock = jest.spyOn(
      chatComp['confirmationService'],
      'confirm'
    ).mockImplementation(((options: Confirmation) => {
      if (options.accept) {
        options.accept();
      }
      return chatComp['confirmationService'];
    }) as (confirmation: Confirmation) => ConfirmationService);

    chatComp.grade();

    expect(mockChatWithMeService.grade).toHaveBeenCalledWith(Language.English, [{ role: 'user', content: 'Hello' }]);

    // The confirmation dialog needs to be created after calling the openDialog function in chatWithMeService.grade
    expect(confirmDialogMock).toHaveBeenCalledWith({
      header: 'Session Grade',
      message: 'Your grade is: 80! Good Job!',
      accept: expect.any(Function),
      reject: expect.any(Function)
    });
  });

  it('should handle error during grading', () => {
    chatComp.conversation.set([{ role: 'user', content: 'Hello' }]);
    chatComp.language.set(Language.English);

    mockChatWithMeService.grade.mockReturnValue(throwError(() => new Error('Grading error')));

    chatComp.grade();

    expect(mockChatWithMeService.grade).toHaveBeenCalledWith(Language.English, [{ role: 'user', content: 'Hello' }]);
    expect(mockToastrService.error).toHaveBeenCalledWith('Error occured!', 'Error!');
  });

  it('should open dialog with correct grade and navigate home on reject', () => {
    const mockGrade = { grade: 60 };

    // Mocks the rejection of a confirm dialog
    const confirmDialogMock = jest.spyOn(
      chatComp['confirmationService'],
      'confirm'
    ).mockImplementation(((options: Confirmation) => {
      if (options.reject) {
        options.reject();
      }
      return chatComp['confirmationService'];
    }) as (confirmation: Confirmation) => ConfirmationService);

    chatComp.openDialog(mockGrade);

    // The confirmation dialog needs to match the mockGrade value
    expect(confirmDialogMock).toHaveBeenCalledWith({
      header: 'Session Grade',
      message: 'Your grade is: 60! Better luck next time!',
      accept: expect.any(Function),
      reject: expect.any(Function)
    });

    // After 'reject' is selected in the dialog, should navigate home
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('pages/home');
  });

  it('should set language correctly', () => {
    chatComp.setLanguage(Language.Hebrew);
    expect(chatComp.language()).toBe(Language.Hebrew);
  });

  it('should set empty language and clear conversation on accept in dialog', () => {
    const mockGrade = { grade: 80 };

    // Mocks the acceptance of a confirm dialog
    jest.spyOn(
      chatComp['confirmationService'],
      'confirm'
    ).mockImplementation(((options: Confirmation) => {
      if (options.accept) {
        options.accept();
      }
      return chatComp['confirmationService'];
    }) as (confirmation: Confirmation) => ConfirmationService);
    chatComp.openDialog(mockGrade);

    expect(chatComp.language()).toBe(Language.NOT_SELECTED);
    expect(chatComp.conversation()).toEqual([]);
  });
});

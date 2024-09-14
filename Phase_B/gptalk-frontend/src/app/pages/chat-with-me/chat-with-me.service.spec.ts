import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ChatWithMeService } from './chat-with-me.service';
import {Language} from "../../core/enums/language.enum";
import {Chat} from "./interfaces/chat.interface";
import {environment} from "../../../environments/environment";
import {Grade} from "./interfaces/grade.interface"; // Update with the actual path of your service

describe('ChatWithMeService', () => {
  let chatWithMeService: ChatWithMeService;
  let httpMock: HttpTestingController;

  // Preset parameters used across all tests
  const language = Language.English;
  const conversation: Chat[] = [
    { role: 'user', content: 'Hello' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ChatWithMeService],
    });

    chatWithMeService = TestBed.inject(ChatWithMeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('chat', () => {
    it('should send a POST request to chat API endpoint', () => {
      const mockChatResponse = { feedback: 'Good', followUpQuestion: 'Do you want to continue?' };

      const userPrompt = 'Hello!';

      chatWithMeService.chat(userPrompt, language, conversation).subscribe((response) => {
        expect(response).toEqual(mockChatResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}chat-with-me/chat`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ userPrompt, language, conversation });

      // Simulate the backend response
      req.flush(mockChatResponse);
    });
  });

  describe('grade', () => {
    it('should send a POST request to grade API endpoint', () => {
      const mockGradeResponse = { grade: 80, expReward: 160, feedback: "mock feedback" };

      chatWithMeService.grade(language, conversation).subscribe((response) => {
        expect(response).toEqual(mockGradeResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}chat-with-me/grade`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ language, conversation });

      // Simulate the backend response
      req.flush(mockGradeResponse);
    });
  });
});

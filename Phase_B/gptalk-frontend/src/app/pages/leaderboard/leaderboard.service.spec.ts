import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LeaderboardService } from './leaderboard.service';
import { environment } from '../../../environments/environment';
import {LeadboardRow} from "./leaderboard.interface";

describe('LeaderboardService', () => {
  let service: LeaderboardService;
  let httpMock: HttpTestingController;

  const mockResponse = {
    top3Users: [
      {
        userId: '1',
        username: 'user1',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: '2023-09-01T12:00:00Z',
        totalExp: 100,
      } as LeadboardRow,
      {
        userId: '2',
        username: 'user2',
        firstName: 'Jane',
        lastName: 'Smith',
        createdAt: '2023-08-15T15:30:00Z',
        totalExp: 90,
      } as LeadboardRow,
      {
        userId: '3',
        username: 'user3',
        firstName: 'Alice',
        lastName: 'Johnson',
        createdAt: '2023-07-20T09:45:00Z',
        totalExp: 80,
      } as LeadboardRow,
    ],
    top4To10Users: [
      {
        userId: '4',
        username: 'user4',
        firstName: 'Bob',
        lastName: 'Brown',
        createdAt: '2023-06-10T10:15:00Z',
        totalExp: 70,
      } as LeadboardRow,
      {
        userId: '5',
        username: 'user5',
        firstName: 'Charlie',
        lastName: 'Davis',
        createdAt: '2023-05-05T08:25:00Z',
        totalExp: 60,
      } as LeadboardRow,
    ]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LeaderboardService]
    });

    service = TestBed.inject(LeaderboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verifies that no unmatched requests are outstanding
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call the correct URL to get leaderboard data', () => {
    // Simulates a call to the getLeaderboard method
    // and checks that a value is returned
    service.getLeaderboard().subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}leaderboard`);
    expect(req.request.method).toBe('GET');

    req.flush(mockResponse);
  });

  it('should return the top 3 users and top 4 to 10 users in the leaderboard', () => {
    service.getLeaderboard().subscribe(response => {
      expect(response.top3Users.length).toBe(3);
      expect(response.top3Users).toEqual(mockResponse.top3Users);

      expect(response.top4To10Users.length).toBe(2); // Adjust according to the mock data
      expect(response.top4To10Users).toEqual(mockResponse.top4To10Users);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}leaderboard`);
    req.flush(mockResponse);
  });
});

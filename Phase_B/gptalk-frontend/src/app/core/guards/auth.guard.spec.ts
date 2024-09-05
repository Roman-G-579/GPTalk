import { AuthGuard } from './auth.guard';
import { Router } from '@angular/router';
import {Observable, of, throwError} from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {AuthService} from "../services/auth.service";

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceMock: jest.Mocked<AuthService>;
  let routerMock: jest.Mocked<Router>;
  const routeMock: ActivatedRouteSnapshot = {} as never;
  const stateMock: RouterStateSnapshot = {} as never;

  beforeEach(() => {
    authServiceMock = {
      fetchUserData: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    routerMock = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    guard = TestBed.inject(AuthGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if token exists and fetchUserData succeeds', (done) => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('mockToken');
    authServiceMock.fetchUserData.mockReturnValue(of(true) as never);

    const result = guard.canActivate(routeMock, stateMock);

    if (result instanceof Observable) {
      result.subscribe((res) => {
        expect(res).toBe(true);
        expect(authServiceMock.fetchUserData).toHaveBeenCalledWith('mockToken');
        expect(routerMock.navigate).not.toHaveBeenCalled();
        done();
      });
    }
  });

  it('should return false and navigate to /login if token exists but fetchUserData fails', (done) => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('mockToken');
    authServiceMock.fetchUserData.mockReturnValue(throwError(() => new Error('Error')));

    const result = guard.canActivate(routeMock, stateMock);

    if (result instanceof Observable) {
      result.subscribe((res) => {
        expect(res).toBe(false);
        expect(authServiceMock.fetchUserData).toHaveBeenCalledWith('mockToken');
        expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
        done();
      });
    }
  });

  it('should return false and navigate to /login if no token exists', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

    const result = guard.canActivate(routeMock, stateMock);

    expect(result).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});

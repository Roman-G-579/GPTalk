import {LoginComponent} from "./login.component";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {AuthService} from "../core/services/auth.service";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {of, throwError} from "rxjs";

class MockAuthService {
  login = jest.fn();
}

class MockRouter {
  navigate = jest.fn();
}

class MockToastrService {
  success = jest.fn();
  error = jest.fn();
}

describe('LoginComponent', () => {
  let loginComponent: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: MockAuthService;
  let mockRouter: MockRouter;
  let mockToastrService: MockToastrService;
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    mockAuthService = new MockAuthService();
    mockRouter = new MockRouter();
    mockToastrService = new MockToastrService();
    formBuilder = new FormBuilder();

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ToastrService, useValue: mockToastrService }
      ]
    }).compileComponents();

    // Creates a fixture and gets the component instance
    fixture = TestBed.createComponent(LoginComponent);
    loginComponent = fixture.componentInstance;

    loginComponent.loginForm = formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    fixture.detectChanges();  // Trigger change detection
  });

  // Sets valid details for the login form
  function setValidForm() {
    loginComponent.loginForm.controls['email'].setValue('test@example.com');
    loginComponent.loginForm.controls['password'].setValue('password123');
  }

  // Sets invalid details for the login form
  function setInvalidForm() {
    loginComponent.loginForm.controls['email'].setValue('');
    loginComponent.loginForm.controls['password'].setValue('');
  }

  it('should create Login component', () => {
    expect(loginComponent).toBeTruthy();
  });

  it('should have an invalid form when empty', () => {
    expect(loginComponent.loginForm.valid).toBeFalsy();
  });

  it('should have a valid form when email and password are provided', () => {
    setValidForm();
    expect(loginComponent.loginForm.valid).toBeTruthy();
  });

  it('should call AuthService login on valid form submission', () => {
    setValidForm();

    // Mock the AuthService login method to return a successful response
    mockAuthService.login.mockReturnValue(of({ token: 'fake-token' }));

    loginComponent.login();

    // Assert that AuthService login was called with the correct arguments
    expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('should navigate to /pages on successful login', () => {
    setValidForm();

    // Mock the AuthService login method to return a successful response
    mockAuthService.login.mockReturnValue(of({ token: 'fake-token' }));

    loginComponent.login();

    // Assert that Router.navigate was called with the correct route
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/pages']);

    // Assert that ToastrService.success was called with the correct arguments
    expect(mockToastrService.success).toHaveBeenCalledWith('Logged in successfully', 'Success 🎉');
  });

  it('should display error message on login failure', () => {
    setValidForm();

    // Mock the AuthService login method to simulate a login failure
    mockAuthService.login.mockReturnValue(throwError(() => new Error('Login failed')));

    loginComponent.login();

    // Assert that the error message is set correctly in the component
    expect(loginComponent.errorMessage).toBe('Invalid email or password');

    // Assert that ToastrService.error was called with the correct arguments
    expect(mockToastrService.error).toHaveBeenCalledWith('Could not login', 'Error!');
  });

  it('should not call AuthService login if the form is invalid', () => {
    setInvalidForm();

    loginComponent.login();

    // Assert that AuthService.login was not called
    expect(mockAuthService.login).not.toHaveBeenCalled();
  });
})

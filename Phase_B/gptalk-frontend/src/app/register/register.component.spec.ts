import {RegisterComponent} from "./register.component";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {ReactiveFormsModule} from "@angular/forms";
import {RegisterService} from "./register.service";
import {ToastrService} from "ngx-toastr";
import {of, throwError} from "rxjs";

class MockRegisterService {
  registerUser = jest.fn();
}

class MockToastrService {
  success = jest.fn();
  error = jest.fn();
}

describe('RegisterComponent', () => {
  let regComp: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  let mockRegisterService: MockRegisterService;
  let mockToastrService: MockToastrService;

  beforeEach(async () => {
    mockRegisterService = new MockRegisterService();
    mockToastrService = new MockToastrService();

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        {provide: RegisterService, useValue: mockRegisterService},
        {provide: ToastrService, useValue: mockToastrService},
      ]
    }).compileComponents();

    // Creates a fixture and gets the component instance
    fixture = TestBed.createComponent(RegisterComponent);
    regComp = fixture.componentInstance;
  });

  // Sets valid form details
  function setValidForm() {
    regComp.registerForm.setValue({
      fullName: {firstName: 'John', lastName: 'Doe'},
      usernameAndEmail: {username: 'user123', email: 'test@example.com'},
      passwordAndConfirm: {password: 'Aa123456', confirmPassword: 'Aa123456'}
    });
  }

  // Sets form details with passwords that do not match
  function setFormWithInvalidPassword() {
    regComp.registerForm.setValue({
      fullName: {firstName: 'John', lastName: 'Doe'},
      usernameAndEmail: {username: 'user123', email: 'test@example.com'},
      passwordAndConfirm: {password: 'Aa1234567', confirmPassword: 'Aa123456'}
    });
  }

  it('should create the component', () => {
    expect(regComp).toBeTruthy();
  });

  it('should invalidate empty first and last name fields in fullName form', () => {
    regComp.registerForm.controls.fullName.controls.firstName.setValue('');
    regComp.registerForm.controls.fullName.controls.lastName.setValue('');
    regComp.highlightIfInvalid(regComp.registerForm.controls.fullName);
    expect(regComp.registerForm.controls.fullName.controls.firstName.dirty).toBe(true);
    expect(regComp.registerForm.controls.fullName.controls.lastName.dirty).toBe(true);
  });

  it('should return true if the fullName form details are valid', () => {
    setValidForm();
    expect(regComp.isValid(regComp.registerForm.controls.fullName)).toBe(true);
  });

  it('should invalidate empty username and email fields in usernameAndEmail form', () => {
    regComp.registerForm.controls.usernameAndEmail.controls.username.setValue('');
    regComp.registerForm.controls.usernameAndEmail.controls.email.setValue('');
    regComp.highlightIfInvalid(regComp.registerForm.controls.usernameAndEmail);
    expect(regComp.registerForm.controls.usernameAndEmail.controls.username.dirty).toBe(true);
    expect(regComp.registerForm.controls.usernameAndEmail.controls.email.dirty).toBe(true);
  });

  it('should invalidate email field if email does not pass validation in usernameAndEmail form', () => {
    regComp.registerForm.controls.usernameAndEmail.controls.email.setValue('invalidEmail.com');
    regComp.highlightIfInvalid(regComp.registerForm.controls.usernameAndEmail);
    expect(regComp.registerForm.controls.usernameAndEmail.controls.email.dirty).toBe(true);
  });

  it('should return true if the usernameAndEmail form details are valid', () => {
    setValidForm();
    expect(regComp.isValid(regComp.registerForm.controls.usernameAndEmail)).toBe(true);
  });

  it(`should invalidate password if it's shorter than 6 characters in passwordAndConfirm form`, () => {
    regComp.registerForm.controls.passwordAndConfirm.controls.password.setValue('Aa345');
    regComp.highlightIfInvalid(regComp.registerForm.controls.passwordAndConfirm);
    expect(regComp.registerForm.controls.passwordAndConfirm.controls.password.dirty).toBe(true);
  });

  it(`should invalidate password if it's longer than 100 characters in passwordAndConfirm form`, () => {
    regComp.registerForm.controls.passwordAndConfirm.controls.password.setValue(
      'Aa345Aa345Aa345Aa345Aa345Aa345Aa345Aa345Aa345Aa345Aa' +
      '345Aa345Aa345Aa345Aa345Aa345Aa345Aa345Aa345Aa345Aa34' +
      '5Aa345Aa345Aa345Aa345Aa345Aa345Aa345Aa345Aa345Aa345Aa' +
      '345Aa345Aa345Aa345Aa345Aa345Aa345Aa345Aa345Aa345Aa345' +
      'Aa345Aa345Aa345Aa345Aa345Aa345Aa345Aa345');
    regComp.highlightIfInvalid(regComp.registerForm.controls.passwordAndConfirm);
    expect(regComp.registerForm.controls.passwordAndConfirm.controls.password.dirty).toBe(true);
  });

  it(`should invalidate password if it's missing a lowercase character in passwordAndConfirm form`, () => {
    regComp.registerForm.controls.passwordAndConfirm.controls.password.setValue('A123456');
    regComp.highlightIfInvalid(regComp.registerForm.controls.passwordAndConfirm);
    expect(regComp.registerForm.controls.passwordAndConfirm.controls.password.dirty).toBe(true);
  });

  it(`should invalidate password if it's missing an uppercase character in passwordAndConfirm form`, () => {
    regComp.registerForm.controls.passwordAndConfirm.controls.password.setValue('a123456');
    regComp.highlightIfInvalid(regComp.registerForm.controls.passwordAndConfirm);
    expect(regComp.registerForm.controls.passwordAndConfirm.controls.password.dirty).toBe(true);
  });

  it(`should invalidate password if it's missing a number in passwordAndConfirm form`, () => {
    regComp.registerForm.controls.passwordAndConfirm.controls.password.setValue('AabcdefGH');
    regComp.highlightIfInvalid(regComp.registerForm.controls.passwordAndConfirm);
    expect(regComp.registerForm.controls.passwordAndConfirm.controls.password.dirty).toBe(true);
  });

  it('should invalidate password if confirmation string does not match the password string in passwordAndConfirm form', () => {
    regComp.registerForm.controls.passwordAndConfirm.controls.password.setValue('Aa123456');
    regComp.registerForm.controls.passwordAndConfirm.controls.confirmPassword.setValue('Aa123457');
    regComp.highlightIfInvalid(regComp.registerForm.controls.passwordAndConfirm);
    expect(regComp.registerForm.controls.passwordAndConfirm.controls.confirmPassword.dirty).toBe(true);
  });

  it('should return true if the password and confirmation are valid ', () => {
    setValidForm();

    regComp.highlightIfInvalid(regComp.registerForm.controls.passwordAndConfirm);
    expect(regComp.registerForm.controls.passwordAndConfirm.controls.password.valid).toBe(true);
    expect(regComp.registerForm.controls.passwordAndConfirm.controls.confirmPassword.valid).toBe(true);
  });

  it('should not call registerUser function if password is invalid', () => {
    setFormWithInvalidPassword();

    // Checks password, preventing the call of registerUser if it is invalid
    regComp.submitPassword();
    expect(regComp.isValid(regComp.registerForm.controls.passwordAndConfirm)).toBe(false);

    expect(mockRegisterService.registerUser).not.toHaveBeenCalled();
  });

  it('should return successful response for registerUser function call if all form details are valid',  () => {
    setValidForm();

    // Mock the RegisterService login method to return a successful response
    mockRegisterService.registerUser.mockReturnValue(of({ token: 'fake-token' }));

    // Validate first and last name
    regComp.submitFullName();
    expect(regComp.isValid(regComp.registerForm.controls.fullName)).toBe(true);

    // Validate username and email
    regComp.submitUsernameAndEmail();
    expect(regComp.isValid(regComp.registerForm.controls.usernameAndEmail)).toBe(true);

    // Validate password
    regComp.submitPassword();
    expect(regComp.isValid(regComp.registerForm.controls.passwordAndConfirm)).toBe(true);

    // Assert that ToastrService.success was called with the correct arguments
    expect(mockToastrService.success).toHaveBeenCalledWith('Registration successful!', 'Success 🎉');
  });

  it('should display error message on register failure', async () => {
    setValidForm();

    // Mock the RegisterService register method to simulate a registration failure
    mockRegisterService.registerUser.mockReturnValue(throwError(() => new Error('Could not Register')));

    // Validate password
    regComp.submitPassword();

    expect(mockRegisterService.registerUser).toHaveBeenCalledWith(expect.any(Object));

    // Assert that ToastrService.error was called with the correct arguments
    expect(mockToastrService.error).toHaveBeenCalledWith("Registration failed", "Error!");
  });


  // TESTS RELATED TO CURRENT USER INPUT IN HTML ELEMENTS

  it('should set validator booleans to true if the input is valid', () => {
    regComp.registerForm.controls.passwordAndConfirm.controls.password.setValue('Password1');
    regComp.checkPasswordValidity();
    expect(regComp.validatorBooleans.hasLowerCase).toBe(true);
    expect(regComp.validatorBooleans.hasUpperCase).toBe(true);
    expect(regComp.validatorBooleans.hasNumber).toBe(true);
    expect(regComp.validatorBooleans.correctLength).toBe(true);
  });

  it('should set hasLowerCase validator boolean to false if the input does not contain lowerCase', () => {
    regComp.registerForm.controls.passwordAndConfirm.controls.password.setValue('PASSWORD1');
    regComp.checkPasswordValidity();
    expect(regComp.validatorBooleans.hasLowerCase).toBe(false);
    expect(regComp.validatorBooleans.hasUpperCase).toBe(true);
    expect(regComp.validatorBooleans.hasNumber).toBe(true);
    expect(regComp.validatorBooleans.correctLength).toBe(true);
  });

  it('should set hasUpperCase validator boolean to false if the input does not contain lowerCase', () => {
    regComp.registerForm.controls.passwordAndConfirm.controls.password.setValue('password1');
    regComp.checkPasswordValidity();
    expect(regComp.validatorBooleans.hasLowerCase).toBe(true);
    expect(regComp.validatorBooleans.hasUpperCase).toBe(false);
    expect(regComp.validatorBooleans.hasNumber).toBe(true);
    expect(regComp.validatorBooleans.correctLength).toBe(true);
  });

  it('should set hasNumber validator boolean to false if the input does not contain lowerCase', () => {
    regComp.registerForm.controls.passwordAndConfirm.controls.password.setValue('Password');
    regComp.checkPasswordValidity();
    expect(regComp.validatorBooleans.hasLowerCase).toBe(true);
    expect(regComp.validatorBooleans.hasUpperCase).toBe(true);
    expect(regComp.validatorBooleans.hasNumber).toBe(false);
    expect(regComp.validatorBooleans.correctLength).toBe(true);
  });

  it('should set correctLength validator boolean to false if the input does match the required length', () => {
    regComp.registerForm.controls.passwordAndConfirm.controls.password.setValue('Pwrd1');
    regComp.checkPasswordValidity();
    expect(regComp.validatorBooleans.hasLowerCase).toBe(true);
    expect(regComp.validatorBooleans.hasUpperCase).toBe(true);
    expect(regComp.validatorBooleans.hasNumber).toBe(true);
    expect(regComp.validatorBooleans.correctLength).toBe(false);
  });

  it('should return true for non-matching password fields', () => {
    regComp.registerForm.controls.passwordAndConfirm.controls.password.setValue('Aa123456');
    regComp.registerForm.controls.passwordAndConfirm.controls.confirmPassword.setValue('Aa123457');

    // Mark confirmPassword as touched
    regComp.registerForm.controls.passwordAndConfirm.controls.confirmPassword.markAsTouched();

    expect(regComp.passwordMismatch()).toBeTruthy();
  });

  it('should return false for matching password fields', () => {
    regComp.registerForm.controls.passwordAndConfirm.controls.password.setValue('Aa123456');
    regComp.registerForm.controls.passwordAndConfirm.controls.confirmPassword.setValue('Aa123456');

    // Mark confirmPassword as touched
    regComp.registerForm.controls.passwordAndConfirm.controls.confirmPassword.markAsTouched();
    expect(regComp.passwordMismatch()).toBeFalsy();
  });
});



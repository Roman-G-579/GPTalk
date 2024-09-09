import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, inject,
  OnInit,
} from '@angular/core';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { ButtonModule } from 'primeng/button';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CardModule } from 'primeng/card';
import { AutoFocus } from 'primeng/autofocus';
import { StepperModule } from 'primeng/stepper';
import { NgClass } from '@angular/common';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { PasswordModule } from 'primeng/password';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { Ripple } from 'primeng/ripple';
import { PrimeNGConfig } from 'primeng/api';
import { RegisterService } from './register.service';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';
import { ImageModule } from 'primeng/image';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { ConfirmPasswordValidator } from '../core/validators/confirm-password.validator';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FloatLabelModule,
    InputTextModule,
    InputGroupModule,
    ButtonModule,
    FormsModule,
    CardModule,
    AutoFocus,
    StepperModule,
    NgClass,
    IconFieldModule,
    InputIconModule,
    PasswordModule,
    ToggleButtonModule,
    Ripple,
    MessageModule,
    DividerModule,
    ImageModule,
    ReactiveFormsModule,
    ToastContainerDirective,
    RouterLink,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent implements OnInit{

  // Dependency injection
  private readonly primengConfig = inject(PrimeNGConfig);
  readonly registerService = inject(RegisterService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly toastr = inject(ToastrService);

  // FormGroup object containing every field in the registration form
  registerForm = new FormGroup({
    fullName: new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
    }),
    usernameAndEmail: new FormGroup({
      username: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.email,Validators.required]),
    }),

    // Password contains:
    // At least one lowercase character,
    // At least one uppercase character
    // At least one number
    // Between 6 and 100 characters total
    passwordAndConfirm: new FormGroup({
      password: new FormControl<string>('', [
        Validators.minLength(6),
        Validators.maxLength(100),
        Validators.pattern('^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).*$'),
        Validators.required]),
      confirmPassword: new FormControl<string>('', Validators.required),
    },
    {validators: ConfirmPasswordValidator.match('password', 'confirmPassword')})
  })

  // Stores the validity states of the password requirements (true - valid, false - invalid)
  validatorBooleans = {
    hasLowerCase: false,
    hasUpperCase: false,
    hasNumber: false,
    correctLength: false
  }
  active = 0; // Active page number of the registration section
  loading = false;

  ngOnInit() {
    this.primengConfig.ripple = true;
  }

  // Validates the input fields for first and last name
  submitFullName() {
    this.highlightIfInvalid(this.registerForm.controls.fullName);

    if (this.isValid(this.registerForm.controls.fullName)) {
      this.active = 1;
    }
  }

  // Validates the input fields for username and email
  submitUsernameAndEmail() {
    this.highlightIfInvalid(this.registerForm.controls.usernameAndEmail);

    if (this.isValid(this.registerForm.controls.usernameAndEmail)) {
      this.active = 2;
    }
  }

  // Validates the input fields for password and confirmation
  submitPassword() {
    this.highlightIfInvalid(this.registerForm.controls.passwordAndConfirm);

    if (this.isValid(this.registerForm.controls.passwordAndConfirm)) {
      this.registerUser();
    }
  }

  // Calls the register function using the register service using the given details
  registerUser() {
    this.loading = true;
    // Takes the registration details from registerForm FormGroup and copies them to a single flat object
    const formData = Object.assign({}, ...Object.values(this.registerForm.value));

    // Calls the register service's registration function
        this.registerService.registerUser(formData).subscribe({
          next: () => {
            this.active = 3;
            this.loading = false;
            this.cdr.detectChanges();
            this.toastr.success('Registration successful!', 'Success 🎉')
          },
          error: () => {
            this.loading = false;
            this.cdr.detectChanges();
            this.toastr.error("Registration failed", "Error!");
          }
        })
  }

  // Returns true if the given FormGroup's controls are all valid, otherwise returns false
  isValid(formGroup: FormGroup): boolean {
    for (const controlName in formGroup.controls) {
      if (Object.prototype.hasOwnProperty.call(formGroup.controls, controlName)) {
        if (!formGroup.controls[controlName].valid) {
          return false;
        }
      }
    }
    return true;
  }

  // Marks invalid form inputs from the given FormGroup as dirty if they are invalid
  highlightIfInvalid(formGroup: FormGroup): void {
    for (const controlName in formGroup.controls) {
      if (Object.prototype.hasOwnProperty.call(formGroup.controls, controlName) && !formGroup.controls[controlName].valid) {
        formGroup.controls[controlName].markAsDirty();
      }
    }
  }

  // Returns true if password field is different from confirmation field, returns false otherwise
  passwordMismatch() {
    return (this.registerForm.controls.passwordAndConfirm.controls.password.value !=
      this.registerForm.controls.passwordAndConfirm.controls.confirmPassword.value) &&
      this.registerForm.controls.passwordAndConfirm.controls.confirmPassword.touched
  }

  // Updates the values of the validator booleans based on the current password input
  checkPasswordValidity() {
    const pass = <string>this.registerForm.controls.passwordAndConfirm.controls.password.value;
    this.validatorBooleans.hasLowerCase = /[a-z]/.test(pass);
    this.validatorBooleans.hasUpperCase = /[A-Z]/.test(pass);
    this.validatorBooleans.hasNumber = /[0-9]/.test(pass);
    this.validatorBooleans.correctLength = pass.length >= 8 && pass.length <= 100;
  }

}

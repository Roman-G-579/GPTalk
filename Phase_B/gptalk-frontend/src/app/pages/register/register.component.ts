import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { ButtonModule } from 'primeng/button';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { RegisterService } from '../../core/services/register.service';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';
import { ImageModule } from 'primeng/image';

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
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent implements OnInit{
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
    passwordAndConfirm: new FormGroup({
      password: new FormControl('', [Validators.minLength(6), Validators.maxLength(100), Validators.required]),
      confirmPassword: new FormControl('', Validators.required),
    }),
  })

  active = 0; // Active page number of the registration section
  loading = false;
  errorMsg: string = "";

  constructor(private primengConfig: PrimeNGConfig, private registerService: RegisterService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.primengConfig.ripple = true;
  }

  // Validates the input fields for first and last name
  submitFullName() {
    this.highlightIfEmpty(this.registerForm.controls.fullName);

    if (this.isValid(this.registerForm.controls.fullName)) {
      this.active = 1;
    }
  }

  // Validates the input fields for username and email
  submitUsernameAndEmail() {
    this.highlightIfEmpty(this.registerForm.controls.usernameAndEmail);

    if (this.isValid(this.registerForm.controls.usernameAndEmail)) {
      this.active = 2;
    }
  }

  // Validates the input fields for password and confirmation
  submitPassword() {
    this.highlightIfEmpty(this.registerForm.controls.passwordAndConfirm);

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
          next: res => {
            this.active = 3;
            this.loading = false;
            this.cdr.detectChanges();
            console.log("registration successful!",res);
            this.errorMsg = '';
          },
          error: err => {
            this.loading = false;
            this.cdr.detectChanges();
            this.setError("Registration Failed - " + err.error.message);
            console.log("Registration Failed - ", err.error.message);
          }
        })
  }

  // Returns true if the given FormGroup's controls are all valid, otherwise returns false
  isValid(formGroup: FormGroup): boolean {
    for (const controlName in formGroup.controls) {
      if (formGroup.controls.hasOwnProperty(controlName)) {
        if (!formGroup.controls[controlName].valid) {
          return false;
        }
      }
    }
    return true;
  }

  // Marks invalid form inputs from the given FormGroup as dirty if they are invalid
  highlightIfEmpty(formGroup: FormGroup): void {
    for (const controlName in formGroup.controls) {
      if (formGroup.controls.hasOwnProperty(controlName) && !formGroup.controls[controlName].valid) {
        formGroup.controls[controlName].markAsDirty();
      }
    }
  }

  //Returns true if password field is different from confirmation field, returns false otherwise
  passwordMismatch() {
    if ((this.registerForm.controls.passwordAndConfirm.controls.password.value !=
      this.registerForm.controls.passwordAndConfirm.controls.confirmPassword.value) &&
      this.registerForm.controls.passwordAndConfirm.controls.confirmPassword.touched) {
      this.setError("Passwords do not match");
      return true;
    }
    this.setError("");
    return false;
  }

  // Sets errorMsg's value based on the given string
  setError(errorMessage: string): void {
    this.errorMsg = errorMessage;
  }
  //
  // // Gets the current errorMsg value
  // getError(): string {
  //   return this.errorMsg;
  // }
}

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
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
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent implements OnInit{
  firstName!: string;
  lastName!: string;
  username!: string;
  email!: string;
  password!: string;
  confirmPassword!: string;

  active: number = 0; //active page number of the registration section

  constructor(private primengConfig: PrimeNGConfig, private registerService: RegisterService) {}

  ngOnInit() {
    this.primengConfig.ripple = true;
  }

  // calls the register function using the register service using the given details
  submitDetails() {
    // takes the registration details from the text input elements
    const userData = {
      username: this.username,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email
    };

    //calls the register service's registration function
    this.registerService.registerUser(userData).subscribe({
      next: res => {
        console.log("registration successful!",res)
      },
      error: err => {
        console.log("registration failed ",err);
      }
    })
  }
}

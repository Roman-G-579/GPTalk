import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  firstName!: string;
  lastName!: string;
  username!: string;
  email!: string;
  password!: string;
  confirmPassword!: string;

  printInfo() {
    console.log(this.firstName)
    console.log(this.lastName)
    console.log(this.username)
    console.log(this.email)
    console.log(this.password)
  }

  submitName() {

  }
}

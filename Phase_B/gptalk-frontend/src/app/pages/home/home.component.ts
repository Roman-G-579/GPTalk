import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private readonly authService = inject(AuthService);

  date = new Date();
  partOfDay: string = "Morning";
  firstName = signal("User");

  ngOnInit() {
    this.setUserFirstName();
  }

  // Returns the current part of day based on the user's timezone
  getTimeOfDay() {
    const hrs = this.date.getHours();
    if (hrs < 12 ) {
      return "Morning";
    }
    else if (hrs >= 12 && hrs <= 17) {
      return "Afternoon";
    }
    else {
      return "Evening";
    }
  }

  // Returns the currently logged user's first name
  setUserFirstName() {
    const fName =  this.authService.userData().firstName;
    this.firstName.set(fName);
  }
}

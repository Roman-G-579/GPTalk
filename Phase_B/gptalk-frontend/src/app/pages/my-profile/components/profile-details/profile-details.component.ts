import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-profile-details',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './profile-details.component.html',
  styleUrl: './profile-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileDetailsComponent { }

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-profile-latest-results',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './profile-latest-results.component.html',
  styleUrl: './profile-latest-results.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileLatestResultsComponent { }

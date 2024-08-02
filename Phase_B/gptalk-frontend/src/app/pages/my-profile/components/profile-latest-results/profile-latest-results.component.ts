import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Result } from "./result.interface";

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
export class ProfileLatestResultsComponent {
  results = input<Result[]>([]);
}

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-daily-task',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './daily-task.component.html',
  styleUrl: './daily-task.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DailyTaskComponent { }

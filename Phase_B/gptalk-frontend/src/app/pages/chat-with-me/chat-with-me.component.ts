import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-chat-with-me',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './chat-with-me.component.html',
  styleUrl: './chat-with-me.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatWithMeComponent { }

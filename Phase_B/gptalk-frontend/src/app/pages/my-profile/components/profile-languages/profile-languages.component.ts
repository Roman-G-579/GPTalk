import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-profile-languages',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './profile-languages.component.html',
  styleUrl: './profile-languages.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileLanguagesComponent { }

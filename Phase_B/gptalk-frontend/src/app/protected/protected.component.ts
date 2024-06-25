/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { AuthService } from "../core/services/auth.service";

@Component({
  selector: 'app-protected',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './protected.component.html',
  styleUrls: ['./protected.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProtectedComponent {
  protectedData: any;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.getProtectedData().subscribe(
      (data) => {
        this.protectedData = data;
      },
      (error) => {
        console.error('Error fetching protected data', error);
      }
    );
  }
}

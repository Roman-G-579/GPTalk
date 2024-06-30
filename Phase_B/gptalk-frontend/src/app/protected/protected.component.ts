/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
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
  private readonly authService = inject(AuthService);
}

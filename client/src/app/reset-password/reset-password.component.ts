import {
  Component,
  Input,
  Inject,
  ChangeDetectionStrategy,
  OnInit
} from '@angular/core';
import { TuiInputModule, TuiInputPasswordModule } from '@taiga-ui/kit';
import { TuiButtonModule, TuiAlertService } from '@taiga-ui/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    TuiInputModule,
    TuiInputPasswordModule,
    ReactiveFormsModule,
    TuiButtonModule,
    RouterLink
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordComponent implements OnInit {
  isLoading: boolean = false;
  resetPasswordForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    @Inject(TuiAlertService) private readonly alerts: TuiAlertService
  ) {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async ngOnInit(): Promise<void> {
    await this.authService.tryAutoLogin();
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/calendar']);
    }
  }

  @Input() resettoken!: string;

  async onSubmit(): Promise<any> {
    try {
      if (this.resetPasswordForm.valid) {
        this.isLoading = true;
        const { newPassword } = this.resetPasswordForm.value;
        const response = await this.authService.resetPassword(
          this.resettoken,
          newPassword
        );
        if (response.data.success) {
          this.alerts
            .open('', { label: response.data.message, status: 'success' })
            .subscribe();
          this.router.navigate(['/sign-in']);
        }
      }
    } catch (error: any) {
      this.alerts
        .open('', { label: error?.message, status: 'error' })
        .subscribe();
    } finally {
      this.isLoading = false;
    }
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  Inject,
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
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    TuiInputModule,
    TuiInputPasswordModule,
    ReactiveFormsModule,
    TuiButtonModule,
    RouterLink
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    @Inject(TuiAlertService) private readonly alerts: TuiAlertService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {}

  async onSubmit(): Promise<any> {
    try {
      if (this.forgotPasswordForm.valid) {
        this.isLoading = true;
        const { email } = this.forgotPasswordForm.value;
        const response = await this.authService.forgotPassword(email);
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

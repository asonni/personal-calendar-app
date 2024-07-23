import { Router, RouterLink } from '@angular/router';
import {
  OnInit,
  Inject,
  Component,
  ChangeDetectionStrategy
} from '@angular/core';
import { TuiButtonModule, TuiAlertService } from '@taiga-ui/core';
import { TuiInputModule, TuiInputPasswordModule } from '@taiga-ui/kit';
import {
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';

import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    RouterLink,
    TuiInputModule,
    TuiButtonModule,
    ReactiveFormsModule,
    TuiInputPasswordModule
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignInComponent implements OnInit {
  signInForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    @Inject(TuiAlertService) private readonly alerts: TuiAlertService
  ) {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  async ngOnInit(): Promise<void> {
    await this.authService.tryAutoLogin();
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/calendar']);
    }
  }

  async onSubmit(): Promise<any> {
    try {
      if (this.signInForm.valid) {
        this.isLoading = true;
        const { email, password } = this.signInForm.value;
        await this.authService.signIn(email, password);
        if (this.authService.isAuthenticated()) {
          this.router.navigate(['/calendar']);
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

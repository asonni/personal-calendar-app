import {
  Component,
  ChangeDetectionStrategy,
  Inject,
  OnInit
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TuiButtonModule, TuiAlertService } from '@taiga-ui/core';
import { TuiInputModule, TuiInputPasswordModule } from '@taiga-ui/kit';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    TuiInputModule,
    TuiInputPasswordModule,
    ReactiveFormsModule,
    TuiButtonModule,
    RouterLink
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignUpComponent implements OnInit {
  signUpForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    @Inject(TuiAlertService) private readonly alerts: TuiAlertService
  ) {
    this.signUpForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
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
      if (this.signUpForm.valid) {
        this.isLoading = true;
        const { firstName, lastName, email, password } = this.signUpForm.value;
        await this.authService.signUp(firstName, lastName, email, password);
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

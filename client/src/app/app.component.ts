import { TuiRootModule } from '@taiga-ui/core';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TuiRootModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Personal Calendar App';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.tryAutoLogin();
  }
}

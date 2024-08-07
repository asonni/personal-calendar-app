import { TuiRootModule } from '@taiga-ui/core';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TuiRootModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Personal Calendar App';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // this.authService.tryAutoLogin();
  }
}

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AxiosResponse } from 'axios';

import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedIn = false;

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  async tryAutoLogin(): Promise<any> {
    try {
      const response: AxiosResponse =
        await this.apiService.axiosClient.get('/auth/me');
      const { token, expiresIn } = response.data;
      this.isLoggedIn = !!token && new Date(expiresIn).getTime() > Date.now();
    } catch (error) {
      // Handle error
      this.isLoggedIn = false;
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<any> {
    try {
      const response = await this.apiService.axiosClient.post('/auth/login', {
        email,
        password
      });
      this.isLoggedIn = !!response.data.token;
    } catch (error) {
      // Handle error
      this.isLoggedIn = false;
      throw error;
    }
  }

  async signUp(
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<any> {
    try {
      const response = await this.apiService.axiosClient.post(
        '/auth/register',
        {
          firstName,
          lastName,
          email,
          password
        }
      );
      this.isLoggedIn = !!response.data.token;
    } catch (error) {
      // Handle error
      this.isLoggedIn = false;
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<any> {
    try {
      const response = await this.apiService.axiosClient.post(
        '/auth/forgotpassword',
        {
          email
        }
      );
      return response;
    } catch (error) {
      // Handle error
      throw error;
    }
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<any> {
    try {
      const response = await this.apiService.axiosClient.put(
        `/auth/resetpassword/${resetToken}`,
        { newPassword }
      );
      return response;
    } catch (error) {
      // Handle error
      throw error;
    }
  }

  async logout(): Promise<any> {
    try {
      const response = await this.apiService.axiosClient.get('/auth/logout');
      this.isLoggedIn = !!response.data.token;
    } catch (error) {
      // Handle error
      this.isLoggedIn = true;
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn;
  }
}

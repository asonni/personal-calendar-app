import { Injectable } from '@angular/core';

// const { APP_BASE_URL, APP_API_VER } = process.env;

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public axiosClient: AxiosInstance;

  constructor() {
    this.axiosClient = axios.create({
      baseURL: environment.apiUrl,
      timeout: 10000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.initializeInterceptors();
  }

  private initializeInterceptors() {
    // Response Interceptor
    this.axiosClient.interceptors.response.use(
      (response: AxiosResponse) => {
        // Handle response data
        return response;
      },
      (error: AxiosError) => {
        return Promise.reject(error.response?.data);
      }
    );
  }
}

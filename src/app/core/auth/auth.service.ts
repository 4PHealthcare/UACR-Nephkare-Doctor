import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, throwError } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { AuthUtils } from "app/core/auth/auth.utils";
import { UserService } from "app/core/user/user.service";
import { APIService } from "app/core/api/api";

@Injectable()
export class AuthService {
  private _authenticated: boolean = false;

  /**
   * Constructor
   */
  constructor(
    private _httpClient: HttpClient,
    private _userService: UserService,
    private _apiService: APIService
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Setter & getter for access token
   */
  set accessToken(token: string) {
    localStorage.setItem("accessToken", token);
  }

  get accessToken(): string {
    return localStorage.getItem("accessToken");
  }

  /**
   * Setter & getter for user
   */
  set user(user: any) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  get user(): any {
    return localStorage.getItem("user") ?? "";
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Forgot password
   *
   * @param email
   */
  forgotPassword(email: string): Observable<any> {
    return this._httpClient.post("api/auth/forgot-password", email);
  }

  /**
   * Reset password
   *
   * @param password
   */
  resetPassword(password: string): Observable<any> {
    return this._httpClient.post("api/auth/reset-password", password);
  }

  /**
   * Sign in
   *
   * @param credentials
   */
  signIn(credentials: { username: string; password: string }): Promise<any> {
    // // Throw error, if the user is already logged in
    // if ( this._authenticated )
    // {
    //     return throwError('User is already logged in.');
    // }
    let promise = new Promise((resolve, reject) => { 
      this._apiService.create("api/adminstaff/Stafflogin", credentials).subscribe(
        (result) => {
          console.log(result.data);
          if (result.isSuccess && result.data) {
            if (
              (
                result.data.user.role_id == 1 ||
                result.data.user.role_id == 2 ||
                result.data.user.role_id == 3
              )
              
            ) {
             
              this.accessToken = result.data.token;

              // Set the authenticated flag to true
              this._authenticated = true;

              // Store the user on the user service
              this.user = result.data.user;
              this._userService.user = result.data.user;
              resolve(result);
            } else {
              reject(result);
            }
          } else {
            reject(result);
          }
        },
        (error) => {
          reject(error);
        }
      );
    });
    return promise;
  }

  /**
   * Sign in using the access token
   */
  signInUsingToken(): Observable<any> {
    console.log("refresh access token");
    // Renew token
    return this._httpClient
      .post("api/auth/refresh-access-token", {
        accessToken: this.accessToken,
      })
      .pipe(
        catchError(() =>
          // Return false
          of(false)
        ),
        switchMap((response: any) => {
          console.log(response);
          // Store the access token in the local storage
          this.accessToken = response.accessToken;

          // Set the authenticated flag to true
          this._authenticated = true;

          // Store the user on the user service
          this._userService.user = response.user;

          // Return true
          return of(true);
        })
      );
  }

  /**
   * Sign out
   */
  signOut(): Observable<any> {
    // Remove the access token from the local storage
    localStorage.removeItem("accessToken");

    // Set the authenticated flag to false
    this._authenticated = false;

    //remove user
    localStorage.removeItem("user");

    localStorage.removeItem("selectedPatientId");

    // Return the observable
    return of(true);
  }

  /**
   * Sign up
   *
   * @param user
   */
  signUp(user: {
    name: string;
    email: string;
    password: string;
    company: string;
  }): Observable<any> {
    return this._httpClient.post("api/auth/sign-up", user);
  }

  /**
   * Unlock session
   *
   * @param credentials
   */
  unlockSession(credentials: {
    email: string;
    password: string;
  }): Observable<any> {
    return this._httpClient.post("api/auth/unlock-session", credentials);
  }

  /**
   * Check the authentication status
   */
  check(): Observable<boolean> {
    // Check if the user is logged in
    if (this._authenticated) {
      return of(true);
    }

    // Check the access token availability
    if (!this.accessToken) {
      return of(false);
    }

    // Check the access token expire date
    // if ( AuthUtils.isTokenExpired(this.accessToken) )
    // {
    //     return of(false);
    // }

    // If the access token exists and it didn't expire, sign in using it
    // return this.signInUsingToken(); to do refresh

    return of(true);
  }
}

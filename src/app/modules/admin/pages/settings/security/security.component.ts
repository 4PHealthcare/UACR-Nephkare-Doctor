import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { APIService } from 'app/core/api/api';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
  selector: 'settings-security',
  templateUrl: './security.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsSecurityComponent implements OnInit {
  securityForm: FormGroup;
  userInfo: any;
  accountInfo: any;
  public showPassword: boolean = false;
  public showPassword2: boolean = false;
  isLoadingSpinner:boolean=false;
  /**
   * Constructor
   */
  constructor(
    private _formBuilder: FormBuilder,
    private httpService: APIService,
    private auth: AuthService,
    private snackBar: MatSnackBar,
    private _router: Router
  ) {
    this.userInfo = JSON.parse(this.auth.user);
    this.getUserInfo(this.userInfo?.user_id)
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Create the form
    this.securityForm = this._formBuilder.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&#_-])[A-Za-z\d$@$!%*?&#_-].{7,}$")]],
      twoStep: [false],
      askPasswordChange: [false],
    });
  }

  changePassword() {
    this.isLoadingSpinner=true;
    if (this.securityForm.get('currentPassword').value === this.securityForm.get('newPassword').value) {
      this.snackBar.open('Please enter the valid new password. ', 'close', {
        panelClass: "snackBarFailure",
        duration: 2000,
      });
    }
    else if (this.accountInfo?.password === this.securityForm.get('currentPassword').value) {
      const url = `api/User/ChangePassword`;
      const body = {
          userId: this.userInfo.user_id,
          oldPassword: this.securityForm.get('currentPassword').value,
          newPassword: this.securityForm.get('newPassword').value
      }
      this.httpService.create(url,body).subscribe((res: any) => { 
        this.isLoadingSpinner=false;
        this.securityForm.reset();
        this.SaveActivity();
          this.snackBar.open('Password updated successfully. ', 'close', {
              panelClass: "snackBarSuccess",
              duration: 2000,
            });

      },
      (error: any) => {
          console.warn('error', error);
      })
    }
    else {
      this.snackBar.open('Please enter the valid current password. ', 'close', {
        panelClass: "snackBarFailure",
        duration: 2000,
      });
    }

  }

  SaveActivity() {
    const body = {
      activityid: 0,
      userid: this.userInfo.user_id,
      titlename: "Your Password have been changed",
      descriptionname: "Changed the password",
      createdby: this.userInfo.user_id,
      categoryname: "Password"
    };
    const url = `api/PatientRegistration/CreateActivity`;
    this.httpService.create(url, body).subscribe((res: any) => { 
      this._router.navigate(['/sign-out']);

    },
      (error: any) => { console.log('error', error); });
  }

  clearForm(){
      this.securityForm.reset();
  }

  getUserInfo(userId: number) {
    this.httpService.get("api/User/GetUsersById?userId=", userId).subscribe(
      (res: any) => {
        this.accountInfo = res.data;
      },
      (error: any) => {
        console.warn("error", error);
      }
    );
  }
  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  public togglePasswordVisibility2(): void {
    this.showPassword2 = !this.showPassword2;
  }
}

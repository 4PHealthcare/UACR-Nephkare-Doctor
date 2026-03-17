import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { APIService } from 'app/core/api/api';
import { AuthService } from 'app/core/auth/auth.service';
import { FuseConfirmationService } from "@fuse/services/confirmation";

@Component({
  selector: 'settings-patientId',
  templateUrl: './patientId.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPatientIdComponent implements OnInit {
  accountForm: FormGroup;
  userInfo: any;
  accountInfo: any;
  changesFound:boolean = false;
  disableFields:boolean=false;
  disable
  /**
   * Constructor
   */
  constructor(
    private _formBuilder: FormBuilder,
    private httpService: APIService,
    private auth: AuthService,
    private snackBar: MatSnackBar,
    private _fuseConfirmationService: FuseConfirmationService
  ) {
    this.userInfo = JSON.parse(this.auth.user);
   
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.disableFields = false
    this.accountForm = this._formBuilder.group({
      adminaccountid:  ['', Validators.required],
      prefixpatientid: [''],
      prefixstartwith: [''],
      iscustomprefix: [false, Validators.required]
    });

    this.accountForm.valueChanges.subscribe(x => {
      this.changesFound = true;
    })
    
    this.getUserInfo(this.userInfo?.user_id)
  }
  initForm(data:any) {
   

    this.accountForm.patchValue({
      adminaccountid: data.admin_account,
      prefixpatientid: data.prefix_patientid,
      prefixstartwith: data.prefix_startwith,
      iscustomprefix: data.iscustom_prefix
    });
    this.changesFound = false;
  }


 
  updateprefix() {
    if (this.accountForm.get('iscustomprefix').value) {

      if( !(this.accountForm.get('prefixpatientid').value || this.accountForm.get('prefixstartwith').value)) {
        
        this.snackBar.open('Please Enter Alphanumeric Prefix and Numeric Data', 'close', {
          panelClass: "snackBarWarning",
          duration: 2000,
        });

        return;
      } 


    }else {
      this.accountForm.get('prefixpatientid').setValue(undefined);
      this.accountForm.get('prefixstartwith').setValue(undefined);
    }

    const confirmation = this._fuseConfirmationService.open({
      title: "Warning",
      message:
        "Are you sure want to change your Patient id!",
      actions: {
        confirm: {
          label: "Confirm",
        },
      },
    });

    confirmation.afterClosed().subscribe((result) => {
      if (result === "confirmed") {
        const url = `api/User/Update_hospitalPrefix`;
      const body = {
        "adminaccountid": this.accountInfo.admin_account,
        "prefixpatientid": this.accountForm.get('prefixpatientid').value,
        "prefixstartwith": this.accountForm.get('prefixstartwith').value,
        "iscustomprefix": this.accountForm.get('iscustomprefix').value
      }
      this.httpService.create(url,body).subscribe((res: any) => {
          this.snackBar.open('Custom Patient Id updated successfully. ', 'close', {
              panelClass: "snackBarSuccess",
              duration: 2000,
            });
            this.getUserInfo(this.userInfo.user_id);
      },
      (error: any) => {
          console.warn('error', error);
      })
      }
    });



    

   

  }


  clearForm(){
      this.getUserInfo(this.userInfo.user_id);
  }

  getUserInfo(userId: number) {
    this.changesFound = false;
    this.httpService.get("api/User/GetUsersById?userId=", userId).subscribe(
      (res: any) => {
        this.accountInfo = res.data;
        console.log(this.accountInfo);
        if((this.accountInfo.prefix_patientid != null && this.accountInfo.prefix_patientid != undefined) || (this.accountInfo.prefix_startwith != null && this.accountInfo.prefix_startwith != undefined)){
          console.log("disable fiep")
          this.disableFields=false;
          // this.accountForm.controls.prefixpatientid.disable();
          // this.accountForm.controls.prefixstartwith.disable();
        }
        this.initForm(res.data);
      },
      (error: any) => {
        console.warn("error", error);
      }
    );
  }

  customIdChange($event: any) {

   console.log($event);
    if (!$event.value) {
      this.accountForm.controls.prefixpatientid.enable();
      this.accountForm.controls.prefixstartwith.enable();
      // this.accountForm.get('prefixpatientid').setValue(undefined);
      // this.accountForm.get('prefixstartwith').setValue(undefined);
    }else{
      // this.getUserInfo(this.userInfo?.user_id);
      
      this.accountForm.controls.prefixpatientid.enable();
      this.accountForm.controls.prefixstartwith.enable();
    }
  }

  
}

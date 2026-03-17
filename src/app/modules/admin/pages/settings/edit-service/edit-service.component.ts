import { Component, Inject, OnInit, ViewEncapsulation  } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { APIService } from 'app/core/api/api';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'app/core/auth/auth.service';


@Component({
  selector: 'app-edit-service',
  templateUrl: './edit-service.component.html', 
  encapsulation: ViewEncapsulation.None,
  styles: [
    `
      .mat-dialog-container {
        padding: 0px;
      }
    `,
  ],
})
export class EditServiceComponent implements OnInit {

  durationOfMonths : any = [];

  serviceData: any = {
    name: this.data.planname,
    price: this.data.price,
    duration: this.data.duration_in_months.toString(),
    description: this.data.description
  };

  serviceForm:FormGroup;
  userInfo: any;
  constructor(public dialog: MatDialog,
    public dialogRef: MatDialogRef<any>,
    private _formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private httpService: APIService,
    private auth: AuthService,
    private snackBar: MatSnackBar) {
     // this.userInfo = JSON.parse(this.auth.adminUser);
      this.userInfo = JSON.parse(this.auth.user);
     }

  ngOnInit(): void {
    this.serviceForm = this._formBuilder.group({
      id: [""],
      name: ["", [Validators.required]],
      price: [null, [Validators.required]],
      duration: [null, [Validators.required]],
      description: [""],
    });

    const url = `api/User/GetMasterData?mastercategoryid=69`;
    this.httpService.getAll(url).subscribe((res: any) => { 
      this.durationOfMonths = res.data;
       // Patch values to the form
       this.serviceForm.patchValue(this.serviceData);
    },
      (error: any) => { console.log('error', error); });
    

     
  }
  
  updateService(){
    const url = `api/Subscription/AddUpdateSubscription`;
    const body = {
      subscriptionid: this.data.subscription_id,
      plan: this.serviceForm.get('name').value,
      price_value: this.serviceForm.get('price').value,
      createdby: this.data.created_by,
      durationinmonths: this.serviceForm.get('duration').value ? parseInt(this.serviceForm.get('duration').value) : 0,
      description_name: this.serviceForm.get('description').value,
      subscriptiontypeid: this.data.subscription_typeid
    }
    this.httpService.create(url, body).subscribe((res: any) => {
      this.dialogRef.close(true);
      this.SaveActivity();
      this.snackBar.open('Service updated successfully. ', 'close', {
        panelClass: "snackBarSuccess",
        duration: 2000,
      });
    },
    (error: any) => {
      console.warn('error', error);
    });  
  }

  SaveActivity() {
    const body = {
      activityid: 0,
      userid: this.userInfo.user_id,
      titlename: "Updated Subscription Plan",
      descriptionname: "Updated subscription plan <b>"+ this.serviceForm.get('name').value + "</b>",
      createdby: this.userInfo.user_id,
      categoryname: "EditSubscription"
    };
    const url = `api/PatientRegistration/CreateActivity`;
    this.httpService.create(url, body).subscribe((res: any) => { },
      (error: any) => { console.log('error', error); });
  }

}

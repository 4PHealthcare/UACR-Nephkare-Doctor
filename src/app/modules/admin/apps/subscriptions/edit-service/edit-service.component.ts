import { Component, Inject, OnInit, ViewEncapsulation  } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { APIService } from 'app/core/api/api';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'app/core/auth/auth.service';


@Component({
  selector: 'app-edit-service',
  templateUrl: './edit-service.component.html', 
  encapsulation: ViewEncapsulation.None
})
export class EditServiceComponent implements OnInit {

  durationOfMonths : any = [
    {
      name: 1,
      title: '1 Month'
    },
    {
      name: 2,
      title: '2 Months'
    },
    {
      name: 3,
      title: '3 Months'
    },
    {
      name: 4,
      title: '4 Months'
    },
    {
      name: 5,
      title: '5 Months'
    },
    {
      name: 6,
      title: '6 Months'
    },
    {
      name: 7,
      title: '7 Months'
    },
    {
      name: 8,
      title: '8 Months'
    },
    {
      name: 9,
      title: '9 Months'
    },
    {
      name: 10,
      title: '10 Months'
    },
    {
      name: 11,
      title: '11 Months'
    },
    {
      name: 12,
      title: '12 Months'
    }
  ];

  serviceData: any = {
    name: this.data.planname,
    price: this.data.price,
    duration: this.data.duration_in_months,
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
      console.log(this.data);
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
      // Patch values to the form
      this.serviceForm.patchValue(this.serviceData);
  }
  
  updateService(){
    const url = `api/Subscription/AddUpdateSubscription`;
    const body = {
      subscriptionid: this.data.subscription_id,
      plan: this.serviceForm.get('name').value,
      price_value: this.serviceForm.get('price').value,
      createdby: this.data.created_by,
      durationinmonths: this.serviceForm.get('duration').value,
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

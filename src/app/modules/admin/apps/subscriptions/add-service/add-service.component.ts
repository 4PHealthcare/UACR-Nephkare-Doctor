import { Component, Inject, OnInit, ViewEncapsulation  } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { APIService } from 'app/core/api/api';
import { AuthService } from 'app/core/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-service',
  templateUrl: './add-service.component.html', 
  encapsulation: ViewEncapsulation.None,
}) 
export class AddServiceComponent implements OnInit {

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
  serviceForm:FormGroup;
  userInfo: any;

  constructor(public dialog: MatDialog,
    public dialogRef: MatDialogRef<any>,
    private _formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private httpService: APIService,
    private auth: AuthService,
    private snackBar: MatSnackBar) {
      this.userInfo = JSON.parse(this.auth.user);
     }

  ngOnInit(): void {
    // Create the service form
    this.serviceForm = this._formBuilder.group({
      id: [""],
      name: ["", [Validators.required]],
      price: [null, [Validators.required]],
      duration: [null, [Validators.required]],
      description: [""],
    });

    // Patch values to the form
    this.serviceForm.patchValue({});
  }
  
  addService(){
    console.log('form', this.serviceForm);
    // this.dialogRef.close();
    console.log(this.addNewservice());
  }

  addNewservice() {
    const url = `api/Subscription/AddUpdateSubscription`;
    const body = {
      subscriptionid: 0,
      plan: this.serviceForm.get('name').value,
      price_value: this.serviceForm.get('price').value,
      createdby: this.userInfo.user_id,
      durationinmonths: this.serviceForm.get('duration').value,
      description_name: this.serviceForm.get('description').value,
      subscriptiontypeid: this.data.categoryId
    }
    console.log('body', body)
    this.httpService.create(url, body).subscribe((res: any) => {
      this.dialogRef.close(true);
      this.SaveActivity();
      this.snackBar.open('Service added successfully. ', 'close', {
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
      titlename: "New Subscription Plan",
      descriptionname: "Added new subscription plan <b>"+ this.serviceForm.get('name').value + "</b>",
      createdby: this.userInfo.user_id,
      categoryname: "Subscription"
    };
    const url = `api/PatientRegistration/CreateActivity`;
    this.httpService.create(url, body).subscribe((res: any) => { },
      (error: any) => { console.log('error', error); });
  }

  categories() {

  }

  /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
   trackByFn(index: number, item: any): any
   {
       return item.id || index;
   }

   filterByCategory(event:any) {
   }

}

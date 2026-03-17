import { MatTableDataSource } from "@angular/material/table";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog"; 
import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { APIService } from "app/core/api/api";
import { AuthService } from "app/core/auth/auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FuseConfirmationService } from "@fuse/services/confirmation";
import { Router } from "@angular/router";

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss']
})
export class BillingComponent implements OnInit {


  public myMath = Math;
  selectedService;
  totalAmount:number;
  paidTotalAmount:number;
  remainingAmount:number;
  services: any[] = [];
  submitted:boolean = false;
  qty:number;
  discount:number;
  editedServiceObj:any = {};
  discountType:string = 'rs';
  servicesAmounts:any[] = [];
  paidAmounts:any[] = [];
  amount:number;
  userInfo: any;
  paidamount:number;
  servicePaymentId:number;
  paymentReceivedId:number;
  paidAmountType:string = 'cash';
  paymentid:number;
  @ViewChild('billingForm') myNgForm;
  @ViewChild('paidForm') paidFormElments;

  
  displayedColumns: string[] = ['name', 'quantity', 'amount', 'discount', 'finalamount', 'status', 'actions'];
  myPlaceHolder:any = "Select Person";
  // displayedColumns: string[] = ['service', 'fee', 'createdon', 'actions'];
  dataSource = new MatTableDataSource([
    {name: 'Hydrogen', quantity: 1.0079, amount: 500, finalamount:500, status:'paid'},
  ]);
 

  constructor(
    @Inject(MAT_DIALOG_DATA) public patient: any,
    private httpService: APIService,
    private auth: AuthService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<any>,
    private _router: Router,
    private _fuseConfirmationService: FuseConfirmationService,
  ) { 
    this.userInfo = JSON.parse(this.auth.user);

  }

  ngOnInit(): void {
    console.log(this.patient);
    this.getServices();
    this.getServicesAmounts();
    
  }

  getServices() {
    this.httpService
      .getAll(`api/User/GetHospitalServices?adminid=${this.userInfo.admin_account}&category=op`)
      .subscribe(
        (res: any) => {
         
         this.services = res.data ? res.data : [];
          //  this.dataSource = new MatTableDataSource<scheduledList>(res.data);
        },
        (error: any) => {
          console.warn("error", error);
        }
      );
  }

  getServicesAmounts () {

    this.httpService
      .getAll(`api/User/GetPatientServicePayments?appointmentid=${this.patient.calender_id}&patientid=${this.patient.patient_id}&islab=${false}`)
      .subscribe(
        (res: any) => {
         
        if(res.data) {

          this.servicesAmounts = res.data;
  

          this.totalAmount = res.data.reduce(function (prev, cur) {  
            return prev + cur.paid_amount;               
          }, 0);

          
        } else {
          this.servicesAmounts = [];
          this.remainingAmount = undefined;
          this.totalAmount = undefined;
        }

        this.getPaidAmounts();
          //  this.dataSource = new MatTableDataSource<scheduledList>(res.data);
        },
        (error: any) => {
          console.warn("error", error);
        }
      );
  }

  getPaidAmounts () {
    this.httpService
      .getAll(`api/User/GetPatientPaymentMOdeDeatils?appointmentid=${this.patient.calender_id}&patientid=${this.patient.patient_id}`)
      .subscribe(
        (res: any) => {
         
         this.paidAmounts = res.data ? res.data : [];

         this.paidTotalAmount = this.paidAmounts.reduce(function (prev, cur) {  
          return prev + cur.amount_paid;               
        }, 0);

        if (this.totalAmount) {
          this.remainingAmount = this.totalAmount - this.paidTotalAmount;
          this.patient.pending_amount = this.remainingAmount;
        }
      
        
          //  this.dataSource = new MatTableDataSource<scheduledList>(res.data);
        },
        (error: any) => {
          console.warn("error", error);
        }
      );
  }

  addTagFn(name) {
    return { name: name, tag: true };
}

onSearch($event) {
  this.myPlaceHolder = $event.term == ''? '': $event.term; 
}
 
CreateNew() {
  console.log(this.myPlaceHolder)
}

addService(form) {
  this.submitted = true;
  if (form.invalid) {
    return;
  }

  let paidAmount= this.amount;
  let discount= 0;
  if (this.qty >= 2) {
    paidAmount = this.amount * this.qty;
  }
  if(this.discount) {
    
    if (this.discountType == 'rs') {
      paidAmount = paidAmount - this.discount;
    } else {
      paidAmount = paidAmount - (paidAmount * (this.discount/100));
    }
  }


  // if (this.servicePaymentId && this.editedServiceObj.pending_amount) {
  //   discount =  this.editedServiceObj.paid_amount - this.editedServiceObj.pending_amount;
  //   paidAmount = paidAmount - discount;
  // }


  const obj = {
    "paymentid": this.servicePaymentId ? this.servicePaymentId : 0,
    "patientid": this.patient.patient_id,
    "appointmentid": this.patient.calender_id,
    "hospitalserviceid": this.selectedService,
    "discountamount": this.discount == null ? undefined: this.discount,
    "amount": this.amount,
    "ispercent": this.discount ? this.discountType == 'rs' ? false : true : undefined,
    "quantityno": this.qty,
    "paidamount": paidAmount,
    "createdby": this.userInfo.user_id,
    "isactive": true
  }

  this.httpService
      .create("api/User/createPatientServiceBills", obj)
      .subscribe(
        (res: any) => {
         
          let msg = 'Service added successfully.';
          if(this.servicePaymentId) {
            msg = 'Service updated successfully.'
          }
          this.snackBar.open(msg, 'close', {
            panelClass: 'snackBarSuccess',
            duration: 2000,
          });
  
          this.clear();
          this.getServicesAmounts();

          //  this.dataSource = new MatTableDataSource<scheduledList>(res.data);
        },
        (error: any) => {
          console.warn("error", error);
        }
      );

}

clear()  {
  this.selectedService = undefined;
  this.qty = undefined;
  this.amount = undefined;
  this.submitted = false;
  this.discount = undefined;
  this.servicePaymentId = 0;
  this.editedServiceObj = {};
  this.myNgForm.resetForm({discountType:'rs'});
}

editService(data) {

  this.selectedService = data.hospital_service_id;
  this.qty = data.quantity;
  this.amount = data.amount;
  this.submitted = false;
  if(data.discount_amount) {
    this.discount  = data.discount_amount;
    this.discountType = data.is_percent ? 'percentage' : 'rs';
  } else {
    this.discount = undefined;
    this.discountType = 'rs';
  }

  this.editedServiceObj = data;
  this.servicePaymentId = data.payment_id;
}


deleteService(id) {
  const confirmation = this._fuseConfirmationService.open({
    title: "Delete Service?",
    message:
      "Are you sure you want to delete this? This action cannot be undone!",
    actions: {
      confirm: {
        label: "Delete",
      },
    },
  });
  confirmation.afterClosed().subscribe((result) => {
    if (result === "confirmed") {
      const url = `api/User/DeletePatientServicesPayment?paymentid=` + id;
      this.httpService.getAll(url).subscribe(
        (res: any) => {
          if (res?.isSuccess) {
            this.getServicesAmounts();
            // this.getMedicalHistory();
            this.snackBar.open(
              "Service deleted successfully. ",
              "close",
              {
                panelClass: "snackBarSuccess",
                duration: 2000,
              }
            );
          }
          this.myNgForm.resetForm();
        },
        (error: any) => {
          console.log("error", error);
        }
      );
    }
  });
}


editPayment (data)  {
  this.paidamount = data.amount_paid;
  this.paidAmountType = data.payment_mode;
  this.paymentReceivedId = data.paymentreceived_id;
}


deletePayment(id) {
  const confirmation = this._fuseConfirmationService.open({
    title: "Delete Payment?",
    message:
      "Are you sure you want to delete this? This action cannot be undone!",
    actions: {
      confirm: {
        label: "Delete",
      },
    },
  });
  confirmation.afterClosed().subscribe((result) => {
    if (result === "confirmed") {
      const url = `api/User/DeletePatientPaymentReceivedMode?paymentid=` + id;
      this.httpService.getAll(url).subscribe(
        (res: any) => {
          if (res?.isSuccess) {
            this.getServicesAmounts();
            this.paymentclear();
            // this.getMedicalHistory();
            this.snackBar.open(
              "Payment deleted successfully. ",
              "close",
              {
                panelClass: "snackBarSuccess",
                duration: 2000,
              }
            );
          }
        },
        (error: any) => {
          console.log("error", error);
        }
      );
    }
  });
}

paymentclear()  {
  this.paidFormElments.resetForm({ paidAmountType: 'cash' });
  this.paymentReceivedId = 0;
  this.paidAmountType = 'cash';
}

savePayment(form) {
  if (form.invalid) {
    return;
  }

  const obj = {
    "paymentreceivedid": this.paymentReceivedId ? this.paymentReceivedId : 0,
    "patientid": this.patient.patient_id,
    "amountpaid": this.paidamount,
    "paymentmode": this.paidAmountType,
    "appointmentid": this.patient.calender_id,
    "createdby": this.userInfo.user_id,
    "labuniqueid":" ",
    islab:false

  }

  this.httpService
      .create("api/User/createPatientPaymentreceivedmode", obj)
      .subscribe(
        (res: any) => {

          let msg = 'Payment added successfully.';
          if(this.paymentReceivedId) {
            msg = 'Payment updated successfully.'
          }
          this.snackBar.open(msg, 'close', {
            panelClass: 'snackBarSuccess',
            duration: 2000,
          });
  
  
          this.paymentclear();
          this.getServicesAmounts();
        },
        (error: any) => {
          console.warn("error", error);
        }
      );
}

getItem() {
  
  if (this.selectedService ) {
    let obj = this.services.find(o => o.service_id === this.selectedService);

    this.qty = 1;
    this.amount = parseInt(obj.price);
  } else {
    this.qty = undefined;
    this.amount = undefined;
  }
}

gotoBilling() {

  this.dialogRef.close(true);

  this._router.navigateByUrl(`/pages/profile?id=${this.patient.patient_id}&appointment=${this.patient.calender_id}`, {state:{payment:'true'}});

}

}

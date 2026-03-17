import { MatTableDataSource } from "@angular/material/table";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from "@angular/core";
import { APIService } from "app/core/api/api";
import { AuthService } from "app/core/auth/auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FuseConfirmationService } from "@fuse/services/confirmation";
import { Router } from "@angular/router";
import * as moment from "moment";
import { Subject } from "rxjs";
import { debounceTime, map, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: "app-lab-billing",
  templateUrl: "./lab-billing.component.html",
  styleUrls: ["./lab-billing.component.scss"],
})
export class LabBillingComponent implements OnInit {
  public myMath = Math;
  selectedService;
  totalAmount: number;
  paidTotalAmount: number;
  remainingAmount: number;
  services: any[] = [];
  subTotalAmount:number;
  submitted: boolean = false;
  qty: number;
  billId:any;
  billLoading:boolean = false;
  finalAmount:number;
  visibility:boolean = false;
  currentDate = new Date();
  discount: number;
  editedServiceObj: any = {};
  discountType: string = "rs";
  servicesAmounts: any[] = [];
  paidAmounts: any[] = [];
  amount: number;
  isAllAmountsExist:boolean = true;
  userInfo: any;
  mobileNumber:any;
  docInfo:any = {};
  paidamount: number;
  servicePaymentId: number;
  paymentReceivedId: number;
  paidAmountType: string = "cash";
  paymentid: number;
  name: string;
  discountAmount:number;
  age: any;
  gender: any;
  patient_uniqueid:any;
  @ViewChild("billingForm") myNgForm;
  @ViewChild("paidForm") paidFormElments;
  @ViewChild('print') printBtn: ElementRef<HTMLElement>;
  filterInput = new Subject();

  displayedColumns: string[] = [
    "name",
    "quantity",
    "amount",
    "discount",
    "finalamount",
    "status",
    "actions",
  ];
  printTitle:string;
  myPlaceHolder: any = "Select Person";
  // displayedColumns: string[] = ['service', 'fee', 'createdon', 'actions'];
  dataSource = new MatTableDataSource([
    {
      name: "Hydrogen",
      quantity: 1.0079,
      amount: 500,
      finalamount: 500,
      status: "paid",
    },
  ]);

  constructor(
    @Inject(MAT_DIALOG_DATA) public patient: any,
    private httpService: APIService,
    private auth: AuthService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<any>,
    private _router: Router,
    private cd: ChangeDetectorRef,
    private _fuseConfirmationService: FuseConfirmationService
  ) {
    this.userInfo = JSON.parse(this.auth.user);
  }

  ngOnInit(): void {
    console.log(this.patient);
    if (this.patient.role == "Lab") {
      this.name = this.patient.data.patient_name;
      this.age = this.patient.data.age;
      this.gender = this.patient.data.gender;
      this.patient_uniqueid = this.patient.data.patient_uniqueid;
    }
    if (this.patient.role == "Front Desk") {
      this.name = this.patient.data.full_name;
      this.age = this.patient.data.age;
      this.gender = this.patient.data.gender;
      this.patient_uniqueid = this.patient.data.patient_uniqueid;
    }
    this.mobileNumber = this.patient.data.mobile_no;
    this.printTitle = `${this.patient.data.first_name}_bill_${moment(this.currentDate).format("DD-MMM-YYYY")}`

    this.getServices();
    this.getServicesAmounts();
    this.getDoctorInfo();

    this.filterInput
      .pipe(
        debounceTime(500),
        map((val) => {
          this.updateLabPrice(val);
        })
      )
      .subscribe();
  }


  getDoctorInfo() {
    const url = `api/User/GetUsersById?userId=` + this.userInfo.user_id;

    this.httpService.getAll(url).subscribe(
      (res: any) => {
        this.docInfo = res.data;
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }

  getServices() {
    this.httpService
    .getAll(`api/User/GetHospitalServices?adminid=${this.userInfo.admin_account}&category=lab`)
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

  getServicesAmounts() {
    let objInstance = this;
    if (this.patient.role == "Lab") {
      this.httpService
        .getAll(
          `api/User/GetPatientServicePayments_bylabid?lab_uniqueid=${this.patient.data.lab_uniqueid}`
        )
        .subscribe(
          (res: any) => {
            if (res.data) {
              this.servicesAmounts = res.data;


              this.servicesAmounts.forEach(function (obj) {
                
                if (!obj.amount) {
                  objInstance.isAllAmountsExist = false;
                }
                obj.discount_amount = obj.discount_amount ? obj.discount_amount : undefined;
                obj.discountType = obj.is_percent ? 'percentage' : obj.discount_amount ? 'rs' : '';
              });
              
              this.calculateTotals(res.data);

           

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
    if (this.patient.role == "Front Desk") {
      this.httpService
        .getAll(
          `api/User/GetPatientServicePayments_bylabid?lab_uniqueid=${this.patient.labId}`
        )
        .subscribe(
          (res: any) => {
            if (res.data) {
              this.servicesAmounts = res.data;

              this.servicesAmounts.forEach(function (obj) {
                if (!obj.amount) {
                  objInstance.isAllAmountsExist = false;
                }
                obj.discountType = obj.is_percent ? 'percentage' : obj.discount_amount ? 'rs' : '';
              });


              this.totalAmount = res.data.reduce(function (prev, cur) {
                return prev + cur.paid_amount;
              }, 0);

              this.subTotalAmount = res.data.reduce(function (prev, cur) {  
                return prev + (cur.quantity * cur.amount);               
              }, 0);
        
              if(this.totalAmount == this.subTotalAmount){
                this.discountAmount = 0;
                this.finalAmount = this.subTotalAmount;
              }else{
                
                let discountPerc = (((this.subTotalAmount - this.totalAmount)/this.subTotalAmount)*100).toFixed(2);
                this.discountAmount = this.subTotalAmount - this.totalAmount;
                this.finalAmount = this.subTotalAmount - this.discountAmount;
        
              }

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
  }

  calculateTotals (service) {
    let objInstance = this;
    this.totalAmount = service.reduce(function (prev, cur) {
      
      if (!cur.amount) {
        objInstance.isAllAmountsExist = false;
      }

      return prev + cur.paid_amount;
    }, 0);

    this.subTotalAmount = service.reduce(function (prev, cur) {  
      return prev + (cur.quantity * cur.amount);               
    }, 0);

    if(this.totalAmount == this.subTotalAmount){
      this.discountAmount = 0;
      this.finalAmount = this.subTotalAmount;
    }else{
      
      let discountPerc = (((this.subTotalAmount - this.totalAmount)/this.subTotalAmount)*100).toFixed(2);
      this.discountAmount = this.subTotalAmount - this.totalAmount;
      this.finalAmount = this.subTotalAmount - this.discountAmount;

    }
    this.remainingAmount = this.finalAmount;
  }

  getPaidAmounts() {
    if (this.patient.role == "Lab") {
      this.httpService
        .getAll(
          `api/User/GetPatientPaymentMOdeDeatils?appointmentid=0&patientid=${this.patient.data.patient_id}&labuniqueid=${this.patient.data.lab_uniqueid}`
        )
        .subscribe(
          (res: any) => {
            this.paidAmounts = res.data ? res.data : [];

            this.paidTotalAmount = this.paidAmounts.reduce(function (
              prev,
              cur
            ) {
              return prev + cur.amount_paid;
            },
            0);

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
    if (this.patient.role == "Front Desk") {
      this.httpService
        .getAll(
          `api/User/GetPatientPaymentMOdeDeatils?appointmentid=0&patientid=${this.patient.data.user_id}&labuniqueid=${this.patient.labId}`
        )
        .subscribe(
          (res: any) => {
            this.paidAmounts = res.data ? res.data : [];

            this.paidTotalAmount = this.paidAmounts.reduce(function (
              prev,
              cur
            ) {
              return prev + cur.amount_paid;
            },
            0);

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
  }

  addTagFn(name) {
    return { name: name, tag: true };
  }

  onSearch($event) {
    this.myPlaceHolder = $event.term == "" ? "" : $event.term;
  }

  CreateNew() {
    console.log(this.myPlaceHolder);
  }

  addService(form) {
    this.submitted = true;
    if (form.invalid) {
      return;
    }

    let paidAmount = this.amount;
    let discount = 0;
    if (this.qty >= 2) {
      paidAmount = this.amount * this.qty;
    }
    if (this.discount) {
      if (this.discountType == "rs") {
        paidAmount = paidAmount - this.discount;
      } else {
        paidAmount = paidAmount - paidAmount * (this.discount / 100);
      }
    }

    // if (this.servicePaymentId && this.editedServiceObj.pending_amount) {
    //   discount =  this.editedServiceObj.paid_amount - this.editedServiceObj.pending_amount;
    //   paidAmount = paidAmount - discount;
    // }

    const obj = {
      paymentid: this.servicePaymentId ? this.servicePaymentId : 0,
      patientid: this.patient.patient_id,
      appointmentid: 0,
      hospitalserviceid: this.selectedService,
      discountamount: this.discount == null ? undefined : this.discount,
      amount: this.amount,
      ispercent: this.discount
        ? this.discountType == "rs"
          ? false
          : true
        : undefined,
      quantityno: this.qty,
      paidamount: paidAmount,
      createdby: this.userInfo.user_id,
    };

    this.httpService
      .create("api/User/createPatientServiceBills", obj)
      .subscribe(
        (res: any) => {
          let msg = "Service added successfully.";
          if (this.servicePaymentId) {
            msg = "Service updated successfully.";
          }
          this.snackBar.open(msg, "close", {
            panelClass: "snackBarSuccess",
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

  clear() {
    this.selectedService = undefined;
    this.qty = undefined;
    this.amount = undefined;
    this.submitted = false;
    this.discount = undefined;
    this.servicePaymentId = 0;
    this.editedServiceObj = {};
    this.myNgForm.resetForm({ discountType: "rs" });
  }

  editService(data) {
    this.selectedService = data.hospital_service_id;
    this.qty = data.quantity;
    this.amount = data.amount;
    this.submitted = false;
    if (data.discount_amount) {
      this.discount = data.discount_amount;
      this.discountType = data.is_percent ? "percentage" : "rs";
    } else {
      this.discount = undefined;
      this.discountType = "rs";
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
              this.snackBar.open("Service deleted successfully. ", "close", {
                panelClass: "snackBarSuccess",
                duration: 2000,
              });
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

  editPayment(data) {
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
              this.snackBar.open("Payment deleted successfully. ", "close", {
                panelClass: "snackBarSuccess",
                duration: 2000,
              });
            }
          },
          (error: any) => {
            console.log("error", error);
          }
        );
      }
    });
  }

  paymentclear() {
    this.paidFormElments.resetForm({ paidAmountType: "cash" });
    this.paymentReceivedId = 0;
    this.paidAmountType = "cash";
  }

  savePayment(form) {
    if (form.invalid) {
      return;
    }
    if (this.patient.role == "Lab") {
      const obj = {
        paymentreceivedid: this.paymentReceivedId ? this.paymentReceivedId : 0,
        patientid: this.patient.data.patient_id,
        amountpaid: this.paidamount,
        paymentmode: this.paidAmountType,
        appointmentid: 0,
        createdby: this.userInfo.user_id,
        labuniqueid:this.patient.data.lab_uniqueid,
        islab:true
      };

      this.httpService
        .create("api/User/createPatientPaymentreceivedmode", obj)
        .subscribe(
          (res: any) => {
            let msg = "Payment added successfully.";
            if (this.paymentReceivedId) {
              msg = "Payment updated successfully.";
            }
            this.snackBar.open(msg, "close", {
              panelClass: "snackBarSuccess",
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
    if (this.patient.role == "Front Desk") {
      const obj = {
        paymentreceivedid: this.paymentReceivedId ? this.paymentReceivedId : 0,
        patientid: this.patient.data.user_id,
        amountpaid: this.paidamount,
        paymentmode: this.paidAmountType,
        appointmentid: 0,
        createdby: this.userInfo.user_id,
        labuniqueid:this.patient.labId,
        islab:true
      };

      this.httpService
        .create("api/User/createPatientPaymentreceivedmode", obj)
        .subscribe(
          (res: any) => {
            let msg = "Payment added successfully.";
            if (this.paymentReceivedId) {
              msg = "Payment updated successfully.";
            }
            this.snackBar.open(msg, "close", {
              panelClass: "snackBarSuccess",
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
  }

  getItem() {
    if (this.selectedService) {
      let obj = this.services.find(
        (o) => o.service_id === this.selectedService
      );

      this.qty = 1;
      this.amount = parseInt(obj.price);
    } else {
      this.qty = undefined;
      this.amount = undefined;
    }
  }

  gotoBilling() {
    this.dialogRef.close(true);

    this._router.navigateByUrl(
      `/pages/profile?id=${this.patient.data.user_id}&appointment=${0}`,
      { state: { payment: "true" } }
    );
  }

  generateBill() {

    this.billLoading = true;
    const selectedIds = this.servicesAmounts.map(({ payment_id }) => payment_id);

    const url = `api/User/BilledServices`;
    this.httpService.create(url, selectedIds).subscribe(
      (res: any) => {


        if (res.data) {
          this.billId = res.data;
          setTimeout(() => {
            let el: HTMLElement = this.printBtn.nativeElement;
            el.click();
            this.billLoading = false;
          }, 2000);
          this.cd.detectChanges();
        } else {
         console.warn('error in billed service');
        }

      },
      (error: any) => {

        console.log("error", error);
      }
    );

    // this.visibility = true;
    // setTimeout(() => {
    //   this.visibility = false;
    // }, 1000);
  }


  updateLabPrice(payment:any) {

    if(!payment.amount) {
      // this.snackBar.open('Please enter price.', "close", {
      //   panelClass: "snackBarWarning",
      //   duration: 2000,
      // });
      return;
    }

    let ispercent = false;
    let paidAmount = payment.amount;
    let discountAmount = payment.discount_amount;

    if (payment.discount_amount && payment.discountType) {
      if (payment.discountType == "rs") {
        paidAmount = paidAmount - payment.discount_amount;
      } else {
        ispercent = true;
        paidAmount = paidAmount - paidAmount * (payment.discount_amount / 100);
      }
    } else if(payment.discount_amount && !payment.discountType){
      this.snackBar.open('Please select discount type.', "close", {
        panelClass: "snackBarWarning",
        duration: 2000,
      });
      return;
    } else {
      discountAmount = 0;
    }

    payment.paid_amount = paidAmount;
    
    const url = `api/User/Update_patient_labservice_price?paymentid=${payment.payment_id}&price=${payment.amount}&discount=${discountAmount}&ispercent=${ispercent}&paid_amount=${paidAmount}`;
    this.httpService.create(url, {}).subscribe(
      (res: any) => {


        this.isAllAmountsExist = true;
        this.calculateTotals(this.servicesAmounts);
        

      },
      (error: any) => {

        console.log("error", error);
      }
    );
  }

  onValueChange(event:any, payment:any) {
    this.filterInput.next(payment);
  }



}

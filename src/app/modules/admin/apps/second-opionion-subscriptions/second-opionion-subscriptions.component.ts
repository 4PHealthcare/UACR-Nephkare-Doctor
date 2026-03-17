import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewEncapsulation,
  ViewChild,
} from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { MatPaginator } from "@angular/material/paginator";
import { takeUntil, debounceTime, map, switchMap } from "rxjs/operators";
import * as moment from "moment";
import { FormBuilder, FormGroup } from "@angular/forms";
import { APIService } from "app/core/api/api";
import { AuthService } from "app/core/auth/auth.service";
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { BillingComponent } from "../queue/billing/billing.component";
import { AddPatientComponent } from "../users/add-patient/add-patient.component";
import { FuseConfirmationService } from "@fuse/services/confirmation";
import { MatSnackBar } from "@angular/material/snack-bar";

import { Router } from "@angular/router";
import { AppointmentRequestFormModalComponent } from "../appointment-request-form-modal/appointment-request-form-modal.component";
import { AppointmentFormModalComponent } from "../appointment-form-modal/appointment-form-modal.component";

@Component({
  selector: 'app-second-optionion-subscriptions',
  templateUrl: './second-opionion-subscriptions.component.html',
  styleUrls: ['./second-opionion-subscriptions.component.scss']
})
export class SecondOpinionSubscriptionComponent implements OnInit {


  @ViewChild(MatPaginator) private _paginator: MatPaginator;
  @ViewChild(MatSort) private _sort: MatSort;
  userInfo: any;
  pageSize = 10;
  currentPage = 0;
  filterVal = "";
  unubscribedFilterVal = "";
  dateForm: FormGroup;
  sortDirection = "";
  sortBy = "";
  filterSubject = new Subject();
  unscubscribedPatientFilterSubject = new Subject();
  patients$ = new BehaviorSubject<any>(null);
  totalRecords$ = new BehaviorSubject<any>(null);
  
  unsubscribedPatients$ = new BehaviorSubject<any>(null);
  unsubscribedPatientstotalRecords$ = new BehaviorSubject<any>(null);
  unsubscribedPatientsPageSize = 10;
  unsubscribedPatientscurrentPage = 0;
  second_opinion_appointment_id:number;

  accountInfo = new BehaviorSubject<any>(null);
  name:any;
  /**
   * Constructor
   */
  constructor(
    private httpService: APIService,
    private auth: AuthService,
    private _matDialog: MatDialog,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private _fuseConfirmationService: FuseConfirmationService,
    private snackBar: MatSnackBar,
    private router: Router
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
    console.log(this.userInfo.role_id)
    this.newGetPatientsInfo();
    this.getUnsubscribedPatients();
    this.filterSubject
      .pipe(
        debounceTime(500),
        map((val) => {
          this.newGetPatientsInfo();
        })
      )
      .subscribe();

      this.unscubscribedPatientFilterSubject
      .pipe(
        debounceTime(500),
        map((val) => {
          this.getUnsubscribedPatients();
        })
      )
      .subscribe();

    this.getUserInfo(this.userInfo.user_id);
  }
  initForm() {
    this.dateForm = this.fb.group({
      fromDate: [''],
      toDate: [''],
    });
    this.dateForm.valueChanges.subscribe((data: any) => {
      this.newGetPatientsInfo();
    });

    this.dateForm.valueChanges.subscribe((data: any) => {
      this.newGetPatientsInfo();
    });

    
    if (history.state && history.state.newPatient) {
      this.addPatient();
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------
  // newGetPatientsInfo() {
  //   const url = `api/User/GetUserRequestedAppointments`;
  //   const body = {
  //     roleid: 3,
  //     pageSize: this.pageSize,
  //     pageNo: this.currentPage + 1,
  //     searchtext: this.filterVal,
  //     clinicid: this.userInfo.admin_account,
  //     ismainbranch: true,
  //     sortBy: this.sortBy,
  //     sortDirection: this.sortDirection,
  //     userid: this.userInfo.user_id,
  //   };
  //   this.httpService.create(url, body).subscribe((res: any) => {
  //     this.patients$.next(res.data.userdata);
  //     this.totalRecords$.next(res.data.totalrecords);
  //     console.log(this.patients$);
  //   });
    
  // }
  newGetPatientsInfo() {
    console.log("hi");
    
    const url = `api/Patient/Get_All_VerifiedSecondOpinionPatientsList?pagesize=${this.pageSize}&pageno=${this.currentPage + 1}&searchkey=${this.filterVal}&subscriptiontype=7`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        if (res.data) {
          // this.isLoading=false;
          // this.testServiceList = res.data;
          // this.dataSource.data = res.data;
          // console.log(this.testServiceList);
          this.patients$.next(res.data.verifieddata);
          this.totalRecords$.next(res.data.totalrecords);
        }else{
          // this.isLoading=false;
          // this.testServiceList=[];
          // this.dataSource.data =[];
        }
      },
      (error: any) => {
        // this.isLoading=false;
        console.log("error", error);
      }
    ); 
  }
  addSpace(data: any) {
    const formatText = data.match(/.{1,5}/g);
    return formatText.join(" ");
  }

  filterData(val: any) {
    this.filterVal = val;
    this.filterSubject.next(val);
  }

  unsubscribedPatientFilterData(val: any) {
    this.unubscribedFilterVal = val;
    this.filterSubject.next(val);
  }

  onPageChange(index: any) {
    this.currentPage = index.pageIndex;
    this.pageSize = index.pageSize;
    this.newGetPatientsInfo();
  }

  onPatientsPageChange(index: any) {
    this.unsubscribedPatientscurrentPage = index.pageIndex;
    this.unsubscribedPatientsPageSize = index.pageSize;
    this.getUnsubscribedPatients();
  }
  
 
  getUserInfo(userId: number) {
    this.httpService.get("api/User/GetUsersById?userId=", userId).subscribe(
      (res: any) => {
        if (res.data) {
          this.name=res.data.full_name;
          res.data.admin_name = res.data.isadmin_account
            ? res.data.contactperson_name
            : res.data.full_name
            ? res.data.full_name
            : res.data.first_name;
        }
        this.accountInfo.next(res.data);
      },
      (error: any) => {
        console.warn("error", error);
      }
    );
  }
  addPatient() {
    this.dialog
      .open(AddPatientComponent, {
        width: "40rem",
        height: "100%",
        panelClass: "patient-reg-form",
        position: { right: "0" },
        // data: { patientid: data?.user_id,  },
      })
      .afterClosed()
      .subscribe((data) => {
        console.log(data);
        if (data) {
          this.newGetPatientsInfo();
         
        }
      });
  }

  editPatient(data){
    this.dialog.open(AddPatientComponent, {
        width: "40rem",
        height: "100%",
        panelClass: 'patient-reg-form',
        position: { right: "0" },
        data: { data },
      }).afterClosed().subscribe((data) => {
        if (data) {
          this.newGetPatientsInfo();
        }
      });
    }
    deleteRecord(data) {
      console.log(data)
      const confirmation = this._fuseConfirmationService.open({
        title: "Delete Patient",
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
          const url = `api/Patient/DeletePatient?patientid=`+data.user_id+`&withrelation=`+data.isprimary_account;
          this.httpService.create(url,null).subscribe(
            (res: any) => {
              if (res?.isSuccess) {
                
                this.newGetPatientsInfo();
                
                this.snackBar.open(
                  "Patient deleted successfully. ",
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
    bookAppointment(appointmentdata?: any, formType?:string) { 
      let appointment_category = 'Pre Consultation';
    
      if (formType=='enroll' && appointmentdata.status === 'Completed') {
        appointment_category = 'Follow Up';
      } else if (formType=='enroll') {
        appointment_category = 'Expert Opinion';
      }

      this.dialog
        .open(AppointmentFormModalComponent, {   
          width: "50rem",
          height: "100%",
          panelClass:"no-padding-popup",
          position: { right: "0" },
          // appointmentdata.request_status 
           data: { patient: appointmentdata, page: formType=='Reschedule'?'Reschedule' : formType=='enroll' || appointmentdata.opinion_id? 'Enroll':formType=='unsubscribed' ? 'unsubscribed': formType=='Reschedule'?'Reschedule': appointmentdata.request_status, appointment_category},
        })
        .afterClosed()
        .subscribe((data) => {
          if (data) {
            this.second_opinion_appointment_id=data;
           
             this.newGetPatientsInfo();
             this.getUnsubscribedPatients();
          }
        });
    }

    getUnsubscribedPatients() { 
    

      
      const url = `api/User/GetHospitalbasedUsers_byservicetype`;
      const body = {
        roleid: 3,
        pageSize: this.unsubscribedPatientsPageSize,
        pageNo: this.unsubscribedPatientscurrentPage + 1,
        searchtext: this.unubscribedFilterVal,
        clinicid: this.userInfo.admin_account,
        ismainbranch: true,
        userid: this.userInfo.user_id,
        servicetype: "7"
      };
  
  
      this.httpService.create(url, body).subscribe((res: any) => {
        this.unsubscribedPatients$.next(res.data.userdata);
        this.unsubscribedPatientstotalRecords$.next(res.data.totalrecords);
      });
  
     
    }

    deleteAppointment(data) {
      console.log(data);
      const confirmation = this._fuseConfirmationService.open({
        title: "Cancel Appointment",
        message:
          "Are you sure you want to cancel this appointment? This action cannot be undone!",
        actions: {
          confirm: {
            label: "Cancel",
          },
          cancel: {
            label: "Close",
          },
        },
      });
      confirmation.afterClosed().subscribe((result) => {
        if (result === "confirmed") {
            // this.openDialog();
          const url = `api/Doctor/UpdateAppointmentStatus?appointmentid=${data.appointment_id}&statusid=${13}&actionby=${this.userInfo.user_id}&patientid=${data.patient_id}`;
          this.httpService.create(url, null).subscribe((res: any) => {
              if (res?.isSuccess) {
                this.newGetPatientsInfo();
                this.snackBar.open("Appointment canceled successfully. ","close",
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

    // appointmentEdit(appointmentdata: any) {
    //   this.dialog
    //   .open(AppointmentRequestFormModalComponent, { 
    //     width: "50rem",
    //     height: "100%",
    //     panelClass:"no-padding-popup",
    //     position: { right: "0" },
    //      data: { patient: appointmentdata, },
    //   })
    //   .afterClosed()
    //   .subscribe((data) => {
    //     if (data) {
    //       // this.getAllComplaintByUserId();
    //     }
    //   });
      
    // }
  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}

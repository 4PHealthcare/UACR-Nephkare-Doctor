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
import { BillingComponent } from "../../apps/queue/billing/billing.component";
import { AddPatientComponent } from "../../apps/users/add-patient/add-patient.component";
import { FuseConfirmationService } from "@fuse/services/confirmation";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AppointmentFormModalComponent } from "../../apps/appointment-form-modal/appointment-form-modal.component";
import { LabBillingComponent } from "../lab-billing/lab-billing.component";
import { LabTestsComponent } from "../lab-tests/lab-tests.component";
import { Router } from "@angular/router";

@Component({
  selector: "lab-list",
  templateUrl: "./lab-list.component.html",
  styles: [
    `
      .lab-list-grid { 
        grid-template-columns: 48px auto 40px;

        @screen sm {
          grid-template-columns: 48px auto 112px 72px;
        }

        @screen md {
          grid-template-columns: 160px auto 112px 72px;
        }

        @screen lg {
          grid-template-columns: 25% 20% 20% 20% 10%;
        }
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabListComponent implements OnInit {
  @ViewChild(MatPaginator) private _paginator: MatPaginator;
  @ViewChild(MatSort) private _sort: MatSort;
  userInfo: any;
  pageSize = 10;
  currentPage = 0;
  filterVal = "";
  dateForm: FormGroup;
  sortDirection = "";
  sortBy = "";
  filterSubject = new Subject();
  patients$ = new BehaviorSubject<any>(null);
  totalRecords$ = new BehaviorSubject<any>(null);
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
    this.newGetPatientsInfo();
    this.filterSubject
      .pipe(
        debounceTime(500),
        map((val) => {
          this.newGetPatientsInfo();
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
  newGetPatientsInfo() {
    const url = `api/User/GetHospitalbasedUsers`;
    const body = {
      roleid: 3,
      pageSize: this.pageSize,
      pageNo:  this.currentPage + 1,
      searchtext: this.filterVal,
      clinicid: this.userInfo.admin_account,
      ismainbranch: true,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
      userid: this.userInfo.user_id,
    };
    this.httpService.create(url, body).subscribe((res: any) => {
      this.patients$.next(res.data.userdata);
      this.totalRecords$.next(res.data.totalrecords);
      console.log(this.patients$);
    });
  }

  addSpace(data: any) {
    const formatText = data.match(/.{1,5}/g);
    return formatText.join(" ");
  }

  filterData(val: any) {
    this.filterVal = val;
    this.currentPage = 0;
    this.filterSubject.next(val);
  }
  onPageChange(index: any) {
    this.currentPage = index.pageIndex;
    this.pageSize = index.pageSize;
    this.newGetPatientsInfo();
  }
  // billingModel(data) { 
  //   console.log(data)
  //   this._matDialog
  //     .open(LabBillingComponent, {
  //       width: "60rem",
  //       height: "100%",
  //       panelClass: "no-padding-popup",
  //       position: { right: "0" },
  //       data: {data,page:'Lab list'},
  //     })
  //     .afterClosed()
  //     .subscribe((dataObj) => {
  //       if (dataObj) {
  //         data.have_vitals = true;
  //         // this.getPatientVital();
  //       }
  //       this.newGetPatientsInfo();
  //     });
  // }
  sortData(event: any) {
    this.sortBy = event.active;
    this.sortDirection = event.direction;
    this.newGetPatientsInfo();
  }
  billingModel(data) { 
    console.log(data)
    this._matDialog
      .open(LabTestsComponent, {
       
        width: "50rem", 
          height: "100%",
          panelClass:"no-padding-popup",
          position: { right: "0" },
           data: { patient: data, role:'Lab',page:'test-patient-list'},
      })
      .afterClosed()
      .subscribe((dataObj) => {
        if (dataObj) {
          data.have_vitals = true;
          // this.getPatientVital();
        }
        // this.router.navigateByUrl('/apps/tests')
        this.newGetPatientsInfo();
      });
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
    bookAppointment(data) {
      this.dialog
        .open(AppointmentFormModalComponent, { 
          width: "50rem",
          height: "100%",
          panelClass:"no-padding-popup",
          position: { right: "0" },
           data: { patient: data, },
        })
        .afterClosed()
        .subscribe((data) => {
          if (data) {
            // this.getAllComplaintByUserId();
          }
        });
    }
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

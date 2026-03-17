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
import { TestTemplateModalComponent } from "./test-template-modal/test-template-modal.component";

@Component({
  selector: "test-template",
  templateUrl: "./test-template.component.html",
  styles: [
    `
      .test-lists-grid {
        grid-template-columns: 48px auto 40px;

        @screen sm {
          grid-template-columns: 48px auto 112px 72px;
        }

        @screen md {
          grid-template-columns: 160px auto 112px 72px;
        }

        @screen lg {
          grid-template-columns: 30% 30% 25% 15%;
        }
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestTemplateComponent implements OnInit {
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
  name: any;
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
    this.getLabTestGroupList();
    this.filterSubject
      .pipe(
        debounceTime(500),
        map((val) => {
          this.getLabTestGroupList();
        })
      )
      .subscribe();
  }

 
  getLabTestGroupList() {
    const url = `api/Lab/GetLabTestGroup`;
    const body = {
     
      pageSize: this.pageSize,
      pageNo: this.currentPage + 1,
      search_text: this.filterVal,
      adminid:this.userInfo.admin_account
    };
    this.httpService.create(url, body).subscribe((res: any) => {
      this.patients$.next(res.data.labgroups);
      console.log(this.patients$);
      this.totalRecords$.next(res.data.total_records);
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
    this.getLabTestGroupList();
  }
  sortData(event: any) {
    this.sortBy = event.active;
    this.sortDirection = event.direction; 
    this.getLabTestGroupList();
  }
  openTestTemplateModal() {
    this.dialog
      .open(TestTemplateModalComponent, {
        width: "75rem",
        height: "100%",
        panelClass: "no-padding-popup",
        position: { right: "0" },
         data: { mode:'add' },
      })
      .afterClosed()
      .subscribe((data) => {
        this.getLabTestGroupList();
      });
  }
  editReportGroup(data){
    this.dialog
    .open(TestTemplateModalComponent, {
      width: "75rem",
      height: "100%",
      panelClass: "no-padding-popup",
      position: { right: "0" },
       data: { tests: data,  mode:'edit'},
    })
    .afterClosed()
    .subscribe((data) => {
   
     
        this.getLabTestGroupList();
      
    });
  } 

  
  delete(data) {
    console.log(data.testgroup_id);
    const confirmation = this._fuseConfirmationService.open({
      title: "Delete Test Group?",
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
        const url = `api/Lab/DeleteLabTestGroup?groupid=` + data.testgroup_id;
        this.httpService.getAll(url).subscribe(
          (res: any) => {
            if (res?.isSuccess) {
              this.getLabTestGroupList();
              this.snackBar.open("Service deleted successfully. ", "close", {
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

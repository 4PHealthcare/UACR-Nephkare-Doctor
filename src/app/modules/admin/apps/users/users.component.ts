import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, merge, Observable, Subject } from 'rxjs';
import { debounceTime, map, switchMap, takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { AuthService } from 'app/core/auth/auth.service';
import { APIService } from 'app/core/api/api';
import {
  FormGroup,
  NgForm,
  FormBuilder,
  Validators, 
  FormControl,
} from '@angular/forms';
import * as XLSX from 'xlsx';
import { MatDialog } from '@angular/material/dialog'; 
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {AppointmentFormModalComponent} from '../../apps/appointment-form-modal/appointment-form-modal.component'
import { AddPatientComponent } from './add-patient/add-patient.component';

import moment from 'moment';
export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD-MMM-YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY'
  },
}; 

@Component({
  selector: 'users',
  templateUrl: './users.component.html',
  styles: [
    `
      .inventory-grid {
        grid-template-columns: 48px auto 40px;

        @screen sm {
          grid-template-columns: 48px auto 112px 72px;
        }

        @screen md {
          grid-template-columns: 160px auto 112px 72px;
        }

        @screen lg {
          grid-template-columns: 25% 20% 20% 15% 20% ;
        }
      }
    `,
  ],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: fuseAnimations,
})
export class UsersComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) private _paginator: MatPaginator;
  @ViewChild(MatSort) private _sort: MatSort;

  userInfo: any;
  patients$ = new BehaviorSubject<any>(null);
  pageSize = 10;
  currentPage = 0;
  filterVal = '';
  filterSubject = new Subject();
  totalRecords$ = new BehaviorSubject<any>(null);
  fromDate: Date;
  dateForm: FormGroup;
  sortDirection = '';
  sortBy = '';
  fileName = 'Patients.xlsx';
  uploadData: any = [];

  constructor(
    private auth: AuthService,
    private httpService: APIService,
    private fb: FormBuilder,
    private dialog:MatDialog
  ) {
    this.userInfo = JSON.parse(this.auth.user);
    console.log(this.userInfo);
  }

  ngOnInit(): void {
    this.initForm();
    this.getPatientsInfo();
    this.filterSubject
      .pipe(
        debounceTime(500),
        map((val) => {
          this.getPatientsInfo();
        })
      )
      .subscribe();
  }

  initForm() {
    this.dateForm = this.fb.group({
      fromDate: [''],
      toDate: [''],
    });
    this.dateForm.valueChanges.subscribe((data: any) => {
      this.getPatientsInfo();
    });

    this.dateForm.valueChanges.subscribe((data: any) => {
      this.getPatientsInfo();
    });
  }

  ngAfterViewInit(): void {}

  getPatientsInfo() {
    const url = `api/User/GetHospitalbasedUsers`;
    const body = {
      roleid: 3,
      pageSize: this.pageSize,
      pageNo: this.currentPage + 1,
      searchtext: this.filterVal,
      clinicid: this.userInfo.admin_account,
      ismainbranch: true,
      fromdate: this.dateForm.get('fromDate').value
        ? moment(this.dateForm.get('fromDate').value).format('YYYY-MM-DD') : null,
      todate: this.dateForm.get('toDate').value
        ? moment(this.dateForm.get('toDate').value).format('YYYY-MM-DD') : null,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
      userid: this.userInfo.user_id
    };
    this.httpService.create(url, body).subscribe((res: any) => {
      this.patients$.next(res.data.userdata);
      console.log(this.patients$);
      this.totalRecords$.next(res.data.totalrecords);
    });
  }

  onPageChange(index: any) {
    this.currentPage = index.pageIndex;
    this.pageSize = index.pageSize;
    this.getPatientsInfo();
  }

  filterData(val: any) {
    this.filterVal = val;
    this.filterSubject.next(val);
  }

  sortData(event: any) {
    this.sortBy = event.active;
    this.sortDirection = event.direction; 
    this.getPatientsInfo();
  }

  downloadData() {
    this.getAllRecords();
  }

  getAllRecords() {
    const url = `api/User/GetHospitalbasedUsers`;
    const body = {
      roleid: 3,
      allrecords: true,
      pageSize: 0,
      pageNo: 0,
      searchtext: '',
      fromdate: null,
      todate: null,
      sortBy: '',
      sortDirection: '',
      userid: this.userInfo.user_id
    };
    this.httpService.create(url, body).subscribe((res: any) => {
      const usersData = res.data?.userdata;
      if (usersData.length > 0) {
        let patientId = "Patient Id";
            let personalInfo = "Personal Info";
            let phoneNumber = "Phone Number";
            // let riskCondition = "Risk/Condition";
            let rigisterDate = "Register Date";
              const headers = [
                patientId,
                personalInfo,
                phoneNumber,
                // riskCondition,
                rigisterDate
              ];
              this.uploadData.push(headers);
            let i = 0;
        usersData.map((data: any) => {
          patientId = "HK00000" + (i + 1);
          personalInfo = data.first_name + ' ' + data.last_name+ ','+ data.age + 'yrs,'+data.gender;
                phoneNumber = data.mobile_no;
                // riskCondition = '--';
                rigisterDate = data.created_on;
          const importData = [
            patientId,
            personalInfo,
            phoneNumber,
            // riskCondition,
            rigisterDate
          ];
          this.uploadData.push(importData);
        });
        const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.uploadData);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, this.fileName);
        this.uploadData = [];
      }
    });
  }
  // bookAppointment(det){
  //   console.log(det)

  // }
  bookAppointment(data) {
    console.log(data?.user_id);
    this.dialog
      .open(AppointmentFormModalComponent, { 
        width: "25rem",
        height: "100%",
        panelClass:"no-padding-popup",
        position: { right: "0" },
         data: { patientid: data?.user_id},
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          // this.getAllComplaintByUserId();
        }
      });
  }

  setDisplayPrescription() {
    localStorage.setItem('displayPrescription', 'patients');
  }

  addSpace(data: any) {
    const formatText = data.match(/.{1,5}/g);
    return formatText.join(' ');
  }

  addPatient() {
    this.dialog
    .open(AddPatientComponent, { 
      width: "40rem",
      height: "100%",
      panelClass: 'patient-reg-form',
      position: { right: "0" },
      // data: { patientid: data?.user_id,  },
    })
    .afterClosed()
    .subscribe((data) => {
      if (data) {
         this.getPatientsInfo();
      }
    });
  }
}

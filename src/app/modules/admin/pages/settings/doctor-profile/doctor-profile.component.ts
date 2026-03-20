import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, map } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import * as XLSX from 'xlsx';
import moment from 'moment';
import { MatTabChangeEvent } from "@angular/material/tabs";

// import { ViewHospitalLicenseComponent } from './view-hospital-license/view-hospital-license.component';
import { APIService } from 'app/core/api/api';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'app/core/auth/auth.service';
import { AddUserModalComponent } from './add-user-modal/add-user-modal.component';
import { AddStaffModalComponent } from './add-staff-modal/add-staff-modal.component';
import { AddPhysicianModalComponent } from './add-physician-modal/add-physician-modal.component';



@Component({
  selector: 'doctor-profile', 
  templateUrl: './doctor-profile.component.html',
  styleUrls: ["./doctor-profile.component.scss"],

  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: fuseAnimations,
})
export class DoctorProfileComponent implements OnInit {
  @ViewChild(MatPaginator) private _paginator: MatPaginator;
  @ViewChild(MatSort) private _sort: MatSort;

  doctorsList$ = new BehaviorSubject<any>(null);
  physicianList$ = new BehaviorSubject<any>(null);
  staffList$ = new BehaviorSubject<any>(null);
  
  adminInfo: any;
  pageSize = 100;
  currentPage = 0;
  staffCurrentPage = 0;
  filterVal = '';
  filterStaffVal = '';
  filterSubject = new Subject();
  filterStaffSubject = new Subject()
  totalRecords$ = new BehaviorSubject<any>(null);
  totalStaffRecords$ = new BehaviorSubject<any>(null);
  fromDate: Date;
  dateForm: FormGroup;
  clinicId:string;
  staffClinicId:string;
  sortDirection = '';
  sortBy = '';
  fileName = 'Doctors.xlsx';
  uploadData: any = [];
  hospitals:any[] = [];

  /**
   * Constructor
   */
  constructor(
    private _fuseConfirmationService: FuseConfirmationService,
    public dialog: MatDialog,
    private httpService: APIService,
    private snackBar: MatSnackBar,
    private auth: AuthService,
    private fb: FormBuilder
  ) {
    this.adminInfo = JSON.parse(this.auth.user);
    console.log(this.adminInfo)
    this.hospitals.push({
      clinic_name: this.adminInfo.first_name,
      clinicid: this.adminInfo.user_id,
      admin:true
    })

  }

  /**
   * On init
   */
  ngOnInit(): void {
    this.initForm();
      this.getDoctorsList();
      this.getPhysicianList();
      this.getStaffs();
      this.filterSubject.pipe(debounceTime(500),map((val) => {
        console.log(val)
          this.getDoctorsList();
          this.getPhysicianList();
        })
      )
      .subscribe();
      
      this.filterStaffSubject
      .pipe(
        debounceTime(500),
        map((val) => {
          this.getStaffs();
        })
      )
      .subscribe();

      this.getSubClinics(this.adminInfo.user_id);

  }

  getStaffs() { 
    const url = `api/adminstaff/get-adminstaff`;
    const body = {
       pageNumber: this.staffCurrentPage + 1,
      pageSize: this.pageSize,
      roleId: 4,
       adminAccount: this.adminInfo.admin_account,
      // createdBy: 1,
       search: this.filterStaffVal,
      
    };
    this.httpService.create(url, body).subscribe((res: any) => {
      this.staffList$.next(res.data.data);
      this.totalStaffRecords$.next(res.data.totalCount);
    });
  } 


  getSubClinics(userId: number) {
    this.httpService.get("api/User/GetSubClinics?mainbranchid=", userId).subscribe(
      (res: any) => {
        if(res.data && res.data.length !== 0) {
          this.hospitals = [...this.hospitals, ...res.data];
        }else {
          this.clinicId = this.adminInfo.user_id;
          this.staffClinicId = this.adminInfo.user_id;;
        }
      },
      (error: any) => {
        console.warn("error", error);
      }
    );
  }

  getDoctorsList() {
    console.log(this.filterVal)
    const url = `api/User/GetHospitalbasedUsers?roleid`;
    const body = {
      roleid: 5,
      pageSize: this.pageSize,
      pageNo: this.currentPage + 1,
      searchtext: this.filterVal,
      clinicid: this.clinicId ? this.clinicId : this.adminInfo.user_id,
      ismainbranch: this.clinicId == this.adminInfo.user_id || !this.clinicId ? true : false,
    
      // fromdate: this.dateForm.get('fromDate').value
      //   ? moment(this.dateForm.get('fromDate').value).format('YYYY-MM-DD')
      //   : null,
      // todate: this.dateForm.get('toDate').value
      //   ? moment(this.dateForm.get('toDate').value).format('YYYY-MM-DD')
      //   : null,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
      userid: this.adminInfo.user_id
    };
    this.httpService.create(url, body).subscribe((res: any) => {
      if (res.data.userdata) {
        this.doctorsList$.next(res.data.userdata);
      } else {
        this.doctorsList$.next(undefined);
      }
      this.totalRecords$.next(res.data.totalrecords);
    });
  }

  getPhysicianList() {
    console.log(this.filterVal)
    const url = `api/User/GetHospitalbasedUsers?roleid`;
    const body = {
      roleid: 82580,
      pageSize: this.pageSize,
      pageNo: this.currentPage + 1,
      searchtext: this.filterVal,
      clinicid: this.adminInfo.admin_account,
      ismainbranch: this.adminInfo.isadmin_account ? true : false,
    
      // fromdate: this.dateForm.get('fromDate').value
      //   ? moment(this.dateForm.get('fromDate').value).format('YYYY-MM-DD')
      //   : null,
      // todate: this.dateForm.get('toDate').value
      //   ? moment(this.dateForm.get('toDate').value).format('YYYY-MM-DD')
      //   : null,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
      userid: this.adminInfo.user_id
    };
    this.httpService.create(url, body).subscribe((res: any) => {
      if (res.data.userdata) {
        this.physicianList$.next(res.data.userdata);
      } else {
        this.physicianList$.next(undefined);
      }
      this.totalRecords$.next(res.data.totalrecords);
    });
  }

  initForm() {
    this.dateForm = this.fb.group({
      fromDate: [''],
      toDate: [''],
    });
    this.dateForm.valueChanges.subscribe((data: any) => {
      this.getDoctorsList();
    });
  }

  deleteSelectedDoctor(data: any, type?:string): void {

    console.log(data);
    const confirmation = this._fuseConfirmationService.open({
      title: 'Delete Doctor',
      message: 'Are you sure you want to remove? This action cannot be undone!',
      actions: {
        confirm: {
          label: 'Delete',
        },
      },
    });

    // Subscribe to the confirmation dialog closed action 
    confirmation.afterClosed().subscribe((result) => {
      // If the confirm button pressed...
      if (result === 'confirmed') {
        const url = `api/adminstaff/delete-adminstaff/${data.user_id}`;
        this.httpService.deleteAll(url).subscribe(
      (res: any) => {
        if(type) {
          this.getStaffs();
        }else {
          this.getDoctorsList();
          this.getPhysicianList();
        }
       
        this.SaveActivity(data?.first_name, data?.last_name, 0,data?.role_name);
        this.snackBar.open('User deleted successfully.', 'close', {
          panelClass: 'snackBarSuccess',
          duration: 2000,
        });
      },
      (error: any) => {
        this.snackBar.open(error, 'close', {
          panelClass: 'snackBarFailure',
          duration: 2000,
        });
      });
      }
    });
  }

  
  viewDetails(doctor: any, action: string) {
    // const dialogRef = this.dialog.open(ViewHospitalLicenseComponent, {
    //   width: '40rem',
    //   height: '100%',
    //   position: { right: '0' },
    //   panelClass: 'view-details-form',
    //   data: { doctor, action },
    // }).afterClosed().subscribe((data: any) => {
    //   if(data){
    //     this.getDoctorsList();
    //   }
    // });
  }

  changeStatus(data: any) {
    console.log(data);
    if (data.current_statusId === 27) {
      this.updateUserStatus(data.user_id, 28);
    //  this.SaveActivity(data?.first_name, data?.last_name, 28);
    } else if (data.current_statusId === 28) {
      this.updateUserStatus(data.user_id, 27);
     // this.SaveActivity(data?.first_name, data?.last_name, 27);
    }
  }

  updateUserStatus(userId: any, statusId: any) {
    const url = `api/User/UpdateUserStatus?userId=${userId}&statusId=${statusId}`;
    this.httpService.create(url, {}).subscribe((res: any) => {
      this.snackBar.open('Status updated successfully.', 'close', {
        panelClass: "snackBarSuccess",
        duration: 2000,
      });
      this.getDoctorsList();
    },
    (error: any) => {
        console.log('error', error);
    });
  }

  openAddUser(accountInfo?:any) {
    this.dialog
      .open(AddUserModalComponent, {
        width: '25rem',
        height: '100%',
        panelClass:'no-padding-popup',
        position: { right: '0' },
        data: { roleId: 5, accountInfo }
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.getPhysicianList();
        }
      });
  }
  openAddPhysician(accountInfo?:any){
    this.dialog
    .open(AddPhysicianModalComponent, {
      width: '25rem',
      height: '100%',
      panelClass:'no-padding-popup',
      position: { right: '0' },
      data: { roleId: 82580, accountInfo }
    })
    .afterClosed()
    .subscribe((data) => {
      if (data) {
        this.getPhysicianList();
      }
    });
  }


  openAddStaff(accountInfo?:any) { 
    this.dialog
    .open(AddStaffModalComponent, {
      width: '25rem',
      height: '100%',
      panelClass:'no-padding-popup',
      position: { right: '0' },
      data: { roleId: 0, accountInfo }
    })
    .afterClosed()
    .subscribe((data) => {
      if (data) {
        this.getStaffs();
      }
    });
  }

  onPageChange(index: any) {
    this.currentPage = index.pageIndex;
    this.pageSize = index.pageSize;
    this.getDoctorsList();
  }

  onStaffPageChange(index: any) {
    this.staffCurrentPage = index.pageIndex;
    this.pageSize = index.pageSize;
    this.getStaffs();
  }

  filterData(val: any) {
    this.filterVal = val;
    this.filterSubject.next(val);
    console.log(this.filterVal)
  }

  filterStaffData(val: any) {
    this.filterStaffVal = val;
    this.filterStaffSubject.next(val);
  }

  sortData(event: any) {
    this.sortBy = event.active;
    this.sortDirection = event.direction;
    this.getDoctorsList();
  }

  downloadData() {
    this.getAllRecords();
  }

  downloadStaffData() {
    this.getAllStaffRecords();
  }

  getAllStaffRecords() {
    const url = `api/User/GetHospitalbasedStaff`;
    const body = {
      roleid: 5,
      allrecords: true,
      pageSize: 0,
      pageNo: 0,
      searchtext: '',
      fromdate: null,
      todate: null,
      sortBy: '',
      sortDirection: '',
      userid: this.adminInfo.user_id

    };
    this.httpService.create(url, body).subscribe((res: any) => {
      const usersData = res.data?.userdata;
      if (usersData.length > 0) {
        usersData.map((data: any) => {
          const fullName = data.first_name + ' ' + data.last_name;
          const date = new Date(data.created_on).getDate();
          const month = new Date(data.created_on).getMonth() + 1;
          const year = new Date(data.created_on).getFullYear();
          const regDate = date + '/' + month + '/' + year;
          const importData = [
            fullName,
            data.mobile_no,
            regDate,
            data.email_address,
            data.current_statusId,
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

  getAllRecords() {
    const url = `api/User/GetHospitalbasedUsers`;
    const body = {
      roleid: 5,
      allrecords: true,
      pageSize: 0,
      pageNo: 0,
      searchtext: '',
      fromdate: null,
      todate: null,
      sortBy: '',
      sortDirection: '',
      userid: this.adminInfo.user_id

    };
    this.httpService.create(url, body).subscribe((res: any) => {
      const usersData = res.data?.userdata;
      if (usersData.length > 0) {
        usersData.map((data: any) => {
          const fullName = data.first_name + ' ' + data.last_name;
          const date = new Date(data.created_on).getDate();
          const month = new Date(data.created_on).getMonth() + 1;
          const year = new Date(data.created_on).getFullYear();
          const regDate = date + '/' + month + '/' + year;
          const importData = [
            fullName,
            data.mobile_no,
            regDate,
            data.email_address,
            data.current_statusId,
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

  SaveActivity(firstName: string,lastName: string, statusId: any,roleName:any) {
    const name = firstName +" " + lastName;
    const body = {
      activityid: 0,
      userid: this.adminInfo.user_id,
      titlename: statusId === 0 ? "Member removed from the team" : statusId === 27 ? "Member Activated" : "Member Deactivated",
      descriptionname: statusId === 0 ? "Removed <b>"+ name +` - ${roleName}` : statusId === 27 ? "You have Activate <b>"+ name +" - Researcher </b>" : "Deactivated <b> "+ name +" - Researcher </b>",
      createdby: this.adminInfo.user_id,
      categoryname: statusId === 0 ? "DeleteUser" : "UserStatus"
    };
    const url = `api/PatientRegistration/CreateActivity`;
    this.httpService.create(url, body).subscribe((res: any) => { },
      (error: any) => { console.log('error', error); });
  }

  onStatusChange() {
    this.getDoctorsList();
  }

  onStatusStaffChange() {
    this.getStaffs();
  }
  onTabChanged(ev){
    this.filterVal = '';
    this.filterStaffVal = '';
    this.filterSubject.next(this.filterVal);
    this.filterStaffSubject.next(this.filterStaffVal);
  }

}

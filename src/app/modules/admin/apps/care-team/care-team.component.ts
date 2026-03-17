import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, merge, Observable, Subject } from 'rxjs';
import { debounceTime, map, switchMap, takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { InventoryBrand, InventoryCategory, InventoryPagination, InventoryProduct, InventoryTag, InventoryVendor } from 'app/modules/admin/apps/users/users.types';
import { CareTeamService } from 'app/modules/admin/apps/care-team/care-team.service';
import { ViewCareTeamComponent } from './view-care-team/view-care-team.component';
import { CustomSnackbarService } from '../../../../core/snackbar/snackbar.service';
import { APIService } from 'app/core/api/api';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'app/core/auth/auth.service';
import { AddUserModalComponent } from '../add-user-modal/add-user-modal.component';
import * as XLSX from 'xlsx';

@Component({
  selector: 'care-team',
  templateUrl: './care-team.component.html',
  styles: [
    /* language=SCSS */
    `
      .inventory-grid.care-team-grid {
        grid-template-columns: 48px auto 40px;

        @screen sm {
          grid-template-columns: 48px auto 112px 72px;
        }

        @screen md {
          grid-template-columns: 48px 112px auto 112px 72px;
        }

        @screen lg {
          grid-template-columns: 20% 15% 20% 15% 10% 17%;
        }
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: fuseAnimations,
})
export class CareTeamComponent implements OnInit {
  @ViewChild(MatPaginator) private _paginator: MatPaginator;
  @ViewChild(MatSort) private _sort: MatSort;

  careTeamList$ = new BehaviorSubject<any>(null);
  adminInfo: any;
  pageSize = 10;
  currentPage = 0;
  filterVal = '';
  filterSubject = new Subject();
  totalRecords$ = new BehaviorSubject<any>(null);
  fromDate: Date;
  dateForm: FormGroup;
  sortDirection = '';
  sortBy = '';
  fileName = 'Careteam.xlsx';
  uploadData: any = [];

  constructor(
    private _fuseConfirmationService: FuseConfirmationService,
    public dialog: MatDialog,
    private httpService: APIService,
    private snackBar: MatSnackBar,
    private auth: AuthService,
    private fb: FormBuilder
  ) {
    this.adminInfo = JSON.parse(this.auth.user);
  }

  ngOnInit(): void {
    this.initForm();
    this.getCareTeamList();
    this.filterSubject
      .pipe(
        debounceTime(500),
        map((val) => {
          this.getCareTeamList();
        })
      )
      .subscribe();
  }

  getCareTeamList() {
    const url = `api/User/GetUsers`;
    const body = {
      roleid: 4,
      pageSize: this.pageSize,
      pageNo: this.currentPage + 1,
      searchtext: this.filterVal,
      fromdate: this.dateForm.get('fromDate').value
        ? new Date(this.dateForm.get('fromDate').value).toISOString()
        : null,
      todate: this.dateForm.get('toDate').value
        ? new Date(this.dateForm.get('toDate').value).toISOString()
        : null,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    };
    this.httpService.create(url, body).subscribe((res: any) => {
      this.careTeamList$.next(res.data.userdata);
      this.totalRecords$.next(res.data.totalrecords);
    });
  }

  initForm() {
    this.dateForm = this.fb.group({
      fromDate: [''],
      toDate: [''],
    });
    this.dateForm.valueChanges.subscribe((data: any) => {
      this.getCareTeamList();
    });
  }

  deleteSelectedCareTeam(careTeam: any): void {
    // Open the confirmation dialog
    const confirmation = this._fuseConfirmationService.open({
      title: 'Delete Care Team',
      message: 'Are you sure you want to remove? This action cannot be undone!',
      actions: {
        confirm: {
          label: 'Delete',
        },
      },
    });

    // Subscribe to the confirmation dialog closed action
    confirmation.afterClosed().subscribe((result) => {
      if (result === 'confirmed') {
        const url = `api/User/DeleteUser?userId=${careTeam.user_id}&actionBy=${this.adminInfo.user_id}`;
        this.httpService.create(url, {}).subscribe(
      (res: any) => {
        this.getCareTeamList();
        this.SaveActivity(careTeam?.first_name,careTeam?.last_name,0);
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

  viewDetails(careTeam: InventoryProduct, action: string) {
    const dialogRef = this.dialog.open(ViewCareTeamComponent, {
      width: '40rem',
      height: '100%',
      position: { right: '0' },
      panelClass: 'view-details-form',
      data: { careTeam, action },
    }).afterClosed().subscribe((data: any) => {
      if(data){
        this.getCareTeamList();
      }
    });;
  }

  changeStatus(data: any) {
    console.log(data);
    if (data.current_statusId === 27) {
      this.updateUserStatus(data.user_id, 28);
      this.SaveActivity(data?.first_name, data?.last_name, 28);
    } else if (data.current_statusId === 28) {
      this.updateUserStatus(data.user_id, 27);
      this.SaveActivity(data?.first_name, data?.last_name, 27);
    }
  }

  updateUserStatus(userId: any, statusId: any) {
    const url = `api/User/UpdateUserStatus?userId=${userId}&statusId=${statusId}`;
    this.httpService.create(url, {}).subscribe((res: any) => {
      this.snackBar.open('Status updated successfully.', 'close', {
        panelClass: "snackBarSuccess",
        duration: 2000,
      });
      this.getCareTeamList();
    },
    (error: any) => {
        console.log('error', error);
    });
  }

  openAddUser() {
    this.dialog
      .open(AddUserModalComponent, {
        width: '25rem',
        height: '100%',
        panelClass:'no-padding-popup', 
        position: { right: '0' },
        data: { roleId: 4 }
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.getCareTeamList();
        }
      });
  }

  onPageChange(index: any) {
    this.currentPage = index.pageIndex;
    this.pageSize = index.pageSize;
    this.getCareTeamList();
  }

  filterData(val: any) {
    this.filterVal = val;
    this.filterSubject.next(val);
  }

  sortData(event: any) {
    this.sortBy = event.active;
    this.sortDirection = event.direction;
    this.getCareTeamList();
  }

  downloadData() {
    this.getAllRecords();
  }

  getAllRecords() {
    const url = `api/User/GetUsers`;
    const body = {
      roleid: 4,
      allrecords: true,
      pageSize: 0,
      pageNo: 0,
      searchtext: '',
      fromdate: null,
      todate: null,
      sortBy: '',
      sortDirection: '',
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

  SaveActivity(firstName: string,lastName: string, statusId: any) {
    const name = firstName +" " + lastName;
    const body = {
      activityid: 0,
      userid: this.adminInfo.user_id,
      titlename: statusId === 0 ? "Member removed from the team" : statusId === 27 ? "Member Activated" : "Member Deactivated",
      descriptionname: statusId === 0 ? "Removed <b>"+ name +" - Care Supporter" : statusId === 27 ? "Activated <b>"+ name +" - Care Supporter </b>" : "Deactivated <b> "+ name +" - Care Supporter </b>",
      createdby: this.adminInfo.user_id,
      categoryname: statusId === 0 ? "DeleteUser" : "UserStatus"
    };
    const url = `api/PatientRegistration/CreateActivity`;
    this.httpService.create(url, body).subscribe((res: any) => { },
      (error: any) => { console.log('error', error); });
  }

}

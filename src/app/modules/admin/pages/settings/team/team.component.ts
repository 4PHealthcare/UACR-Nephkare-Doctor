import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FuseConfirmationService } from "@fuse/services/confirmation";
import { APIService } from "app/core/api/api";
import { AuthService } from "app/core/auth/auth.service";
import { BehaviorSubject } from "rxjs";
import { AddUserComponent } from "../add-user/add-user.component";

@Component({
  selector: "settings-team",
  templateUrl: "./team.component.html",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsTeamComponent implements OnInit {
  membersInfo$ = new BehaviorSubject<any>(null);
  roles$ = new BehaviorSubject<any>(null);
  adminInfo: any;
  filterdata: any;
  roleId1 = [
    {
      "masterdata_id": 2,
      "data_name": "Admin"
    },
    {
      "masterdata_id": 4,
      "data_name": "Care Team"
    },
    {
      "masterdata_id": 5,
      "data_name": "Doctor"
    },
    {
      "masterdata_id": 6,
      "data_name": "Customer Support"
    }
  ];
  roleId2= [
    {
      "masterdata_id": 4,
      "data_name": "Care Team"
    },
    {
      "masterdata_id": 5,
      "data_name": "Doctor"
    },
    {
      "masterdata_id": 6,
      "data_name": "Customer Support"
    }
  ];

  /**
   * Constructor
   */
  constructor(
    public dialog: MatDialog,
    private httpService: APIService,
    private auth: AuthService,
    private snackBar: MatSnackBar,
    private _fuseConfirmationService: FuseConfirmationService
  ) {
    this.adminInfo = JSON.parse(this.auth.user);
  }

  ngOnInit(): void {
    this.getRolesById();
    this.getTeamUsers(this.adminInfo.user_id);
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

  openAddUser() {
    this.dialog.open(AddUserComponent, {
      width: "25rem",
      height: "100%",
      panelClass:'no-padding-popup',
      position: { right: "0" },
    }).afterClosed().subscribe((data) => {
      if(data) {
        this.getTeamUsers(this.adminInfo.user_id);
      }
    });
  }

  getTeamUsers(userId: number) {
    this.httpService
      .get("api/User/GetAdminTeamUsers?userId=", userId)
      .subscribe(
        (res: any) => {
          this.membersInfo$.next(res.data.filter(f=>f.role_id === 2));
        },
        (error: any) => {
          console.warn("error", error);
        }
      );
  }

  getRoles() {
    this.httpService
      .getAll("api/User/GetMasterData?mastercategoryid=2")
      .subscribe((res: any) => {
        this.roles$.next(res);
      });
  }

  changeRole(roleId: any, user: any) {
    console.log("event", roleId, user);
    // this.updateUserRole(user.user_id, roleId);
  }

  updateUserRole(userId: any, roleId: any) {
    const url = `api/User/UpdateUserStatus?userId=${userId}&statusId=${roleId}`;
    this.httpService.create(url, {}).subscribe(
      (res: any) => {
        console.warn("user info", res);
        this.snackBar.open('User status updated successfully. ', 'close', {
          panelClass: "snackBarSuccess",
          duration: 2000,
        });
      },
      (error: any) => {
        console.log('callong');
        console.warn("error", error);
        this.snackBar.open(error, 'close', {
          panelClass: "snackBarFailure",
          duration: 2000,
        });
      }
    );
  }

  openDeleteModal(user: any) {
    const confirmation = this._fuseConfirmationService.open({
      title: 'Delete Team User',
      message: 'Are you sure you want to remove? This action cannot be undone!',
      actions: {
        confirm: {
          label: 'Delete',
        },
      },
    });

    confirmation.afterClosed().subscribe((result) => {
      if (result === 'confirmed') {
        const url = `api/User/DeleteUser?userId=${user.user_id}&actionBy=${this.adminInfo.user_id}`;
        this.httpService.create(url, {}).subscribe(
          (res: any) => {
            this.getTeamUsers(this.adminInfo.user_id);
            this.SaveActivity(user?.first_name, user?.last_name, user.role_id);
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
          }
        );
      }
    });
  }

  getRolesById() {
    if(this.adminInfo.role_id === 1) {
      this.roles$.next(this.roleId1);
    }
    else if (this.adminInfo.role_id === 2) {
     this.roles$.next(this.roleId2);
    }
    else {
      this.roles$.next([]);
    }
  }

  editUser(user: any, action: string) {
    this.dialog.open(AddUserComponent, {
      width: "25rem",
      height: "100%",
      panelClass:'no-padding-popup',
      position: { right: "0" },
      data: { user, action },
    }).afterClosed().subscribe((data) => {
      if(data) {
        this.getTeamUsers(this.adminInfo.user_id);
      }
    });

  }

  SaveActivity(firstName: string,lastName: string, roleId: any) {
    const roleName = this.roles$.value.find(f=>f.masterdata_id === roleId).data_name;
    const name = firstName +" " + lastName;
    const body = {
      activityid: 0,
      userid: this.adminInfo.user_id,
      titlename: "Member removed from the team",
      descriptionname: "Removed <b>"+ name +" - "+roleName,
      createdby: this.adminInfo.user_id,
      categoryname: "DeleteUser"
    };
    const url = `api/PatientRegistration/CreateActivity`;
    this.httpService.create(url, body).subscribe((res: any) => { },
      (error: any) => { console.log('error', error); });
  }
}

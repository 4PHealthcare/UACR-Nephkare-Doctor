import { Component, Inject, OnInit, ViewEncapsulation } from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { APIService } from "app/core/api/api";
import { AuthService } from "app/core/auth/auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: 'app-add-user-modal',
  templateUrl: './add-user-modal.component.html',
  styleUrls: ['./add-user-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddUserModalComponent implements OnInit {

  userForm: FormGroup;
  userInfo: any;
  editMode: boolean = false;

  roles= [
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

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<any>,
    private _formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private httpService: APIService,
    private auth: AuthService,
    private snackBar: MatSnackBar) {
    this.userInfo = JSON.parse(this.auth.user);
  }

  ngOnInit(): void {
    this.userForm = this._formBuilder.group({
      firstName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      mobileNumber: [
        null,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10),
          Validators.pattern('[6-9]\\d{9}')
        ],
      ],
      roleId: [this.data ? this.data.roleId: null, [Validators.required]],
    });
  }

  addUser() {
    const body = {
      userid: 0,
      username: this.userForm.get("email").value,
      password: 'test@1234',
      firstname: this.userForm.get("firstName").value,
      lastname: this.userForm.get("lastName").value,
      emailaddress: this.userForm.get("email").value,
      mobileno: this.userForm.get("mobileNumber").value,
      roleid: parseInt(this.userForm.get("roleId").value),
      actionby: this.userInfo.user_id,
      appname: "HWR"
    };
    this.httpService.create("api/User/AddUser", body).subscribe(
      (res: any) => {
        this.dialogRef.close(true);
        this.SaveActivity();
        this.snackBar.open('User added successfully. ', 'close', {
          panelClass: "snackBarSuccess",
          duration: 2000,
        });
      },
      (error: any) => {
        console.warn("error", error);
      }
    );
  }

  SaveActivity() {
    const roleId= parseInt(this.userForm.get("roleId").value);
    const roleName = this.roles.find(f=>f.masterdata_id === roleId).data_name;
    const body = {
      activityid: 0,
      userid: this.userInfo.user_id,
      titlename: "Added new member",
      descriptionname: "Added <b>"+this.userForm.get("firstName").value+ " "+ this.userForm.get("lastName").value +"</b> as <b>"+roleName +"</b>",
      createdby: this.userInfo.user_id,
      categoryname: "AddUser"
    };
    const url = `api/PatientRegistration/CreateActivity`;
    this.httpService.create(url, body).subscribe((res: any) => { },
      (error: any) => { console.log('error', error); });
  }

}

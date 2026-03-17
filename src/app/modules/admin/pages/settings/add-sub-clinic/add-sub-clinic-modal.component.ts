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
import { UserService } from "app/core/user/user.service";

@Component({
  selector: 'app-add-sub-clinic-modal',
  templateUrl: './add-sub-clinic-modal.component.html',
  styleUrls: ['./add-sub-clinic-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddSubClinicModalComponent implements OnInit {

  userForm: FormGroup;
  userInfo: any;
  editMode: boolean = false;
  userActionLoading:boolean = false;
  mimetype:string;
  filename:any;
  fileBase64:any; 
  photo:any;
  isDataUpdated:boolean = false;
  isPhotoUpdated:boolean = false;
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
    },
    {
      "masterdata_id": 478,
      "data_name": "Hospital Admin"
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
      // firstName: ["", [Validators.required]],
      // lastName: ["", [Validators.required]],
      contactPersonName: ['', []],
      hospitalName: ['', [Validators.required]],
      cityName: ['', [Validators.required]]
    });

    if(this.data && this.data.accountInfo) {
      this.patchForm(this.data.accountInfo);
    }
  }

  patchForm(data: any) {

    this.userForm.patchValue({
      contactPersonName: data.contact_person,
      hospitalName: data.clinic_name,
      cityName: data.city
    });
    if(data.photo_folderpath && data.photo_filename) {
      this.photo = `https://hellokidneydata.s3.ap-south-1.amazonaws.com/${data.photo_folderpath}/${data.photo_filename}`;
    }
  }

  addUser() {
    this.userActionLoading = true;
    
    let body = {
      clinicid: this.data && this.data.accountInfo ? this.data.accountInfo.clinicid  : 0,
      clinicname: this.userForm.get("hospitalName").value, 
      cityname: this.userForm.get("cityName").value,
      contactperson: this.userForm.get("contactPersonName").value,
      mainbranchid: this.userInfo.user_id,
      createdby: this.userInfo.user_id,
      isphoto_updated : false
    };

    // Update the user
  

    if (this.isPhotoUpdated && this.fileBase64) {
      body['photo'] = {
        "patientreportid": 0,
        "filename": this.filename,
        "mimetype": this.mimetype,
        "fileBase64": this.fileBase64    
      };
      body.isphoto_updated = this.isPhotoUpdated;
    }
    this.httpService.create("api/User/AddSubClinics", body).subscribe(
      (res: any) => {

        if(res?.isSuccess) {
          this.dialogRef.close(true);
          this.SaveActivity();
          this.snackBar.open('User added successfully. ', 'close', {
            panelClass: "snackBarSuccess",
            duration: 2000,
          });         
        }else {
          this.snackBar.open(res.data, 'close', {
            panelClass: "snackBarWarning",
            duration: 2000,
          });
        }

        this.isDataUpdated = true;

        this.userActionLoading = false;
      },
      (error: any) => {
        this.userActionLoading = false;
        console.warn("error", error);
      }
    );
  }

  SaveActivity() {

    const body = {
      activityid: 0,
      userid: this.userInfo.user_id,
      titlename: "Added new Sub Clinic",
      descriptionname: "Added <b>"+this.userForm.get("hospitalName").value,
      createdby: this.userInfo.user_id,
      categoryname: "AddClinic"
    };
    const url = `api/PatientRegistration/CreateActivity`;
    this.httpService.create(url, body).subscribe((res: any) => { },
      (error: any) => { console.log('error', error); });
  }

  clearInput(event?:any) {
    if(event) {
      event.value = '';
    }
    this.fileBase64 = undefined;
    this.mimetype = undefined;
    this.filename = undefined;
    this.photo = undefined;
  }

  onSelectFile(event) {
    
    this.clearInput();
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      
      let file = event.target.files[0];
     
      reader.onload = function (event: any) {
        this.photo = event.target.result;
        this.disable_btn=false;
        const base64Content = this.photo;
        let base64ContentArray = base64Content.split(",");
        let mimeType = base64ContentArray[0].match(
          /[^:\s*]\w+\/[\w-+\d.]+(?=[;| ])/
        )[0];
        let base64Data = base64ContentArray[1];
        this.fileBase64=base64Data;
        this.mimetype=mimeType;
        this.filename=file.name;
        this.uploaded = false;
        this.isPhotoUpdated = true;
        
      }.bind(this);
      
      reader.readAsDataURL(file); 
      
    }
  }

}

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewEncapsulation,
  ChangeDetectorRef,
} from "@angular/core";

import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FuseConfirmationService } from "@fuse/services/confirmation";
import { APIService } from "app/core/api/api";
import { AuthService } from "app/core/auth/auth.service";
import { UserService } from "app/core/user/user.service";
import { BehaviorSubject, Subject } from "rxjs";
import { AddHospitalLicenseModalComponent } from "../add-hospital-license/add-hospital-license-modal.component";
import { AddSubClinicModalComponent } from "../add-sub-clinic/add-sub-clinic-modal.component";

@Component({
  selector: "settings-clinic-profile",
  templateUrl: "./clinic-profile.component.html",
  styleUrls: ["./clinic-profile.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsClinicProfileComponent implements OnInit {
  userInfo: any;
  accountInfo$ = new BehaviorSubject<any>([]);
 
  subClinic$ = new BehaviorSubject<any>([]);
  // photo:string;
  host: string = "https://hellokidneydata.s3.ap-south-1.amazonaws.com/";
  constructor(
    private httpService: APIService,
    private auth: AuthService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private _userService: UserService,
    private _fuseConfirmationService: FuseConfirmationService
  ) {
    this.userInfo = JSON.parse(this.auth.user);
  }

  ngOnInit(): void {
    // Create the form
    console.log(this.uploaded);
    this.getUserInfo(this.userInfo.user_id, true);
    this.getSubClinics(this.userInfo.user_id);
    // this.getHeaderFooterBanners(this.userInfo.user_id)
  }

  getUserInfo(userId: number, initial:boolean) {
    this.httpService.get("api/User/GetUsersById?userId=", userId).subscribe(
      (res: any) => {
        if (res.data) {
          this.accountInfo$.next(res.data);
          if (res.data.logo_folderpath && res.data.logo_filename) {
            this.photo = `https://hellokidneydata.s3.ap-south-1.amazonaws.com/${res.data.logo_folderpath}/${res.data.logo_filename}`;
           
            if (!initial) {
              this._userService.update({
                ...res.data,
                photo_filename:res.data.photo_filename, 
                photo_folderpath:res.data.photo_folderpath
            }).subscribe();
            }
           
          }

         
          
        }
      },
      (error: any) => {
        console.warn("error", error);
      }
    );
  }

  getSubClinics(userId: number) {
    this.subClinic$.next([]);
    this.httpService
      .get("api/User/GetSubClinics?mainbranchid=", userId)
      .subscribe(
        (res: any) => {
          if (res.data) {
            this.subClinic$.next(res.data);
          }
        },
        (error: any) => {
          console.warn("error", error);
        }
      );
  }

  addSubClinic(accountInfo?: any) {
    this.dialog
      .open(AddSubClinicModalComponent, {
        width: "25rem",
        height: "100%",
        panelClass:'no-padding-popup',
        position: { right: "0" },
        data: { roleId: 478, accountInfo },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.getSubClinics(this.userInfo.user_id);
        }
      });
  }

  editHospitalLicense(accountInfo: any) {
    console.log(accountInfo);
    this.dialog
      .open(AddHospitalLicenseModalComponent, {
        width: "50rem",
        height: "100%",
        panelClass:'no-padding-popup',
        position: { right: "0" },
        data: { roleId: 5, accountInfo },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.getUserInfo(this.userInfo.user_id, false);
        }
      });
  }

  deleteClinic(account: any) {
    const confirmation = this._fuseConfirmationService.open({
      title: "Delete Clinic / Hospital",
      message: "Are you sure you want to remove? This action cannot be undone!",
      actions: {
        confirm: {
          label: "Delete",
        },
      },
    });

    confirmation.afterClosed().subscribe((result) => {
      if (result === "confirmed") {
        const url = `api/User/DeleteSubclinic?id=${account.clinicid}`;
        this.httpService.create(url, {}).subscribe(
          (res: any) => {
            this.getSubClinics(this.userInfo.user_id);
            this.snackBar.open(
              "Clinic / Hospital deleted successfully.",
              "close",
              {
                panelClass: "snackBarSuccess",
                duration: 2000,
              }
            );
          },
          (error: any) => {
            this.snackBar.open(error, "close", {
              panelClass: "snackBarFailure",
              duration: 2000,
            });
          }
        );
      }
    });
  }

  // Header and footer Code
  disable_btn = true;
  uploaded = false;
  photo: any;

  header: any;
  mimetype: any;
  filename: any;
  fileBase64: any;
 
  footer: any;
  footer_mimetype: any;
  footer_filename: any;
  footer_fileBase64: any;
  size: any;
  width: any;
  height: any;
  headerId:any;
  footerId:any;

  onMouseEnter() {
    this.uploaded = false;
  }
  onSelectFile(event?:any) {
    if (event?.target?.files && event?.target?.files[0]) {
      var reader = new FileReader();

      let file = event.target.files[0];
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = function (event: any) {
        
        const image = new Image();
        image.src = event.target.result;
        
        image.onload = () => {
          console.log(image.width);
            console.log(image.height);
          // if (( image.width >= 799 || image.width <= 801) && (image.height >= 143 || image.height <= 145)) {
            
          //   alert("Dimensions should not exceed width:800px, Height: 144px;");
          //   return false;
          // } else {
            this.header = event.target.result;
            this.disable_btn = false;
            const base64Content = this.header;
            let base64ContentArray = base64Content.split(",");
            let mimeType = base64ContentArray[0].match(
              /[^:\s*]\w+\/[\w-+\d.]+(?=[;| ])/
            )[0];
            let base64Data = base64ContentArray[1];
            this.fileBase64 = base64Data;
            this.mimetype = mimeType;
            this.filename = file.name;
            this.uploaded = false;
            this.accountForm.get("isPhotoUpdated").setValue(true);
            this.accountForm.controls.isPhotoUpdated.markAsDirty();
            this.accountForm.updateValueAndValidity({
              emitEvent: false,
              onlySelf: true,
            });
            this.cd.detectChanges();
          // }
        };
      }.bind(this);

      reader.readAsDataURL(file);
    }
  }
  
  public delete() {
    this.header = null;
  }
  onFooterSelectFile(event) {
    if (event.target?.files && event?.target.files[0]) {
      var reader = new FileReader();

      let file = event.target.files[0];
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = function (event: any) {
        
        const image = new Image();
        image.src = event.target.result;
        
        image.onload = () => {
          console.log(image.width);
          //   console.log(image.height);
          // if (( image.width >= 799 || image.width <= 801) && (image.height >= 71 || image.height <= 73)) { 
            
          //   alert("Dimensions should not exceed width:800px, Height: 72px;");
          //   return false;
          // } else {
            this.footer = event.target.result;
            this.disable_btn = false;
            const base64Content = this.footer;
            let base64ContentArray = base64Content.split(",");
            let mimeType = base64ContentArray[0].match(
              /[^:\s*]\w+\/[\w-+\d.]+(?=[;| ])/
            )[0];
            let base64Data = base64ContentArray[1];
            this.footer_fileBase64 = base64Data;
        this.footer_mimetype = mimeType;
        this.footer_filename = file.name;
            this.uploaded = false;
            this.accountForm.get("isPhotoUpdated").setValue(true);
            this.accountForm.controls.isPhotoUpdated.markAsDirty();
            this.accountForm.updateValueAndValidity({
              emitEvent: false,
              onlySelf: true,
            });
            this.cd.detectChanges();
          // }
        };
      }.bind(this);

      reader.readAsDataURL(file);
    }
  }
  // onFooterSelectFile(event) {
  //   if (event.target.files && event.target.files[0]) {
  //     var reader = new FileReader();

  //     let file = event.target.files[0];
  //     console.log(file)
  //     this.size = file.size;
  //     reader.onload = function (event: any) {
  //       this.footer = event.target.result;
  //       this.disable_btn = false;
  //       const base64Content = this.footer;
  //       let base64ContentArray = base64Content.split(",");
  //       let mimeType = base64ContentArray[0].match(
  //         /[^:\s*]\w+\/[\w-+\d.]+(?=[;| ])/
  //       )[0];
  //       let base64Data = base64ContentArray[1];
  //       this.footer_fileBase64 = base64Data;
  //       this.footer_mimetype = mimeType;
  //       this.footer_filename = file.name;
  //       this.uploaded = false;
  //       this.accountForm.get("isPhotoUpdated").setValue(true);
  //       this.accountForm.controls.isPhotoUpdated.markAsDirty();
  //       this.accountForm.updateValueAndValidity({
  //         emitEvent: false,
  //         onlySelf: true,
  //       });
  //       this.cd.detectChanges();
  //     }.bind(this);

  //     reader.readAsDataURL(file);
  //   }
  // }
  public footerDelete() {
    this.footer = null;
  }
  saveHeaderFooter() {
    let body =[
      {
        patientid : this.userInfo.user_id,
        typeid : 500,
        patientreportid : this.headerId?this.headerId:0,
        reportcategoryid : 499,
        filename : this.filename,
        fileBase64 : this.fileBase64,
        mimetype : this.mimetype,
        createdby : this.userInfo.user_id,
      },
      {
        patientid : this.userInfo.user_id,
        typeid : 501,
        patientreportid : this.footerId?this.footerId:0,
        reportcategoryid : 499,
        filename : this.footer_filename,
        fileBase64 : this.footer_fileBase64,
        mimetype : this.footer_mimetype,
        createdby : this.userInfo.user_id,
      }
    ]

    this.httpService.create("api/User/SaveReport", body).subscribe(
      (res: any) => {
        console.warn(res);

        this.snackBar.open("Header and Footer uploaded successfully.", "close", {
          panelClass: "snackBarSuccess",
          duration: 2000,
        });
      },
      (error: any) => {
        console.warn("error", error);
      }
    );
  }
  // getHeaderFooterBanners(userId: number) {
  //   this.httpService.get("api/User/GetPrescriptionBanner?userid=", userId).subscribe(
  //     (res: any) => {
  //        console.log(res.data) ;
  //       this.header =`https://hellokidneydata.s3.ap-south-1.amazonaws.com/${res.data[1].folder_path}/${res.data[1].file_name}`;
  //       this.footer =`https://hellokidneydata.s3.ap-south-1.amazonaws.com/${res.data[0].folder_path}/${res.data[0].file_name}`; 
  //       this.headerId=res.data[1].patientreport_id;
  //       this.footerId=res.data[0].patientreport_id;
  //     },
  //     (error: any) => {
  //       console.warn("error", error);
  //     }
  //   );
  // }
}

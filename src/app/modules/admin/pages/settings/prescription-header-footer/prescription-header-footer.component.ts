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
import { BehaviorSubject, Subject } from "rxjs";
import { AddHospitalLicenseModalComponent } from "../add-hospital-license/add-hospital-license-modal.component";
import { AddSubClinicModalComponent } from "../add-sub-clinic/add-sub-clinic-modal.component";

@Component({
  selector: "app-prescription-header-footer",
  templateUrl: "./prescription-header-footer.component.html",
  styleUrls: ["./prescription-header-footer.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionHeaderFooterComponent implements OnInit {
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
    private _fuseConfirmationService: FuseConfirmationService,
    private cd: ChangeDetectorRef
  ) {
    this.userInfo = JSON.parse(this.auth.user);
  }

  ngOnInit(): void {
    // Create the form
    console.log(this.uploaded);
    this.getUserInfo(this.userInfo.user_id);
    this.getSubClinics(this.userInfo.user_id);
    this.getHeaderFooterBanners(this.userInfo.user_id);
  }

  getUserInfo(userId: number) {
    this.httpService.get("api/User/GetUsersById?userId=", userId).subscribe(
      (res: any) => {
        if (res.data) {
          this.accountInfo$.next(res.data);
          if (res.data.photo_folderpath && res.data.photo_filename) {
            this.photo = `https://hellokidneydata.s3.ap-south-1.amazonaws.com/${res.data.photo_folderpath}/${res.data.photo_filename}`;
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
        panelClass: "no-padding-popup",
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
    this.dialog
      .open(AddHospitalLicenseModalComponent, {
        width: "25rem",
        height: "100%",
        panelClass: "no-padding-popup",
        position: { right: "0" },
        data: { roleId: 5, accountInfo },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.getUserInfo(this.userInfo.user_id);
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
  headerId: any;
  footerId: any;

  onMouseEnter() {
    this.uploaded = false;
  }
  onSelectFile(event) {
    if (event?.target?.files && event?.target?.files[0]) {
      let reader = new FileReader();

      let file = event.target.files[0];
      reader.onload = function (event: any) {
        const image = new Image();
        image.src = event.target.result;

        image.onload = () => {
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
          this.saveReport(500);
          this.cd.detectChanges();
          // }
        };
      }.bind(this);

      reader.readAsDataURL(file);
    }
  }

  clearInput(event?: any) {
    if (event) {
      event.value = "";
    }
    this.footer_fileBase64 = undefined;
    this.footer_mimetype = undefined;
    this.footer_filename = undefined;
  }

  public delete() {
    this.header = null;
  }
  onFooterSelectFile(event?: any) {
    if (event.target?.files && event?.target.files[0]) {
      let reader1 = new FileReader();

      let file = event.target.files[0];
      reader1.onload = function (event: any) {
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
          this.saveReport(501);

          this.cd.detectChanges();
          // }
        };
      }.bind(this);

      reader1.readAsDataURL(file);
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
  saveReport(typeId: number) {
    let payload;
    if (typeId == 500) {
      payload = {
        patientid: this.userInfo.user_id,
        typeid: 500,
        patientreportid: this.headerId ? this.headerId : 0,
        reportcategoryid: 499,
        filename: this.filename,
        fileBase64: this.fileBase64,
        mimetype: this.mimetype,
        createdby: this.userInfo.user_id,
      };
    } else if (typeId == 501) {
      payload = {
        patientid: this.userInfo.user_id,
        typeid: 501,
        patientreportid: this.footerId ? this.footerId : 0,
        reportcategoryid: 499,
        filename: this.footer_filename,
        fileBase64: this.footer_fileBase64,
        mimetype: this.footer_mimetype,
        createdby: this.userInfo.user_id,
      };
    }

    this.httpService.create("api/User/SaveReport", [payload]).subscribe(
      (res: any) => {
        console.warn(res);
        if(typeId == 500){
          this.snackBar.open(
            "Header uploaded successfully.",
            "close",
            {
              panelClass: "snackBarSuccess",
              duration: 2000,
            }
          );
        }
        else if (typeId == 501) {
          this.snackBar.open(
            "Footer uploaded successfully.",
            "close",
            {
              panelClass: "snackBarSuccess",
              duration: 2000,
            }
          );
        }
          
        this.getHeaderFooterBanners(this.userInfo.user_id);
      },
      (error: any) => {
        console.warn("error", error);
      }
    );
  }

  getHeaderFooterBanners(userId: number) {
    this.httpService
      .get("api/User/GetPrescriptionBanner?userid=", userId)
      .subscribe(
        (res: any) => {
          if (res.data) {
            let obj = res.data.find((o) => o.type_id === 500);
            let obj1 = res.data.find((o) => o.type_id === 501);

            if (obj) {
              this.header = `https://hellokidneydata.s3.ap-south-1.amazonaws.com/${obj.folder_path}/${obj.file_name}`;
              this.headerId = obj.patientreport_id;
            }
            if (obj1) {
              this.footer = `https://hellokidneydata.s3.ap-south-1.amazonaws.com/${obj1.folder_path}/${obj1.file_name}`;
              this.footerId = obj1.patientreport_id;
            }
            this.cd.detectChanges();
          }
        },
        (error: any) => {
          console.warn("error", error);
        }
      );
  }
  deleteHeader() {
    let reports: any = [];
    reports.push(this.headerId);
    const confirmation = this._fuseConfirmationService.open({
      title: "Delete Header",
      message:
        "Are you sure you want to delete header? This action cannot be undone!",
      actions: {
        confirm: {
          label: "Delete",
        },
      },
    });
    confirmation.afterClosed().subscribe((result) => {
      if (result === "confirmed") {
        const url = `api/Investigations/DeleteReport`;
        this.httpService.create(url, reports).subscribe(
          (res: any) => {
            if (res.data) {
             
               this.delete();
              this.getHeaderFooterBanners(this.userInfo.user_id);
              this.cd.detectChanges();
              this.snackBar.open("Header deleted successfully.", "close", {
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
  deleteFooter() {
    let reports: any = [];
    reports.push(this.footerId);
    const confirmation = this._fuseConfirmationService.open({
      title: "Delete Footer",
      message:
        "Are you sure you want to delete Footer? This action cannot be undone!",
      actions: {
        confirm: {
          label: "Delete",
        },
      },
    });
    confirmation.afterClosed().subscribe((result) => {
      if (result === "confirmed") {
        const url = `api/Investigations/DeleteReport`;
        this.httpService.create(url, reports).subscribe(
          (res: any) => {
            if (res.data) {
               this.footerDelete();
              this.getHeaderFooterBanners(this.userInfo.user_id);
               this.cd.detectChanges();
              this.snackBar.open("Footer deleted successfully.", "close", {
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
}

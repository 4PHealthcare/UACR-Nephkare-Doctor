import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  NgForm,
  Validators,
  FormControl,
  AbstractControl,
} from "@angular/forms";

import { MatSnackBar } from "@angular/material/snack-bar";
import { APIService } from "app/core/api/api";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import * as moment from "moment";

import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from "@angular/material-moment-adapter";
import { AuthService } from "app/core/auth/auth.service";
import { FuseConfirmationService } from "@fuse/services/confirmation";

export const MY_FORMATS = {
  parse: {
    dateInput: "LL",
  },
  display: {
    dateInput: "DD-MMM-YYYY",
    monthYearLabel: "YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "YYYY",
  },
};
@Component({
  selector: "app-doctor-fee",
  templateUrl: "./doctor-fee.component.html",
  styleUrls: ["./doctor-fee.component.scss"],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class DoctorFeeComponent implements OnInit {
  feeForm: FormGroup;
  submitted = false;
  userInfo: any;
  maxDate = new Date();
  toTimeError:boolean = false;
  fromTimeError:boolean = false;
  endTimeError:boolean  =  false;
  feesList: any[] = [];
  loading: boolean = false;
  isLoadingSpinner:Boolean=false;
  @ViewChild("feeNGForm") feeNGForm: NgForm;
  constructor(
    private _formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private auth: AuthService,
    private httpService: APIService,
    private cd: ChangeDetectorRef,
    private _fuseConfirmationService: FuseConfirmationService
  ) {
    this.userInfo = JSON.parse(this.auth.user);
  }

  

  ngOnInit(): void {
    this.feeForm = this._formBuilder.group({
      fromDate: ["", Validators.required],
      fromtime: [""],
      totime:[""]
    });
    this.getFeeslists(this.userInfo.user_id);

    this.feeForm.get('totime').valueChanges.subscribe(val => {
      this.endTimeError = false;
      this.fromTimeError = false;
      this.toTimeError = false;    
    });
    this.feeForm.get('fromtime').valueChanges.subscribe(val => {
      this.endTimeError = false;
      this.fromTimeError = false;
      this.toTimeError = false;
    });
  }

  checkTime() {
    let start = moment(this.feeForm.value.fromtime, ["h:mm A"]).format("HH:mm");
    let end = moment(this.feeForm.value.totime, ["h:mm A"]).format("HH:mm");    
    let startTime = moment([start], "HH:mm");
    let endTime = moment([end], "HH:mm");
    return startTime.isBefore(endTime);
  }
  get f(): { [key: string]: AbstractControl } {
    return this.feeForm.controls;
  }

  // Save Doctor Fee
  save() {
    this.isLoadingSpinner=true;
    const confirmation = this._fuseConfirmationService.open({
      title: "Leave apply",
      message:
        "Are you sure you want to apply leave? all your scheduled appointments will be lost!",
      actions: {
        confirm: {
          label: "Yes",
        },
      },
    });
    confirmation.afterClosed().subscribe((result) => {
      if (result === "confirmed") {

        let msg = 'Please enter from time';
        let date = moment(this.feeForm.controls.fromDate.value).format('YYYY-MM-DD');
        
        if (this.feeForm.controls.fromtime.value && !this.feeForm.controls.totime.value) {
         
          this.toTimeError = true;
          msg = 'Please enter to time';
          
        } else if(!this.feeForm.controls.fromtime.value && this.feeForm.controls.totime.value){
         
          this.fromTimeError = true;
          msg = 'Please enter from time';
        }

        if((this.feeForm.controls.fromtime.value && this.feeForm.controls.totime.value) && !this.checkTime()) {
          this.endTimeError = true;
          msg = 'To time should be greater than from time';
        }

        if ( !(this.toTimeError || this.fromTimeError || this.endTimeError) ) {
          let fromTime = this.feeForm.controls.fromtime.value ? this.feeForm.controls.fromtime.value: '12:00 AM';
          let toTime = this.feeForm.controls.totime.value ? this.feeForm.controls.totime.value : '11:59 PM';

          let fromDateTime = moment(date + ' ' + fromTime, 'YYYY-MM-DD HH:mm a');
          let todateTime = moment(date + ' ' + toTime, 'YYYY-MM-DD HH:mm a');

          const body = {
            doctor_id: this.userInfo.user_id,
            from_date: fromDateTime.format("YYYY-MM-DD[T]HH:mm:ss"),
            to_date: todateTime.format("YYYY-MM-DD[T]HH:mm:ss"),
            created_by: this.userInfo.user_id,
            is_fullday: this.feeForm.controls.fromtime.value && this.feeForm.controls.totime.value ? false : true
          };

          this.httpService.create("api/DoctorLeaves/AddDoctorLeave", body).subscribe(
          (res: any) => {
            this.isLoadingSpinner=false;
            console.warn(res);
            if (res.data) {
              this.clear();
              this.getFeeslists(this.userInfo.user_id);
              this.snackBar.open("Doctor leave saved successfully.", "close", {
                panelClass: "snackBarSuccess",
                duration: 2000,
              });
              
            }
          },
          (error: any) => {
            console.warn("error", error);
          }
        );

        } else {
          this.snackBar.open(msg, "close", {
            panelClass: "snackBarFailure",
            duration: 2000,
          });
        }
        // Mark for check
        this.cd.markForCheck();



        
        
      }
    });
    
  }

  // Get Fees List
  getFeeslists(userId: number) {
    this.loading = true;
    this.httpService
      .get("api/DoctorLeaves/GetDoctorleaves?doctor_id=", userId)
      .subscribe(
        (res: any) => {
          this.feesList = res.data ? res.data : [];
          console.log(this.feesList);
          this.cd.detectChanges();
        },
        (error: any) => {
          console.warn("error", error);
        }
      );
  }

  // Delete Fee
  deleteRecord(id: number) {
    const confirmation = this._fuseConfirmationService.open({
      title: "Cancel Leave",
      message:
        "Are you sure you want to cacel leave? This action cannot be undone!",
      actions: {
        confirm: {
          label: "Yes",
        },
        cancel: {
          label: "No",
        },
      },
    });
    confirmation.afterClosed().subscribe((result) => {
      if (result === "confirmed") {
        const url = `api/DoctorLeaves/DeleteLeave?doctorleave_id=` + id;
        this.httpService.create(url,null).subscribe(
          (res: any) => {
            if (res?.isSuccess) {
              this.getFeeslists(this.userInfo.user_id);
              this.clear();
              // this.getMedicalHistory();
              this.snackBar.open(
                "Doctor leave deleted successfully. ",
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
  clear(){
    this.feeForm.reset();
    this.fromTimeError = false;
    this.toTimeError = false;
    this.endTimeError = false;
  }
  /**
   * Lets the user click on the icon in the input.
   */
   openFromIcon(timepicker: { open: () => void }) {
    timepicker.open();
}
}

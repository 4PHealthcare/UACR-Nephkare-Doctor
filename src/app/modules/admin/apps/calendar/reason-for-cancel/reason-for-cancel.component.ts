import { Component, OnInit, Input, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FuseConfirmationConfig } from "@fuse/services/confirmation";
import { APIService } from "app/core/api/api";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { AuthService } from "app/core/auth/auth.service";

@Component({
  selector: "app-reason-for-cancel",
  templateUrl: "./reason-for-cancel.component.html",
  styleUrls: ["./reason-for-cancel.component.scss"],
})
export class ReasonForCancelComponent implements OnInit {
  patientId: any;
  reasonForm: FormGroup;
  userInfo: any;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: FuseConfirmationConfig,
    private httpService: APIService,
    private snackBar: MatSnackBar,
    private _matDialogRef: MatDialogRef<ReasonForCancelComponent>,
    private auth: AuthService,
  ) {
    this.userInfo = JSON.parse(this.auth.user);
  }

  ngOnInit(): void {
    console.log(this.userInfo)
    console.log(this.data);
    this.patientId = this.data;
    // console.log(this.patientId);
    this.reasonForm = new FormGroup({
      reason: new FormControl("", [Validators.required]),
    });
  }

  deleteAppointment() {
    const url = `api/Doctor/BookAppointment`;
    console.log(this.patientId.patientData)
    const body = {
      calenderid: this.patientId.patientData.calender_id ? this.patientId.patientData.calender_id : this.patientId.patientData.appointment_id,
      patientid: this.patientId.patientData.patient_id ? this.patientId.patientData.patient_id : this.patientId.patientData.user_id,
      scheduledate: this.patientId.patientData.appointment_date,
      doctorid: this.patientId.patientData.doctor_id,
      statusid: 13,
      scheduletypeid: this.patientId.patientData.appointment_typeid ? this.patientId.patientData.appointment_typeid : 73,
      descriptionname: this.reasonForm.get("reason").value,
      scheduledby: this.patientId.patientData.doctor_id ? this.patientId.patientData.doctor_id : this.userInfo.user_id,
      createdby: this.patientId.patientData.doctor_id ? this.patientId.patientData.doctor_id : this.userInfo.user_id,
    };
    this.httpService.create(url, body).subscribe(
      (res: any) => {
        console.log(body);
        if(res.isSuccess){
          this._matDialogRef.close(true);
          this.snackBar.open("Appointment canceled successfully. ", "close", {
            panelClass: "snackBarSuccess",
            duration: 2000,
          });
        }
        else{
          this.snackBar.open(res.message, "close", {
            panelClass: "snackBarWarning",
            duration: 2000,
          });
          this._matDialogRef.close(true);
        }
        
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }
  dismiss(){
    this._matDialogRef.close();
  }
}

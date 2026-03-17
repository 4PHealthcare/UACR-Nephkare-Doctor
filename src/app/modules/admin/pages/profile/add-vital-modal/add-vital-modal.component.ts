import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  NgForm,
  Validators,
  FormControl,
  AbstractControl,
} from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { APIService } from "app/core/api/api";
import * as moment from "moment";
import { DataService } from "app/core/user/user.resolver";

import { Subscription } from "rxjs";

@Component({
  selector: "app-add-vital-modal",
  templateUrl: "./add-vital-modal.component.html",
  styleUrls: ["./add-vital-modal.component.scss"],
})
export class AddVitalModalComponent implements OnInit {
  vitalForm: FormGroup;
  systolicSubscription: Subscription;
  diastolicSubscription: Subscription;
  submitted = false;
  @ViewChild("vitalNGForm") vitalNGForm: NgForm;

  // qualities$ = new BehaviorSubject<any>(null);
  // duration$ = new BehaviorSubject<any>(null);
  // timings$ = new BehaviorSubject<any>(null);
  qualities: any;
  duration: any;
  timings: any;
  editMode = false;
  isLoadingSpinner:boolean=false;
  constructor(
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private httpService: APIService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    // Create the form
    // this.vitalForm = new FormGroup({
    //   complaintName:new FormControl("", [Validators.required]),
    //   date:new FormControl("", Validators.required),
    //   location: new FormControl(""),
    //   quality: new FormControl(""),
    //   severity: new FormControl(""),
    //   context: new FormControl(""),
    // });
    // if (this.data && this.data.userId && this.data.complaint) {
    //   this.editMode = true;
    // }

    this.vitalForm = this._formBuilder.group({
      systolicBp: [""],
      dystolicBp: [""],
      heartRate: [""],
      temperature: [""],
      respiratoryRate: [""],
      spo2: [""],
      weight: [""],
      bloodsugar_fasting: [""],
      bloodsugar_prelunch: [""],
      bloodsugar_predinner: [""],
      bloodsugar_random: [""],
      bloodsugar_postprandial:[""]
    });

    const systolicValidate = <FormControl>this.vitalForm.get("systolicBp");
    const dialisticValidate = <FormControl>this.vitalForm.get("dystolicBp");

    this.systolicSubscription = systolicValidate.valueChanges.subscribe(
      (value) => {
        if (value) {
          dialisticValidate.setValidators([Validators.required]);
        } else {
          dialisticValidate.setValidators(null);
        }

        dialisticValidate.updateValueAndValidity();
      }
    );
    // this.diastolicSubscription = dialisticValidate.valueChanges.subscribe(value => {
    //   if (value) {
    //     systolicValidate.setValidators([Validators.required, ])
    //   }
    //   else {
    //     systolicValidate.setValidators(null);
    //   }

    //   systolicValidate.updateValueAndValidity();
    // });

    const url = `api/Doctor/GetPatientPrescriptionvitals?patientid=${this.data.patId}&appointmentid=${this.data.appointmentId}`;

    this.httpService.getAll(url).subscribe(
      (res: any) => {
        this.vitalForm.patchValue({
          systolicBp: res.data.systolic_mmhg
            ? res.data.systolic_mmhg
            : undefined,
          dystolicBp: res.data.dystolic_mmhg
            ? res.data.dystolic_mmhg
            : undefined,
          heartRate: res.data.heart_rate ? res.data.heart_rate : undefined,
          temperature: res.data.temp_f ? res.data.temp_f : undefined,
          respiratoryRate: res.data.bmp ? res.data.bmp : undefined,
          spo2: res.data.spo_value ? res.data.spo_value : undefined,
          weight: res.data.weight ? res.data.weight : undefined,
          bloodsugar_fasting: res.data.fasting
            ? res.data.fasting
            : undefined,
          bloodsugar_prelunch: res.data.premeal_lunch
            ? res.data.premeal_lunch
            : undefined,
          bloodsugar_predinner: res.data.premeal_dinner
            ? res.data.premeal_dinner
            : undefined,
          bloodsugar_random: res.data.random
            ? res.data.random
            : undefined,
          bloodsugar_postprandial:res.data.post_prandial
          ? res.data.post_prandial
          : undefined
        });
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }
  get f(): { [key: string]: AbstractControl } {
    return this.vitalForm.controls;
  }
  onSubmit() {
    console.log(moment().format("YYYY-MM-DDTHH:mm:ss"));
    console.log(moment().format("YYYY-MM-DDTHH:mm:ss"));
    this.isLoadingSpinner=true;
    this.submitted = true;

    const formValue = this.vitalForm.value;
    // Although in this case it'd be semantically better to use .reduce, but for the sake of simplicity I'd prefer to use combination of .map + .some. If you're not afraid of .reduce, you can apply it here.
    const mapped = Object.values(formValue).map((value) => !!value);
    const hasValues = mapped.some((value) => value);

    if (!hasValues) {
      this.snackBar.open("Please enter atleast one field.", "close", {
        panelClass: "snackBarWarning",
        duration: 2000,
      });
      return;
    }

    if (
      this.vitalForm.controls.systolicBp.value &&
      !this.vitalForm.controls.dystolicBp.value
    ) {
      this.snackBar.open("Please enter both Systolic & Diastolic.", "close", {
        panelClass: "snackBarWarning",
        duration: 2000,
      });
      return;
    } else if (
      !this.vitalForm.controls.systolicBp.value &&
      this.vitalForm.controls.dystolicBp.value
    ) {
      this.snackBar.open("Please enter both Systolic & Diastolic.", "close", {
        panelClass: "snackBarWarning",
        duration: 2000,
      });
      return;
    }

    const body = {
      patientid: parseInt(this.data.patId),
      createdon: moment().format("YYYY-MM-DDTHH:mm:ss"),
      tempf: this.vitalForm.controls.temperature.value
        ? parseFloat(this.vitalForm.controls.temperature.value)
        : null,
      spo_value: this.vitalForm.controls.spo2.value
        ? parseInt(this.vitalForm.controls.spo2.value)
        : null,
      bmp_value: this.vitalForm.controls.respiratoryRate.value
        ? parseInt(this.vitalForm.controls.respiratoryRate.value)
        : null,
      heartrate: this.vitalForm.controls.heartRate.value
        ? parseInt(this.vitalForm.controls.heartRate.value)
        : null,
      systolic: this.vitalForm.controls.systolicBp.value
        ? parseInt(this.vitalForm.controls.systolicBp.value)
        : null,
      dystolic: this.vitalForm.controls.dystolicBp.value
        ? parseInt(this.vitalForm.controls.dystolicBp.value)
        : null,
      weight: this.vitalForm.controls.weight.value
        ? this.vitalForm.controls.weight.value
        : null,
      bloodsugar_fasting: this.vitalForm.controls.bloodsugar_fasting.value ? parseInt(this.vitalForm.controls.bloodsugar_fasting.value): null,
      bloodsugar_prelunch: this.vitalForm.controls.bloodsugar_prelunch.value ? parseInt(this.vitalForm.controls.bloodsugar_prelunch.value): null,
      bloodsugar_predinner: this.vitalForm.controls.bloodsugar_predinner.value ? parseInt(this.vitalForm.controls.bloodsugar_predinner.value): null,
      bloodsugar_random: this.vitalForm.controls.bloodsugar_random.value ? parseInt(this.vitalForm.controls.bloodsugar_random.value): null,
      bloodsugar_postprandial:this.vitalForm.controls.bloodsugar_postprandial.value ? parseInt(this.vitalForm.controls.bloodsugar_postprandial.value): null,
      createdby: parseInt(this.data.doctorId),
      appointmentid: parseInt(this.data.appointmentId),
    };

    const url = "api/Doctor/SaveVitalsInfo";
    this.httpService.create(url, body).subscribe(
      (res: any) => {
        this.isLoadingSpinner=false;
        this.dataService.setData(body["weight"]); 
        this.dialogRef.close(true);
        this.snackBar.open(
          this.editMode
            ? "Vital updated successfully."
            : "Vital saved successfully. ",
          "close",
          {
            panelClass: "snackBarSuccess",
            duration: 2000,
          }
        );
      },
      (error: any) => {
        console.log("error", error);
      }
    );
    console.log(body);
  }
  onReset(): void {
    this.submitted = false;
    this.vitalForm.reset();
    this.dialogRef.close();
  }
}

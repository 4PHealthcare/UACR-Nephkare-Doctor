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
  selector: "app-chief-complaint-modal",
  templateUrl: "./chief-complaint-modal.component.html",
  styleUrls: ["./chief-complaint-modal.component.scss"],
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
export class ChiefComplaintModalComponent implements OnInit {
  cheifComplaintForm: FormGroup;
  submitted = false;
  @ViewChild("cheifComplaintNGForm") chiefComplaintNGForm: NgForm;

  // qualities$ = new BehaviorSubject<any>(null);
  // duration$ = new BehaviorSubject<any>(null);
  // timings$ = new BehaviorSubject<any>(null);
  maxDate = new Date();
  qualities: any;
  duration: any;
  timings: any;
  editMode = false;
  constructor(
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private httpService: APIService
  ) {}

  ngOnInit(): void {
   
    // console.log(this.data.complaint);
    this.getMasterDataInfo(25);
    this.getMasterDataInfo(26);
    this.getMasterDataInfo(27);
    this.getMasterDataInfo(31);
    this.getMasterDataInfo(64);
    this.getMasterDataInfo(65);
    this.getMasterDataInfo(66);
    this.getMasterDataInfo(67);
    this.getMasterDataInfo(68);
    
    // Create the form
    // this.cheifComplaintForm = new FormGroup({
    //   complaintName:new FormControl("", [Validators.required]),
    //   date:new FormControl("", Validators.required),
    //   location: new FormControl(""),
    //   quality: new FormControl(""),
    //   severity: new FormControl(""),
    //   context: new FormControl(""),
    // });
    if (this.data && this.data.userId && this.data.complaint) {
      this.editMode = true;
    }
    this.cheifComplaintForm = this._formBuilder.group({
      complaintId: [""],
      complaintName: ["", Validators.required],
      date: [],
      location: [""],
      quality: [""],
      severity: [""],
      duration: [""],
      durationType: [""],
      timing: [""],
      context: [""],
      modifyingFactor: [""],
      aggravatingfactor:[""],
      symptom: [""],
    });
    // this.cheifComplaintForm.patchValue({date: moment(new Date()).format("yyyy-MM-DD")});
    this.cheifComplaintForm.patchValue({
      complaintId: this.data.complaint ? this.data.complaint.complaint_id : "",
      complaintName: this.data.complaint ? this.data.complaint.complaint : "",
      date: this.data.complaint ? this.data.complaint.date == '0001-01-01T00:00:00'? undefined: this.data.complaint.date: undefined,
      location: this.data.complaint ? this.data.complaint.location_name : "",
      quality: this.data.complaint ? this.data.complaint.quality_id : "",
      severity: this.data.complaint ? this.data.complaint.severity_id : "",
      duration:  this.data.complaint && this.data.complaint.duration_value != 0? this.data.complaint.duration_value : '',
      durationType: this.data.complaint ? this.data.complaint.duration_id : "",
      timing: this.data.complaint ? this.data.complaint.timing_id : "",
      context: this.data.complaint ? this.data.complaint.context : "",
      modifyingFactor: this.data.complaint ? this.data.complaint.modifying_factor : "",
      aggravatingfactor: this.data.complaint ? this.data.complaint.aggravating_factor : "",
      symptom: this.data.complaint ? this.data.complaint.symptoms : "",
    });
  }
  get f(): { [key: string]: AbstractControl } {
    return this.cheifComplaintForm.controls;
  }
  onSubmit() {
    console.log("Entered");
    this.submitted = true;
    if (this.cheifComplaintForm.invalid) {
      return;
    }
    const body = {
      complaintid: this.editMode ? this.data.complaint.complaint_id : 0,
      appointmentid: this.data.complaint
        ? this.data.complaint.appointment_id
        : this.data.appointmentId
        ? parseInt(this.data.appointmentId)
        : 0,
      patientid: parseInt(this.data.userId), // patientid from GetUserById
      complaint_name: this.cheifComplaintForm.controls.complaintName.value,
      complant_date: this.cheifComplaintForm.controls.date.value ? moment(this.cheifComplaintForm.controls.date.value).format(
        "YYYY-MM-DD"
      ) : undefined,
      location: this.cheifComplaintForm.controls.location.value,
      qualityid: this.cheifComplaintForm.controls.quality.value
        ? this.cheifComplaintForm.controls.quality.value
        : 0, // dropdown-25
      severityid: this.cheifComplaintForm.controls.severity.value
        ? this.cheifComplaintForm.controls.severity.value
        : 0, // numeric field
      durationvalue: this.cheifComplaintForm.controls.duration.value
        ? this.cheifComplaintForm.controls.duration.value
        : 0, // accept numbers
      durationid: this.cheifComplaintForm.controls.durationType.value
        ? this.cheifComplaintForm.controls.durationType.value
        : 0, //dropdown --/26
      timingid: this.cheifComplaintForm.controls.timing.value
        ? this.cheifComplaintForm.controls.timing.value
        : 0, //dropdown: 27
      context_info: this.cheifComplaintForm.controls.context.value,
      aggravatingfactor:this.cheifComplaintForm.controls.aggravatingfactor.value,
      modifyingfactor: this.cheifComplaintForm.controls.modifyingFactor.value,
      symptoms_name: this.cheifComplaintForm.controls.symptom.value,
    };
    const url = "api/PatientIllnessAndCompliants/ManagePatientChiefComplaint";
    this.httpService.create(url, body).subscribe(
      (res: any) => {
        this.dialogRef.close(true);
        this.snackBar.open(
          this.editMode
            ? "Chief complaint updated successfully."
            : "Chiief complaint added successfully. ",
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
    this.cheifComplaintForm.reset();
    this.dialogRef.close();
  }
  sivearities:any;
  locations:any;
  contexts:any;
  relievingFactors:any;
  aggravatingFactors:any;
  associatedSigns:any;
 
  getMasterDataInfo(type) {
    const url = `api/User/GetMasterData?mastercategoryid=` + type;

    this.httpService.getAll(url).subscribe(
      (res: any) => {
        switch (type) {
          case 25:
            this.qualities = res.data;
            break;
            case 26:
            this.duration = res.data;
            break;
            case 27:
            this.timings = res.data;
            break;
          case 31:
            this.sivearities = res.data;
            break;
          case 64:
            this.locations = res.data;
            break;
          case 65:
            this.contexts = res.data;
            break;
          case 66:
            this.relievingFactors = res.data;
            break;
          case 67:
            this.aggravatingFactors  = res.data;
            break;
          case 68:
            this.associatedSigns = res.data;
            break;
          default:
        }
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }
}

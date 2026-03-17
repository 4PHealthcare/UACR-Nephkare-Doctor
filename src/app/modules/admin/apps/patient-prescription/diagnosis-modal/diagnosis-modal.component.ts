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
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import { APIService } from "app/core/api/api";
import { BehaviorSubject } from "rxjs";
import moment from "moment";

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD-MMM-YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY'
  },
};

@Component({
  selector: "app-diagnosis-modal",
  templateUrl: "./diagnosis-modal.component.html",
  styleUrls: ["./diagnosis-modal.component.scss"],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ]
})
export class DiagnosisModalComponent implements OnInit {
  cars = [
    { id: 1, name: "Volvo" },
    { id: 2, name: "Saab" },
    { id: 3, name: "Opel" },
    { id: 4, name: "Audi" },
  ];
  diagnosisForm: FormGroup;
  submitted = false;
  @ViewChild("diagnosisNGForm") diagnosisNGForm: NgForm;
  clinicalStatuses: any;
  editMode: boolean = false;
  diagonsis_id:any;
  isLoadingSpinner:boolean=false;
  today = moment();
  noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control && control.value && control.value.toString() || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  constructor(
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private httpService: APIService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit(): void {
    this.diagonsis_id=this.data?.data?.diagonsis_id
   
    console.log('data###', this.data);
    this.diagnosisForm = new FormGroup({
      problem: new FormControl(null, [Validators.required,this.noWhitespaceValidator]),
      clinical_status_id: new FormControl(""),
      onset_date: new FormControl(""),
      resolved_date: new FormControl(""),
      stage: new FormControl(""),
      diagonsis_id: new FormControl(0),
      is_active: new FormControl(true)
    });
    // this.diagnosisForm = this._formBuilder.group({
    //   problem: [null, [Validators.required]],
    //   _clinical_status: [""],
    //   onsetDate: [""],
    //   resolvedDate: [""],
    //   _stage: [""],

    // });
    this.getClinicalStatus();
    this.updateDiagnosis();
  }
  
  get f(): { [key: string]: AbstractControl } {
    return this.diagnosisForm.controls;
  }

  onSubmit() {
    this.isLoadingSpinner=true;
    if (this.data?.prescription) {
      if (this.diagnosisForm.valid) {
        this.dialogRef.close(JSON.stringify(this.diagnosisForm.value, null, 2))
      }
    }
    else {
    this.submitted = true;
    if (this.diagnosisForm.invalid) {
      return;
    }
    const body = {
      diagonsisid: this.data?.data?.diagonsis_id ? this.data.data.diagonsis_id : 0, 
      appointmentid: 0,
      patientid: parseInt(this.data.userId),
      problem_name: this.diagnosisForm.get('problem').value,
      otherproblem: "",
      code_name: "",
      description_name: "",
      clinicalstatusid: this.diagnosisForm.get('clinical_status_id').value ? this.diagnosisForm.get('clinical_status_id').value : 0,
      onsetdate: this.diagnosisForm.get('onset_date').value ? moment(this.diagnosisForm.get('onset_date').value).format("YYYY-MM-DD") : undefined,
      resolveddate: this.diagnosisForm.get('resolved_date').value ? moment(this.diagnosisForm.get('resolved_date').value).format("YYYY-MM-DD") : undefined,
      stage_name: this.diagnosisForm.get('stage').value,
      kdigoid: 0,
      note_name: "",
      createdby: 0,
      is_active: true
    }
    console.log();
    
    const url = `api/Patient/CreatePatientDiagnosis`;
    this.httpService.create(url, body).subscribe((res: any) => { 
      if(res.data){
        this.isLoadingSpinner=false;
        if(this.data?.data?.diagonsis_id){
          this.snackBar.open("Diagnosis updated successfully. ", "close", {
            panelClass: "snackBarSuccess",
            duration: 2000,
          });
        }else{
          this.snackBar.open("Diagnosis saved successfully. ", "close", {
            panelClass: "snackBarSuccess",
            duration: 2000,
          });
        }
        
      }
      this.dialogRef.close(true);
    });
  }
  }
  onReset(): void {
    this.submitted = false;
    this.diagnosisForm.reset();
  }

  getClinicalStatus() {
    const url = `api/User/GetMasterData?mastercategoryid=34`;
    this.httpService.getAll(url).subscribe((res: any) => {
      this.clinicalStatuses = res.data;
    });
  }

  updateDiagnosis() {
    if(this.data && this.data.info && this.data.info.problem) {
      this.editMode = true;
      this.diagnosisForm.patchValue({
        problem: this.data.info.problem,
        clinical_status_id: this.data.info.clinical_status_id,
        onset_date: this.data.info.onset_date,
        resolved_date: this.data.info.resolved_date,
        stage: this.data.info.stage,
        diagonsis_id: this.data.info.diagonsis_id,
        is_active: true
      })
    }
    if(this.data && this.data.data && this.data.data.diagonsis_id) {
      this.editMode = true;
      this.diagnosisForm.patchValue({
        problem: this.data.data.problem,
        clinical_status_id: this.data.data.clinical_status_id,
        onset_date: this.data.data.onset_date,
        resolved_date: this.data.data.resolved_date,
        stage: this.data.data.stage,
      })
    }
  }
 
  filteredOptions$ = new BehaviorSubject<any>(null);
  searchDrugsTerm(event) {
    const value = event.target.value;
    if (value.length > 2)  {
      const url = `api/Patient/SearchICDCodes?searchtext=${value}`;
      this.httpService.getAll(url).subscribe((res: any) => {
        if(res.data && res.data.length > 0){
          this.filteredOptions$.next(res.data);
        }
        else {
          this.filteredOptions$.next([]);
        }
      },
      (error: any) => {
          console.log('error', error);
      });
    }
    else {
      this.filteredOptions$.next([]);
    }
  }
}

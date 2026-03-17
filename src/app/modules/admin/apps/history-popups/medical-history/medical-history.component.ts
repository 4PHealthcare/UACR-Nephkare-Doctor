import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, NgForm, Validators,AbstractControl, FormControl } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { APIService } from "app/core/api/api";
import * as moment from "moment";
import { BehaviorSubject } from "rxjs";
// import { MatDialogRef } from "@angular/material/dialog";
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
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
  selector: "app-medical-history",
  templateUrl: "./medical-history.component.html",
  styleUrls: ["./medical-history.component.scss"],
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
  ],
})
export class MedicalHistoryComponent implements OnInit {
  medicalHistoryForm: FormGroup;
  submitted = false;
  status: string[] = ["active", "inactive"];
  comorbidConditions: any;
  durations: any;
  maxDate = new Date();
  medicalhistory_id:any;
  @ViewChild("medicalHistoryNGForm") chiefComplaintNGForm: NgForm;
  newComorbidConditions: any;
  filteredOptions:any[] = [];
  isLoadingSpinner = false;
  noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control && control.value && control.value.toString() || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }
  

  constructor(
    private _formBuilder: FormBuilder,
    private httpService: APIService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>
  ) {}

  ngOnInit(): void {
    // Create the form
    this.medicalHistoryForm = new FormGroup({
      comorbid: new FormControl(null, [Validators.required,this.noWhitespaceValidator
      ]),
      status: new FormControl(null, [Validators.required]),
      date: new FormControl(""), 
     
      durationValue: new FormControl(""),
      durationId: new FormControl(""),
      note: new FormControl("")
    });
    // this.medicalHistoryForm = this._formBuilder.group({
    //   comorbid: ["",Validators.required],
    //   status:["",Validators.required],
    //   date: [""],
    //   durationValue: [""],
    //   durationId: [""],
    //   note: [""],
    // });
    // this.getcomorbidConditions();
    this.getMasterdata();
    this.getDurations();
    
    if (this.data && this.data.medicalHistory && this.data.medicalHistory.medicalhistory_id) {
      this.medicalhistory_id=this.data.medicalHistory.medicalhistory_id;
      this.updateForm();
    }
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  
  updateForm() {
    this.medicalHistoryForm.patchValue({
      comorbid: this.data.medicalHistory.history_name,
      status: this.data.medicalHistory.status ? this.data.medicalHistory.status.toLowerCase() : undefined,
      date: this.data.medicalHistory.onset_date,
      durationValue: this.data.medicalHistory.duration_value ? this.data.medicalHistory.duration_value : undefined,
      durationId: this.data.medicalHistory.duration_id,
      note: this.data.medicalHistory.notes,
    })
  }
  get f(): { [key: string]: AbstractControl } {
    return this.medicalHistoryForm.controls;
  }
  deleteNoIssues (id:any) {
    const url = `api/PatientHistory/DeleteMedicalHistory?historyId=${id}`;
        this.httpService.getAll(url).subscribe(
          (res: any) => {
            if (res?.isSuccess) {
             
            }
          },
          (error: any) => {
            console.log("error", error);
          }
        );
  }
  onSubmit() { 
    this.submitted = true;
    this.isLoadingSpinner = true;
    if (this.medicalHistoryForm.invalid) {
      return;
    }
    if (!this.data.medicalHistory && this.data.noIssuesId) {
      this.deleteNoIssues(this.data.noIssuesId);
    }
    const body = {
      medicalhistoryid: this.data?.medicalHistory ? this.data?.medicalHistory?.medicalhistory_id : 0,
      patientid: parseInt(this.data.userId),
      appointmentid: 0,
      history: this.medicalHistoryForm.get('comorbid').value,
      status_name: this.medicalHistoryForm.get('status').value ? this.medicalHistoryForm.get('status').value.toLowerCase() : undefined,  
      onsetdate: this.medicalHistoryForm.get('date').value ? moment(this.medicalHistoryForm.get('date').value).format("YYYY-MM-DD") : undefined,
      durationvalue: this.medicalHistoryForm.get('durationValue').value ? JSON.parse(this.medicalHistoryForm.get('durationValue').value) : undefined,
      durationid: this.medicalHistoryForm.get('durationId').value ? JSON.parse(this.medicalHistoryForm.get('durationId').value) : undefined,
      note: this.medicalHistoryForm.get('note').value,
      is_active
      : true
    };
    const url = `api/PatientHistory/SaveMedicalHistory`;
    this.httpService.create(url, body).subscribe((res: any) => {
      this.isLoadingSpinner =false;
      // this.medicalHistoryForm.reset();
      if(this.data?.medicalHistory?.medicalhistory_id){ 
        this.snackBar.open("Medical history updated successfully.", "close", {
          panelClass: "snackBarSuccess",
          duration: 2000,
        });
      }else{
        this.snackBar.open("Medical history saved successfully.", "close", {
          panelClass: "snackBarSuccess",
          duration: 2000,
        });
      }
       
      // this.dialogRef.close(true);
    });
  }
  
  onReset(): void {
    this.submitted = false;
    // this.medicalHistoryForm.reset();
    this.dialogRef.close();
  }

  getcomorbidConditions() {
    const url = `api/User/GetMasterData?mastercategoryid=8`;
    this.httpService.getAll(url).subscribe((res: any) => {
      this.comorbidConditions = res.data.filter(data => data.masterdata_id != 59);
    });
  }

  getDurations() {
    const url = `api/User/GetMasterData?mastercategoryid=26`;
    this.httpService.getAll(url).subscribe((res: any) => {
      this.durations = res.data;
    });
  }
  // searchComorbid(ev){ 
  // const value = ev.target.value;
  //   this.newComorbidConditions=this.comorbidConditions;
  //   console.log(value);
  //   if (value && value.trim() != "") {
  //     this.newComorbidConditions = this.newComorbidConditions.filter((item: any) => {
  //       return (
  //         item.data_name.toLowerCase().indexOf(value.toLowerCase()) > -1
  //       );
  //     });
  //   }
  // }
  filteredOptions$ = new BehaviorSubject<any>(null); 
  searchHistories(event) { 
    const value = event.target.value;
    if (value.length > 1)  {
      const url = `api/Patient/SearchMedicalHistory?searchtext=${value}`; 
      this.httpService.getAll(url).subscribe((res: any) => {
        if(res.data && res.data.length > 0){
          this.filteredOptions$.next(res.data.filter(data => data.history_name != 'No Issues'));
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
      const url = `api/Patient/SearchMedicalHistory?searchtext=`;
      this.httpService.getAll(url).subscribe((res: any) => {
        if(res.data && res.data.length > 0){
          this.filteredOptions$.next(res.data.filter(data => data.history_name != 'No Issues'));
        }
        else {
          this.filteredOptions$.next([]);
        }
      },
      (error: any) => {
          console.log('error', error);
      });
    }
  }
  getMasterdata() {
    const url = `api/Patient/SearchMedicalHistory?searchtext=`;
    this.httpService.getAll(url).subscribe((res: any) => {
      // this.filteredOptions = res.data;
      this.filteredOptions$.next(res.data.filter(data => data.history_name != 'No Issues'));
    });
  }
  
  

}

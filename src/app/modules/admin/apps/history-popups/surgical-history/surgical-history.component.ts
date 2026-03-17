import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormBuilder,FormGroup, NgForm, Validators, FormControl, AbstractControl } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog"; 
import { MatSnackBar } from "@angular/material/snack-bar";
import { APIService } from "app/core/api/api";
import * as moment from "moment";
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import { BehaviorSubject } from "rxjs";
import {map, startWith} from 'rxjs/operators';


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
  selector: 'app-surgical-history',
  templateUrl: './surgical-history.component.html',
  styleUrls: ['./surgical-history.component.scss'],
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
export class SurgicalHistoryComponent implements OnInit {
  submitted = false;
  surgicalHistoryForm: FormGroup;
  surgicalHistoryId:any;
  maxDate = new Date();
  @ViewChild("surgicalHistoryNGForm") chiefComplaintNGForm: NgForm;
  filteredOptions:any[] = [];
  isLoadingSpinner:boolean=false;
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
    // Create the form
    // this.surgicalHistoryForm = new FormGroup({
    //   complaintName:new FormControl("", [Validators.required]),
    //   date:new FormControl("", Validators.required),
    //   location: new FormControl(""),
    //   quality: new FormControl(""),
    //   severity: new FormControl(""),
    //   context: new FormControl(""),
    // });
    this.surgicalHistoryForm = this._formBuilder.group({
      _procedure_name: ["", Validators.required],
      _body_site: [""],
      _date: ["", Validators.required],
      _types_anesthesia: [""],
      _warm_hh: [""],
      _warm_mm: [""],
      _cold_hh: [""],
      _cold_mm: [""],
      _note:['']
    });
    this.getTypesOfAnesthesias();
    this.getMasterdata();
    if (this.data && this.data.surgicalHistory && this.data.surgicalHistory.surgicalhistory_id) {
      this.surgicalHistoryId=this.data.surgicalHistory.surgicalhistory_id;
      this.updateForm();
    }

  
  }
  get f(): { [key: string]: AbstractControl } {
    return this.surgicalHistoryForm.controls;
  }
  get _procedure_nameIsValid() {
    const procedureNameControl = this.surgicalHistoryForm.get('_procedure_name');
    return procedureNameControl.valid && procedureNameControl.value.trim() !== '';
  }

  private _filter(value: string): string[] {
    console.log(value);
    const filterValue = value.toLowerCase();

    return this.filteredOptions.filter(option => option.toLowerCase().includes(filterValue));
  }



  getMasterdata() {
    const url = `api/User/GetSearchMasterData?mastercategoryid=63&searchtext=`;
    this.httpService.getAll(url).subscribe((res: any) => {
      // this.filteredOptions = res.data;
      this.filteredOptions$.next(res.data);
    });
  }
 
  updateForm() {
    this.surgicalHistoryForm.patchValue({
      _procedure_name: this.data.surgicalHistory.history_name,
      _body_site: this.data.surgicalHistory.body_site,
      _date: this.data.surgicalHistory.surgery_date,
      _types_anesthesia: this.data.surgicalHistory.anesthesia_type,
      _warm_hh: this.data.surgicalHistory.ischemic_hh,
      _warm_mm: this.data.surgicalHistory.ischemic_mm,
      _cold_hh: this.data.surgicalHistory.cold_hh,
      _cold_mm: this.data.surgicalHistory.cold_mm,
      _note: this.data.surgicalHistory.notes,
    })
  }

  onSubmit() {
    console.log('Entered')
    this.submitted = true;
    this.isLoadingSpinner=true;
    if (this.surgicalHistoryForm.invalid) {
      return;
    }
    const body = {
      surgicalhistoryid: this.data?.surgicalHistory ? this.data.surgicalHistory.surgicalhistory_id : 0,
      patientid: parseInt(this.data.userId),
      appointmentid: 0,
      history: this.surgicalHistoryForm.get('_procedure_name').value,
      surgerydate: this.surgicalHistoryForm.get('_date').value? moment(this.surgicalHistoryForm.get('_date').value).format("YYYY-MM-DD"):undefined,
      bodysite: this.surgicalHistoryForm.get('_body_site').value,
      anesthesiatype: this.surgicalHistoryForm.get('_types_anesthesia').value,
      ischemichh: parseInt(this.surgicalHistoryForm.get('_warm_hh').value)?parseInt(this.surgicalHistoryForm.get('_warm_hh').value) :0,
      ischemicmm: parseInt(this.surgicalHistoryForm.get('_warm_mm').value)?parseInt(this.surgicalHistoryForm.get('_warm_mm').value) : 0,
      coldhh: parseInt(this.surgicalHistoryForm.get('_cold_hh').value)? parseInt(this.surgicalHistoryForm.get('_cold_hh').value) : 0,
      coldmm: parseInt(this.surgicalHistoryForm.get('_cold_mm').value) ? parseInt(this.surgicalHistoryForm.get('_cold_mm').value): 0,
      note: this.surgicalHistoryForm.get('_note').value
    };
    const url = `api/SocialAndSurgicalHistory/ManageSurgicalHistory`;
    this.httpService.create(url, body).subscribe((res: any) => {
      this.isLoadingSpinner=false;
      // this.surgicalHistoryForm.reset();
      if (this.data?.surgicalHistory){
        this.snackBar.open("Surgical history updated successfully.", "close", {
          panelClass: "snackBarSuccess",
          duration: 2000,
        
        });
      }else {
        this.snackBar.open("Surgical history saved successfully.", "close", {
          panelClass: "snackBarSuccess",
          duration: 2000,
        });
      }
     
      // this.dialogRef.close(true); 
    });
    console.log(body)
    console.log(JSON.stringify(this.surgicalHistoryForm.value, null, 2));
  }
  onReset(): void {
    this.submitted = false;
    this.surgicalHistoryForm.reset();
    this.dialogRef.close();
  }

  filteredOptions$ = new BehaviorSubject<any>(null);
  searchHistories(event) { 
    const value = event.target.value;
    if (value.length > 1)  {
      const url = `api/User/GetSearchMasterData?mastercategoryid=63&searchtext=${value}`;
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


  typesOfAnesthesias: any;

  getTypesOfAnesthesias() {
    const url = `api/User/GetMasterData?mastercategoryid=36`;
    this.httpService.getAll(url).subscribe((res: any) => {
      this.typesOfAnesthesias = res.data;
    });
  }

}

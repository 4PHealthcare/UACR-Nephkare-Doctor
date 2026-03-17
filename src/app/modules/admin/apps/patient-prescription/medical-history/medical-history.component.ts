import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';

import { APIService } from 'app/core/api/api';

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
  selector: 'app-medical-history',
  templateUrl: './medical-history.component.html',
  styleUrls: ['./medical-history.component.scss'],
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
export class MedicalHistoryComponent implements OnInit {

  medicalHistoryForm: FormGroup;
  submitted = false;
  status: string[] = ["Active", "Inactive"];
  comorbidConditions: any;
  durations: any;
  @ViewChild("medicalHistoryNGForm") chiefComplaintNGForm: NgForm;

  constructor(
    private _formBuilder: FormBuilder,
    private httpService: APIService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>
  ) {}

  ngOnInit(): void {
    console.log('data@2@@', this.data);
    // Create the form
    this.medicalHistoryForm = this._formBuilder.group({
      history_name: ["",Validators.required],
      status:["",Validators.required],
      medicalhistory_id: [0],
      onset_date: [""],
      duration_value: [""],
      duration_id: [null],
      notes: [""],
      is_active: [true]
    });
    this.getcomorbidConditions();
    this.getDurations();
    if (this.data && this.data?.item) {
      this.updateForm();
    }
  }

  updateForm() {
    this.medicalHistoryForm.patchValue({
      history_name: this.data.item.history_name,
      medicalhistory_id: this.data.item.medicalhistory_id,
      status: this.data.item.status,
      onset_date: this.data.item.onset_date,
      duration_value: this.data.item.duration_value,
      duration_id: this.data.item.duration_id,
      notes: this.data.item.notes,
      is_active: true
    })
  }
  get f(): { [key: string]: AbstractControl } {
    return this.medicalHistoryForm.controls;
  }
  onSubmit() {
    this.submitted = true;
    if (this.medicalHistoryForm.invalid) {
      return;
    }
    this.dialogRef.close(JSON.stringify(this.medicalHistoryForm.value, null, 2));
  }

  onReset(): void {
    this.submitted = false;
    this.medicalHistoryForm.reset();
  }

  getcomorbidConditions() {
    const url = `api/User/GetMasterData?mastercategoryid=8`;
    this.httpService.getAll(url).subscribe((res: any) => {
      this.comorbidConditions = res.data;
    });
  }

  getDurations() {
    const url = `api/User/GetMasterData?mastercategoryid=26`;
    this.httpService.getAll(url).subscribe((res: any) => {
      this.durations = res.data;
    });
  }

}

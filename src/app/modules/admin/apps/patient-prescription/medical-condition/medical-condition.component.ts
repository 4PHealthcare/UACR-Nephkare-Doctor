import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import { COMMA, ENTER } from "@angular/cdk/keycodes";

import { APIService } from 'app/core/api/api';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

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
  selector: 'app-medical-condition',
  templateUrl: './medical-condition.component.html',
  styleUrls: ['./medical-condition.component.scss'],
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
export class MedicalConditionComponent implements OnInit {

  medicalHistoryForm: FormGroup;
  submitted = false;
  status: string[] = ["Active", "Inactive"];
  comorbidConditions: any;
  medicalConditions:any[] = [];
  filteredConditions:any[] = [];
  durations: any;
  separatorKeysCodes: number[] = [ENTER];
  @ViewChild("proceduresInput") proceduresInput: ElementRef<HTMLInputElement>;
  @ViewChild("medicalHistoryNGForm") chiefComplaintNGForm: NgForm;
  condition = new FormControl();

  medicalConditionMasterData:any[] = [];

  constructor(
    private _formBuilder: FormBuilder,
    private httpService: APIService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>
  ) {}

  ngOnInit(): void {
    // Create the form
    this.medicalHistoryForm = this._formBuilder.group({
      condition: ["",Validators.required],
    });
    this.getcomorbidConditions();
    if (this.data && this.data?.condition) {
      this.medicalConditions = this.data.condition.split(',');
    }
  }

  updateForm() {
    this.medicalHistoryForm.patchValue({
      condition: this.data.item.history_name,
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
    const url = `api/User/GetMasterData?mastercategoryid=60`;
    this.httpService.getAll(url).subscribe((res: any) => {
      this.comorbidConditions = res.data;
    });
  }

  searchpProcedures(event: any) {
    let value = event.target.value;
    this.filteredConditions = this.comorbidConditions.filter((data: any) =>
      data.data_name.toLowerCase().includes(value)
    );
  }

  removeProcedure() {

  }

  selectedProcedure(event: MatAutocompleteSelectedEvent) {
    // this.enableFormChanges();
    this.medicalConditions.push(event.option.value);
    this.proceduresInput.nativeElement.value = "";
    this.condition.setValue(null);
  }

  

}

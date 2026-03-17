
import { Component, OnInit,ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  NgForm,
  Validators,
  FormControl,
  AbstractControl,
} from "@angular/forms";
import {  MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-vitals-settings',
  templateUrl: './vitals-settings.component.html',
  styleUrls: ['./vitals-settings.component.scss']
})
export class VitalsSettingsComponent implements OnInit {

  @ViewChild("vitalsRegistrationNGForm") vitalsRegistrationNGForm: NgForm;
  vitalsRegistrationForm:FormGroup=new FormGroup({
    bloodsugar_fasting:new FormControl(''),
    bloodpressure_fasting:new FormControl(''),
    heart_fasting:new FormControl(''),
    temperature:new FormControl(''),
    respiratory:new FormControl(''),
  })
  
  
  
  constructor( 
    private _matDialogRef: MatDialogRef<VitalsSettingsComponent>,
    public dialogRef: MatDialogRef<any>,
    private _formBuilder: FormBuilder,
  ) { }
  
 
  ngOnInit(): void {}
  dismiss() {
    this._matDialogRef.close();
  }
  onSubmit(){

  }
}

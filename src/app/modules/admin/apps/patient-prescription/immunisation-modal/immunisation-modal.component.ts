import { Component, Inject, Input, OnInit, ViewChild } from "@angular/core";
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
import moment from "moment";
import { APIService } from "app/core/api/api";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";

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
  selector: "app-immunisation-modal",
  templateUrl: "./immunisation-modal.component.html",
  styleUrls: ["./immunisation-modal.component.scss"],
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
export class ImmunisationModalComponent implements OnInit {
  immunisationForm: FormGroup;
  submitted = false;
  @ViewChild("immunisationNGForm") immunisationNGForm: NgForm;

  // qualities$ = new BehaviorSubject<any>(null);
  // duration$ = new BehaviorSubject<any>(null);
  // timings$ = new BehaviorSubject<any>(null);
  qualities : any;
  duration: any;
  maxDate = new Date();
  @Input() immunisationData: any;
  vacinnationValues: any = [];
  vaccinationDose: any = [];
  timings: any;
  editMode = false;
  isLoadingSpinner:boolean=false;

  constructor(
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private httpService: APIService,
  ) {}

  ngOnInit(): void {
    // Create the form
    // this.immunisationForm = new FormGroup({
    //   complaintName:new FormControl("", [Validators.required]),
    //   date:new FormControl("", Validators.required),
    //   location: new FormControl(""),
    //   quality: new FormControl(""),
    //   severity: new FormControl(""),
    //   context: new FormControl(""),
    // });
    if (this.data && this.data.userId && this.data.immunisation) {
      this.editMode = true;
    }
    this.immunisationForm = this._formBuilder.group({
      vaccinationid: [''],
      vaccination: ["", Validators.required],
      vaccinename: [""],
      vaccinationdate: ["", Validators.required],
      roaname: [""],
      vaccinevalue: [""],
      dosename: [""],
    });
    
    

if(this.data && this.data.immunisation) {
  this.selectVaccination('', this.data.immunisation.vaccine_name);  
}




  }
  get f(): { [key: string]: AbstractControl } {
    return this.immunisationForm.controls;
  }
  onSubmit() {
    this.isLoadingSpinner=true;
    this.submitted = true;
  
    if (this.immunisationForm.invalid) {
      return;
    }

    const body = {
      vaccinationid : this.data.immunisation ? this.data.immunisation.vaccination_id : 0,
      appointmentid: this.data.immunisation  ? this.data.immunisation.appointment_id : this.data.appointmentId ? parseInt(this.data.appointmentId) : 0,
      patientid: parseInt(this.data.userId), // patientid from GetUserById
      is_active: true,
      vaccinename: this.immunisationForm.controls.vaccination.value,
      roaname: this.immunisationForm.controls.roaname.value,
      vaccinevalue: this.immunisationForm.controls.vaccinevalue.value,
      dosename: this.immunisationForm.controls.dosename.value,
      vaccinationdate: this.immunisationForm.controls.vaccinationdate.value ? moment(this.immunisationForm.controls.vaccinationdate.value).format("YYYY-MM-DD") : undefined,
      name_info: this.immunisationForm.controls.vaccinename.value,
      createdby: this.data.doctorId,

    }
    

    const url = 'api/Doctor/CreateUpdatePatientVaccinationSchedule';
    this.httpService.create(url, body).subscribe((res: any) => {
      this.isLoadingSpinner=false;
      this.dialogRef.close(true);
      this.snackBar.open( this.editMode ? 'Immunisation updated successfully.' : 'Immunisation added successfully. ', 'close', {
        panelClass: "snackBarSuccess",
        duration: 2000,
      });
    },
    (error: any) => {
        console.log('error', error);
    });
  }

  onReset(): void {
    this.submitted = false;
    this.immunisationForm.reset();
    this.dialogRef.close();
  }

  selectVaccination(ev, name?:string) {

    let immunistionName:string;

    if(name) {
      immunistionName = name;
    } else if(ev && ev.value) {
      immunistionName = ev.value;
    }
    this.immunisationForm.controls.dosename.setValue(undefined);
    switch (immunistionName) {
      case "Hepatitis B":
        this.getVaccineValues(45, name);
        this.vaccinationDose = ["20 mcg", "40 mcg"];
        break;
      case "Pneumococcal":
        this.getVaccineValues(46, name);
        this.vaccinationDose = ["Done", "Not Done"];
        break;
      case "Influenza":
        this.getVaccineValues(47, name);
        this.vaccinationDose = ["0", "1", "2", "3"];
        break;
      case "DT":
        this.getVaccineValues(47, name);
        this.vaccinationDose = ["0", "1", "2", "3"];
        break;
      case "M.M.R":
        this.getVaccineValues(47, name);
        this.vaccinationDose = ["0", "1", "2", "3"];
        break;
      case "Chickenpox":
        this.getVaccineValues(47, name);
        this.vaccinationDose = ["0", "1", "2", "3"];
        break;
      default:
    }
  }

  getVaccineValues(id: any, name:any) {
    this.immunisationForm.controls.vaccinevalue.setValue(undefined);;
    const url = `api/User/GetMasterData?mastercategoryid=` + id;
    this.httpService.getAll(url).subscribe((res: any) => {
      if(res){
        if(this.immunisationData && this.immunisationData.value) {
          this.immunisationForm.controls.vaccinevalue.setValue(this.immunisationData?.vaccine_value);
        }else {
          this.immunisationForm.controls.vaccinevalue.setValue(undefined);
        }
        this.vacinnationValues = res.data;

        if(this.data && this.data.immunisation && name) {
          this.immunisationForm.patchValue({
            vaccinationid: this.data.immunisation ? this.data.immunisation.vaccination_id : '',
            vaccination: this.data.immunisation ? this.data.immunisation.vaccine_name : '',
            vaccinationdate: this.data.immunisation ? this.data.immunisation.vaccination_date : '',
            vaccinename: this.data.immunisation ? this.data.immunisation.name : '',
            roaname: this.data.immunisation ? this.data.immunisation.roa : '',
            vaccinevalue: this.data.immunisation ? this.data.immunisation.vaccine_value : '',
            dosename: this.data.immunisation ? this.data.immunisation.dose : '',
          });
        }
       

      }else{
        
      }
     
     
    });
  }

}

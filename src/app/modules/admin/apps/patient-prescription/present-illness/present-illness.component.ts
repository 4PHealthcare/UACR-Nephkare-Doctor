import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  NgForm,
  Validators,
  AbstractControl,
  FormControl,
} from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { APIService } from "app/core/api/api";
import _ from "lodash";

@Component({
  selector: "app-present-illness",
  templateUrl: "./present-illness.component.html",
  styleUrls: ["./present-illness.component.scss"],
})
export class PresentIllnessComponent implements OnInit {
  presentIllnessForm: FormGroup;
  seasons: any[] = [
    { name: "Medical", id: 84 },
    { name: "Surgical", id: 85 },
    { name: "Obstetrics", id: 86 },
  ];
  state: any[] = [
    { name: "Acute", id: 87 },
    { name: "Subacute", id: 88 },
    { name: "Chronic", id: 89 },
  ];
  recurrence: any[] = [
    { name: "Yes", value: false },
    { name: "No", value: false },
  ];
  symptoms: any[] = [
    { name: "Abdominal Pain", checked: false },
    { name: "Confusion", checked: false },
    { name: "Fever", checked: false },
    { name: "Nausea", checked: false },
    { name: "Anemia", checked: false },
    { name: "Non Oliguria", checked: false },
    { name: "Diabetes", checked: false },
    { name: "Altered Sensorium", checked: false },
    { name: "Dehydration", checked: false },
    { name: "Flank Pain", checked: false },
    { name: "Hematuria", checked: false },
    { name: "Oliguria", checked: false },
    { name: "Anorexia", checked: false },
    { name: "Hypertension", checked: false },
    { name: "Pulmonary Edema", checked: false },
    { name: "Anuria", checked: false },
    { name: "Dyspnea", checked: false },
    { name: "Edema", checked: false },
    { name: "Jaundice", checked: false },
    { name: "Seizures", checked: false },
    { name: "Coma", checked: false },
    { name: "Encephalopathy", checked: false },
    { name: "Myclonic Jerks", checked: false },
    { name: "Weakness", checked: false },
    { name: "Cough", checked: false },
    { name: "Vomting", checked: false },
    { name: "Decrease Urine Output", checked: false },
    { name: "Shortness Of Breath", checked: false },
    { name: "Constipation", checked: false },
    { name: "Drowsiness", checked: false },
    { name: "Other", checked: false },
  ];
  @ViewChild("presentIllnessNGForm") chiefComplaintNGForm: NgForm;
  submitted = false;
  selectedSymptoms: any[] = [];
  editMode = false;

  constructor(
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private httpService: APIService,
  ) {
  }

  ngOnInit(): void {
    console.log(this.data);
    // Create the form
    // this.presentIllnessForm = this._formBuilder.group({
    //   settingAki: ["", [Validators.required]],
    //   onset: [""],
    //   recurrence: [""],
    //   symptoms: [""],

    //  });
    this.presentIllnessForm = new FormGroup({
      settingAki: new FormControl("", Validators.required),
      onset: new FormControl(""),
      recurrence: new FormControl(''),
      symptoms: new FormControl(""),
    });
    this.updateForm();
  }

  updateForm() {
    if (this.data.illness && this.data.illness.illness_id) {
      this.editMode = true;
      this.presentIllnessForm.patchValue({
        settingAki: this.data.illness?.setting_id ? this.data?.illness?.setting_id : '',
        onset: this.data.illness?.onset_id ? this.data?.illness?.onset_id : '',
        recurrence: this.data?.illness ? this.data.illness.isrecurrence : '',
      });
      this.selectedSymptoms = this.data.illness.symptonsList;
      if (this.selectedSymptoms.length > 0) {
        this.symptoms.forEach((data: any) => {
          this.selectedSymptoms.forEach((obj: any) => {
            if(data.name === obj) {
              return data.checked = true;
            }
          })
        });
      }
    }
  }

  get f(): { [key: string]: AbstractControl } {
    return this.presentIllnessForm.controls;
  }

  onSubmit() {
    if (this.data?.prescription) {
      if (this.presentIllnessForm.valid) {
        const data = {
        illnessid: this.data?.illness && this.data?.illness?.illness_id ? this.data?.illness?.illness_id : 0,
        appointmentid: this.data.illness  ? this.data.illness.appointment_id : this.data.appointmentId ? parseInt(this.data.appointmentId) : 0,
        patientid: parseInt(this.data?.userId),
        settingid: this.presentIllnessForm.get('settingAki').value,
        onsetid: this.presentIllnessForm.get('onset').value,
        is_recurrence: this.presentIllnessForm.get('recurrence').value,
        symptons_signs: this.selectedSymptoms.toString(),
        }
        this.dialogRef.close(data);
      }
    }
    else {
      this.submitted = true;
      if (this.presentIllnessForm.invalid) {
        return;
      }
      const body = {
        illnessid: this.data.illness && this.data.illness.illness_id ? this.data.illness.illness_id : 0,
        appointmentid: this.data.illness  ? this.data.illness.appointment_id : this.data.appointmentId ? parseInt(this.data.appointmentId) : 0,
        patientid: parseInt(this.data.userId),
        settingid: this.presentIllnessForm.get('settingAki').value,
        onsetid: this.presentIllnessForm.get('onset').value ? this.presentIllnessForm.get('onset').value : 0,
        is_recurrence: this.presentIllnessForm.get('recurrence').value,
        symptons_signs: this.selectedSymptoms,
      };
      const url = 'api/PatientIllnessAndCompliants/ManagePatientPresentIllness';
      this.httpService.create(url, body).subscribe((res: any) => {
        this.dialogRef.close(true);
        this.snackBar.open(this.editMode ? 'Present illness updated successfully.' : 'Present illness added successfully.', 'close', {
          panelClass: "snackBarSuccess",
          duration: 2000,
        });
      },
      (error: any) => {
          console.log('error', error);
      });

    }
  }

  onReset(): void {
    this.submitted = false;
    this.presentIllnessForm.reset();
    this.selectedSymptoms = [];
  }
test:boolean;
  selectedSymptom(data: any, evnt: any) {
    console.log(data)
  if(data.name == 'Other'){
    this.test=true;
  }

    console.log(data);
    if(evnt.checked) {
      this.selectedSymptoms.push(data.name);
    }
    else {
      this.selectedSymptoms =  _.without(this.selectedSymptoms, data.name)
    }
  }
}

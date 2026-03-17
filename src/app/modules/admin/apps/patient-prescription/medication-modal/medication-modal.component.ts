import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { APIService } from 'app/core/api/api';
import { AuthService } from 'app/core/auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import * as moment from 'moment';

export type DrugData = {
  drugId: number,
  description: string
}
@Component({
  selector: 'app-medication-modal',
  templateUrl: './medication-modal.component.html', 
  styleUrls: ['./medication-modal.component.scss']
})
export class MedicationModalComponent implements OnInit {
  medicationForm: FormGroup;
  LinkSubObj: any[];
  doseMedication$ = new BehaviorSubject<any>(null);
  foodMedication$ = new BehaviorSubject<any>(null);
  frequencyMedication$ = new BehaviorSubject<any>(null);
  editMode = false;
  filteredOptions$  = new BehaviorSubject<DrugData[]>(null);
  drugData : DrugData;
  userInfo: any;
  isLoadingSpinner:boolean=false;
  constructor(private fb: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private httpService: APIService,
    private auth: AuthService) { 
      this.userInfo = JSON.parse(this.auth.user);
    }

  ngOnInit(): void {
    console.log(this.data);
    if (this.data && this.data.userId && this.data.medications) {
      this.editMode = true;
    }
    this.getMasterDataInfo(38);
    this.getMasterDataInfo(39);
    this.getMasterDataInfo(40);
    this.medicationForm = this.fb.group({
      employees: this.fb.array([])
    }); 
    this.employees().push(this.newEmployee());
    if(this.data && this.data.medications && this.data.medications.medication_id) {
      this.updateFormData();
    }
  }
  employees(): FormArray {
    return this.medicationForm.get('employees') as FormArray;
  }

  newEmployee(): FormGroup {
    return this.fb.group({
      medicineId:[0],
      medicine: ['', [Validators.required]],
      dose: [ '',Validators.required],
      // time: [ '',Validators.required],
      food: [ '',Validators.required],
      // frequency: [ '',Validators.required],
      duration: [ '',Validators.required],
      appointmentId: [0],
      note:''
      //skills: this.fb.array([])
    });
  }

  updateFormData() {
    const data = {
      employees: [{
        medicineId: this.data.medication_id,
        medicine: this.data.medications.drug_name,
        dose: this.data.medications.dose,
        time: this.data.medications.timing,
        appointmentId : this.data.appointment_id,
        food: this.data.medications.food,
        frequency: this.data.medications.frequency,
        duration: this.data.medications.duration,
        note: this.data.medications.notes,
      }]
    }
    this.medicationForm.patchValue(data);
  }

  addEmployee() {
    this.employees().push(this.newEmployee());
  }

  removeEmployee(empIndex: number) {
    this.employees().removeAt(empIndex);
  }
  getMedicineType(medicine){
    let medicine_type:any;
    if(medicine.match('CAP')){
      return 'Capsule'
    }else if(medicine.match('INJ')){
      return 'Injection'
    }
    else if(medicine.match('TAB')){
      return 'Tablet'
    }else{
      return '';
    }
  }

  onSubmit() {
    this.isLoadingSpinner=true;
    const addedMedications = [];
    const medicationInfo = this.medicationForm.value;
    medicationInfo.employees.forEach((data: any) => {
      const obj = {
        medicationid: this.data?.medications ? this.data.medications.medication_id : 0,
        appointmentid: data.medicineId ? data.appointment_id : this.data.appointmentId ? parseInt(this.data.appointmentId) : 0,
        patientid: parseInt(this.data.userId),
        drugname: data.medicine,
        dose_type: data.dose,
        // timing_type: data.time,
        food_type: data.food,
        // frequency_type: data.frequency,
        duration_type: data.duration,
        notes_info: data.note,
        createdby: this.userInfo.user_id,
        is_active: true,
        medicine_from: moment(new Date()),
        medicine_to: moment().add(data.duration, 'days'),
        dose_description: data.dose == '1 - 1 - 1' ? 'Morning, Afternoon, Night' : data.dose == '1 - 1 - 0' ? 'Morning, Afternoon' : data.dose == '1 - 0 - 0' ? 'Morning' : data.dose == '0 - 1 - 1' ? 'Afternoon, Night' : data.dose == '0 - 0 - 1' ? 'Night' : data.dose == '1 - 0 - 1'? 'Morning, Night' : data.dose == '0 - 1 - 0'? 'Afternoon': '',
        medicine_type:this.getMedicineType(data.medicine)
      }
      addedMedications.push(obj); 
    });
      const url = 'api/Doctor/SaveCurrentMedicationEntry';
      this.httpService.create(url, addedMedications).subscribe((res: any) => {
        this.isLoadingSpinner=false;
        console.log(res);
        if(this.editMode){
          this.snackBar.open('Medication updated successfully. ', 'close', {
            panelClass: "snackBarSuccess",
            duration: 2000,
          });
        }else{
          this.snackBar.open('Medication added successfully. ', 'close', {
            panelClass: "snackBarSuccess",
            duration: 2000,
          });
        }
        
        this.dialogRef.close(true);
      },
      (error: any) => {
          console.log('error', error);
      });
  }

  onReset(): void {
    this.medicationForm.reset();
  }

  getMasterDataInfo(type) {
    const url = `api/User/GetMasterData?mastercategoryid=`+type;
    
    this.httpService.getAll(url).subscribe((res: any) => {
        switch(type) {
          case 38: 
            this.doseMedication$.next(res.data);
            console.log(this.doseMedication$);
            break;
          case 39: 
            this.foodMedication$.next(res.data);
            console.log(this.foodMedication$);
            break;
          case 40: 
            this.frequencyMedication$.next(res.data);
            console.log(this.frequencyMedication$);
            break;
          default:
      }
    },
    (error: any) => {
        console.log('error', error);
    });
  }

  searchDrugsTerm(event) {
    const value = event.target.value;
    const url = `api/Doctor/SearchDrugs?searchText=${value}`;
    this.httpService.getAll(url).subscribe((res: any) => {
      if(res.data && res.data.length > 0){
        this.filteredOptions$.next(res.data);
      }
      else {
        this.filteredOptions$.next([]);
        this.drugData = {
          drugId : 0,
          description : ''
        }
      }
    },
    (error: any) => {
        console.log('error', error);
    });
  }
  
}

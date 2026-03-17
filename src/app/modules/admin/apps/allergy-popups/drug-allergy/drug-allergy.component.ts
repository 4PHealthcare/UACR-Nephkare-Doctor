import { Component, Inject, OnInit, ViewChild,ElementRef } from "@angular/core";
import { FormBuilder, FormGroup, NgForm, Validators, AbstractControl } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { APIService } from "app/core/api/api";

import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map, startWith} from 'rxjs/operators';
import { DOWN_ARROW, UP_ARROW } from '@angular/cdk/keycodes';

import { FormControl } from "@angular/forms";
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
} from "@angular/material/autocomplete";
import { MatChipInputEvent } from "@angular/material/chips";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { AuthService } from "app/core/auth/auth.service";
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

@Component({
  selector: 'app-drug-allergy',
  templateUrl: './drug-allergy.component.html',
  styleUrls: ['./drug-allergy.component.scss']
})
export class DrugAllergyComponent implements OnInit {

  observations: any[] = [];
  @ViewChild("observationsInput")
  observationsInput: ElementRef<HTMLInputElement>;
  @ViewChild("auto2") matAutocomplete: MatAutocomplete;
  observationCtrl = new FormControl();
  separatorKeysCodes: number[] = [ENTER];
  filteredObervationsOptions$ = new BehaviorSubject<any[]>(null);
  recentObervations: any;


  submitted=false;
  status: string[] = ["active", "inactive"];
  DrugAllergies: any;
  newDrugAllergies:any;
  drugAllergForm: FormGroup;
  filteredOptions: Observable<string[]>;
  fn: any;
  value: any;
  @ViewChild("drugAllergyNGForm") chiefComplaintNGForm: NgForm;
  isLoadingSpinner:boolean = false;
  allergies: string[] = [];
  reactions: any;
  //status: any;
  editMode = false;
  noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control && control.value && control.value.toString() || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }
  
  constructor(
    private _formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private httpService: APIService,
    public dialogRef: MatDialogRef<any>,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.userId && this.data.drugAllergy) {
      this.editMode = true;
    }
    this.getMasterDataInfo(14);
    this.getMasterDataInfo(13);
    // Create the form
    this.drugAllergForm = this._formBuilder.group({
      allergyName: [null, [Validators.required,this.noWhitespaceValidator]],
      status: ["", [Validators.required]],
      reaction:[null, [Validators.required]]
    });
    this.fn = (evt: KeyboardEvent) => {
      if (evt.keyCode === DOWN_ARROW || evt.keyCode === UP_ARROW) {
        console.log(this.value);
          if (this.value && this.value.length === 1 && this.value[0] === 'No data') {
            evt.stopPropagation();
          }
      }
    }
  
    document.addEventListener('keydown', this.fn, true);
   
  }
  ngOnDestroy() {
    document.removeEventListener('keydown', this.fn);
  }
  get f(): { [key: string]: AbstractControl } {
    return this.drugAllergForm.controls;
  }
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  patchForm() {
    console.log(this.data);
    this.drugAllergForm.patchValue({
      allergyName: this.data.drugAllergy ? this.data.drugAllergy.allergen : '',
      status: this.data.drugAllergy ? this.data.drugAllergy.status.toLowerCase() : '',
      reaction: this.data.drugAllergy ? this.data.drugAllergy.reactions : '',
    });
  }
  onSubmit() {
    this.isLoadingSpinner=true;
    this.allergies.push(this.drugAllergForm.controls.allergyName.value);
    this.submitted = true;
    let reactionList = [];
    for (let i = 0; i < this.observations.length; i++) {
      reactionList.push(this.observations[i].complaint_name);
    }
    let allergyList=[this.drugAllergForm.controls.allergyName.value];
    const body = {
      drugid: this.editMode ? this.data.drugAllergy.drug_id : 0,
      patientid: parseInt(this.data.userId),
      appointmentid: 0,
      allergen_list: allergyList,
      reactions_list: reactionList,
      status_name: this.drugAllergForm.controls.status.value ? this.drugAllergForm.controls.status.value.toLowerCase() : undefined,
     // onsetdate: 
     // createdby: 0
    };
    const url = 'api/PatientRegistration/SavePatientDrugAllergy';
    this.httpService.create(url, body).subscribe((res: any) => {
      // this.dialogRef.close(true);
      this.recentObervations=[];
      this.observations.length=0;
      this.isLoadingSpinner=false;
      this.snackBar.open('Drug allergy added successfully. ', 'close', {
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
    this.drugAllergForm.reset();
    this.dialogRef.close();
  }

  getMasterDataInfo(type) {
    const url = `api/User/GetMasterData?mastercategoryid=`+type; 
    this.httpService.getAll(url).subscribe((res: any) => {         
      // this.reactions = res.data;
      switch(type) {
        case 14: 
          this.DrugAllergies = res.data;
          break;
        case 13: 
          this.reactions = res.data;
          break;
        default:
    }
    if (type ==  14) {
      this.filteredOptions = this.drugAllergForm.controls.allergyName.valueChanges
      .pipe(
        startWith(''),
        map(value => this.searchAllergies(value)),
        tap(value => this.value = value)
      );
    }
    this.patchForm();
    },
    (error: any) => {
        console.log('error', error);
    });
  }
  // searchAllergies(ev){
  //   const value = ev.target.value;
  //   this.newDrugAllergies=this.DrugAllergies;
  //   console.log(value);
  //   if (value && value.trim() != "") {
  //     this.newDrugAllergies = this.newDrugAllergies.filter((item: any) => {
  //       return (
  //         item.data_name.toLowerCase().indexOf(value.toLowerCase()) > -1
  //       );
  //     });
  //   }
  // }
  searchAllergies(value?:string) {
    this.newDrugAllergies=this.DrugAllergies;
    const filterValue = !value? '':value?.toLowerCase();
    this.newDrugAllergies = this.newDrugAllergies?.filter(option => option.data_name.toLowerCase().includes(filterValue));
    return this.newDrugAllergies.length ? this.newDrugAllergies : [{data_name:'No data'}];
  }
  _allowSelection(option: string): { [className: string]: boolean } {
    return {
      'no-data': option === 'No data',
    }
  }

  addOnBlur(event: FocusEvent) {
    const target: HTMLElement = event.relatedTarget as HTMLElement;
    if (!target || target.tagName !== "MAT-OPTION") {
      const matChipEvent: MatChipInputEvent = {
        input: this.observationsInput.nativeElement,
        value: this.observationsInput.nativeElement.value,
      };
      this.addObservation(matChipEvent);
    }
  }

  addObservation(event: MatChipInputEvent): void {
    const input = event.input;
    const value = (event.value || "").trim();

    // Add our fruit
    if ((value || "").trim()) {
      const isOptionSelected = this.matAutocomplete.options.some(
        (option) => option.selected
      );
      if (!isOptionSelected) {
        this.observations.push({
          complaintid: 0,
          patientid: parseInt(this.data.patId),
          appointmentid: 0,
          createdby: parseInt(this.data.doctorId),
          isactive: true,
          complaint_name: value,
        });
      }
    }

    // Reset the input value
    if (input) {
      input.value = "";
    }

    this.observationCtrl.setValue(null);
  }

  removeObservation(lab: any): void {
    if (lab.complaintid) {
      lab.isactive = false;
    } else {
      this.observations = this.observations.filter(
        (obj) => obj.complaint_name !== lab.complaint_name
      );
    }
  }

  duplicateObservationsFound(testName) {
    let obj = this.observations.find((o) => o.complaint_name === testName);
    if (obj) {
      return true;
    } else {
      return false;
    }
  }

  selectedObervation(event: MatAutocompleteSelectedEvent): void {
    if (!this.duplicateObservationsFound(event.option.value)) {
      this.observations.push({
        complaintid: 0,
        patientid: parseInt(this.data.patId),
        appointmentid: 0,
        createdby: parseInt(this.data.doctorId),
        isactive: true,
        complaint_name: event.option.value,
      });
    }

    this.observationsInput.nativeElement.value = "";
    this.observationCtrl.setValue(null);
  }
  searchObservationsTerm(event) {
    const value = event.target.value;
    if (value) {
      const url = `api/User/GetSearchMasterData?mastercategoryid=13&searchtext=${value}`;
      this.httpService.getAll(url).subscribe(
        (res: any) => {
          console.log(res);
          if (res.data && res.data.length > 0) {
            this.recentObervations = res.data.map(value => ({
              name: value.name,
            }));
            this.filteredObervationsOptions$.next(this.recentObervations);
          } else {
            this.filteredObervationsOptions$.next([]);
          }
        },
        (error: any) => {
          console.log("error", error);
        }
      );
    } 
    else {
      this.recentObservationList();
    }
  }
  recentObservationList() {
    const url = `api/User/GetMasterData?mastercategoryid=13`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        if (res.data && res.data.length > 0) {
          this.recentObervations = res.data.map(value => ({
            name: value.data_name,
          }));
          this.filteredObervationsOptions$.next(this.recentObervations);
        } else {
          this.filteredObervationsOptions$.next([]);
        }
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }
  recentObservation() {
    this.recentObservationList();
  }
  selectionMade(event: Event, trigger: MatAutocompleteTrigger) {
    event.stopPropagation();
    trigger.openPanel();
}
}

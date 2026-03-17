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
  selector: 'app-environmental-allergy',
  templateUrl: './environmental-allergy.component.html',
  styleUrls: ['./environmental-allergy.component.scss']
})
export class EnvironmentalAllergyComponent implements OnInit {
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
  environmentAllergyForm: FormGroup;
  filteredOptions: Observable<string[]>;
  fn: any;
  value: any;
  @ViewChild("environmentAllergyNGForm") chiefComplaintNGForm: NgForm;
  isLoadingSpinner:boolean=false;
  envAllergies: any;
  newenvAllergies:any;
  envReactions: any;
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
    if (this.data && this.data.userId && this.data.envAllergy) {
      this.editMode = true;
    }
    this.getMasterDataInfo(15);
    this.getMasterDataInfo(13);
    this.getMasterDataInfo(14);
    // Create the form
    this.environmentAllergyForm = this._formBuilder.group({
      allergyName: [null, [Validators.required,this.noWhitespaceValidator]],
      status: ["", [Validators.required]],
      reaction:["", [Validators.required]]
    });

    this.environmentAllergyForm.patchValue({
      allergyName: this.data.envAllergy ? this.data.envAllergy.allergen : '',
      status: this.data.envAllergy ? this.data.envAllergy.status.toLowerCase() : '',
      reaction: this.data.envAllergy ? this.data.envAllergy.reactions : '',
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
    return this.environmentAllergyForm.controls;
  }
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  onSubmit() {
    this.isLoadingSpinner=true;
    let allergyList=[this.environmentAllergyForm.controls.allergyName.value];
    let reactionList = [];
    for (let i = 0; i < this.observations.length; i++) {
      reactionList.push(this.observations[i].complaint_name);
    }
    console.log('Entered')
    this.submitted = true;
    if (this.environmentAllergyForm.invalid) {
      
      return;
    }
    const body = {
      environmentid: this.editMode ? this.data.envAllergy.environment_id : 0,
      patientid: parseInt(this.data.userId),
      appointmentid: 0,
      allergen_list: allergyList,
      reactions_list: reactionList,
      status_name: this.environmentAllergyForm.controls.status.value ? this.environmentAllergyForm.controls.status.value.toLowerCase() : undefined,
     // onsetdate: 
     // createdby: 0
    };
    const url = 'api/PatientRegistration/SavePatientEnvironmentAllergy';
    this.httpService.create(url, body).subscribe((res: any) => {
       this.isLoadingSpinner=false;
       this.recentObervations=[];
        this.observations.length=0;
      this.snackBar.open('Environmental allergy added successfully. ', 'close', {
        panelClass: "snackBarSuccess",
        duration: 2000,
      });
    },
    (error: any) => {
        console.log('error', error);
    });
    console.log(JSON.stringify(this.environmentAllergyForm.value, null, 2));
  }
  onReset(): void {
    this.submitted = false;
    this.environmentAllergyForm.reset();
    this.dialogRef.close();
  }

  getMasterDataInfo(type) {
    const url = `api/User/GetMasterData?mastercategoryid=`+type;
    
    this.httpService.getAll(url).subscribe((res: any) => {
        switch(type) {
          case 15: 
            this.envAllergies = res.data;
            break;
          case 13: 
            this.envReactions = res.data;
            break;
          default:
      }
      if (type ==  15) {
        this.filteredOptions = this.environmentAllergyForm.controls.allergyName.valueChanges
        .pipe(
          startWith(''),
          map(value => this.searchAllergies(value)),
          tap(value => this.value = value)
        );
      }
      console.log(this.envAllergies);
    },
    (error: any) => {
        console.log('error', error);
    });
  }
  // searchAllergies(ev){
  //   const value = ev.target.value;
  //   this.newenvAllergies=this.envAllergies;
  //   console.log(value);
  //   if (value && value.trim() != "") {
  //     this.newenvAllergies = this.newenvAllergies.filter((item: any) => {
  //       return (
  //         item.data_name.toLowerCase().indexOf(value.toLowerCase()) > -1
  //       );
  //     });
  //   }
  // }
  searchAllergies(value?:string) {
    this.newenvAllergies=this.envAllergies;
    const filterValue = !value?'':value?.toLowerCase();
    this.newenvAllergies = this.newenvAllergies?.filter(option => option.data_name.toLowerCase().includes(filterValue));
    return this.newenvAllergies.length ? this.newenvAllergies : [{data_name:'No data'}];
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

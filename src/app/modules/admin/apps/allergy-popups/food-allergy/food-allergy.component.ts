import {
  Component,
  Inject,
  OnInit,
  ViewChild,
  ElementRef,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  NgForm,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { APIService } from "app/core/api/api";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";
import { tap, map, startWith } from "rxjs/operators";
import { DOWN_ARROW, UP_ARROW } from "@angular/cdk/keycodes";

import { FormControl } from "@angular/forms";
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
} from "@angular/material/autocomplete";
import { MatChipInputEvent } from "@angular/material/chips";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { AuthService } from "app/core/auth/auth.service";
import {MatAutocompleteTrigger} from "@angular/material/autocomplete";

@Component({
  selector: "app-food-allergy",
  templateUrl: "./food-allergy.component.html",
  styleUrls: ["./food-allergy.component.scss"],
})
export class FoodAllergyComponent implements OnInit {
  observations: any[] = [];
  @ViewChild("observationsInput")
  observationsInput: ElementRef<HTMLInputElement>;
  @ViewChild("auto2") matAutocomplete: MatAutocomplete;
  observationCtrl = new FormControl();
  separatorKeysCodes: number[] = [ENTER];
  filteredObervationsOptions$ = new BehaviorSubject<any[]>(null);
  recentObervations: any;
 isLoadingSpinner:boolean=false;

  submitted=false;
  filteredOptions: Observable<string[]>;
  fn: any;
  value: any;
  allFoodAllergies$ = new BehaviorSubject<any>(null);
  id: any;
  status: string[] = ["active", "inactive"];
  cars = [
    { id: 1, name: "Milk" },
    { id: 2, name: "Egg" },
    { id: 3, name: "Cabbage" },
  ];
  foodAllergyForm: FormGroup;
  @ViewChild("foodAllergyNGForm") chiefComplaintNGForm: NgForm;
  allergies: any;
  newAllergies: any;
  reactions: any;
  editMode = false;
  found: any;
  userInfo: any;
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
    private snackBar: MatSnackBar,
    private _activatedRoute: ActivatedRoute,
    private auth: AuthService
  ) {
    this.userInfo = JSON.parse(this.auth.user);
  }

  ngOnInit(): void {
    this._activatedRoute.queryParams.subscribe((params) => {
      this.id = params["id"];
    });
    console.log(this.id);
    if (this.data && this.data.userId && this.data.foodAllergy) {
      this.editMode = true;
    }
    this.getFoodAllergies();
    this.getMasterDataInfo(12);
    this.getMasterDataInfo(13);

    // Create the form
    this.foodAllergyForm = this._formBuilder.group({
      allergyName: [null, [Validators.required,this.noWhitespaceValidator]],
      status: ["", [Validators.required]],
      reaction: [null, [Validators.required]],
    });

    this.foodAllergyForm.patchValue({
      allergyName: this.data.foodAllergy ? this.data.foodAllergy.allergen : "",
      status: this.data.foodAllergy
        ? this.data.foodAllergy.status.toLowerCase()
        : "",
      reaction: this.data.foodAllergy ? this.data.foodAllergy.reactions : "",
    });

    this.fn = (evt: KeyboardEvent) => {
      if (evt.keyCode === DOWN_ARROW || evt.keyCode === UP_ARROW) {
        console.log(this.value);
        if (
          this.value &&
          this.value.length === 1 &&
          this.value[0] === "No data"
        ) {
          evt.stopPropagation();
        }
      }
    };

    document.addEventListener("keydown", this.fn, true);
  }
  ngOnDestroy() {
    document.removeEventListener("keydown", this.fn);
  }
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  get f(): { [key: string]: AbstractControl } {
    return this.foodAllergyForm.controls;
  }
  onSubmit() {
    let reactionList = [];
    for (let i = 0; i < this.observations.length; i++) {
      reactionList.push(this.observations[i].complaint_name);
    }
    console.log(reactionList);
    this.isLoadingSpinner=true;
    let allergyList=[];
    allergyList.push(this.foodAllergyForm.controls.allergyName.value);
    if (this.found && !this.editMode) {
      this.snackBar.open("Food allergy already there. ", "close", {
        panelClass: "snackBarError",
        duration: 2000,
      });
    } else {
      this.submitted = true;
      if (this.foodAllergyForm.invalid) {
        return;
      }
      const body = {
        foodid: this.editMode ? this.data.foodAllergy.food_id : 0,
        patientid: parseInt(this.data.userId),
        appointmentid: 0,
        allergen_list: allergyList,
         reactions_list: reactionList,
        status_name: this.foodAllergyForm.controls.status.value
          ? this.foodAllergyForm.controls.status.value.toLowerCase()
          : undefined,
      };
      const url = 'api/PatientRegistration/SavePatientFoodAllergy';
      this.httpService.create(url, body).subscribe((res: any) => {
        
        this.isLoadingSpinner=false;
        this.reactions=[];
        this.observations.length=0;
        this.getFoodAllergies();
        // this.dialogRef.close(true);
        this.snackBar.open('Food allergy added successfully. ', 'close', {
          panelClass: "snackBarSuccess",
          duration: 2000,
        });
      },
      (error: any) => {
          console.log('error', error);
      });
      console.log(JSON.stringify(this.foodAllergyForm.value, null, 2));
    }
  }
  onReset(): void {
    this.submitted = false;
    this.foodAllergyForm.reset();
    this.dialogRef.close();
  }

  getMasterDataInfo(type) {
    const url = `api/User/GetMasterData?mastercategoryid=` + type;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        switch (type) {
          case 4:
            this.status = res.data;
            break;
          case 12:
            this.allergies = res.data;
            break;
          case 13:
            this.reactions = res.data;
            break;
          default:
        }
        if (type == 12) {
          this.filteredOptions =
            this.foodAllergyForm.controls.allergyName.valueChanges.pipe(
              startWith(""),
              map((value) => this.searchAllergies(value)),
              tap((value) => (this.value = value))
            );
        }
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }
  _temp_list: any;
  _new_temp_list: any;
  getFoodAllergies() {
    const url = `api/PatientRegistration/GetPatientFoodAllergies?patientid=${this.id}&appointmentId=0`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        if (res.data) {
          this.allFoodAllergies$.next(res.data);
          this._temp_list = res.data.reduce(
            (accumulator, obj) => [...accumulator, ...obj.allergen],
            []
          );
        } else {
          this.allFoodAllergies$.next([]);
        }
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }

  checkDuplicate(val) {
    this.found = this._temp_list.some((r) => val.indexOf(r) >= 0);
  }

  searchAllergies(value?: string) {
    this.newAllergies = this.allergies;
    const filterValue = !value? '': value?.toLowerCase();
    this.newAllergies = this.newAllergies?.filter((option) =>
      option.data_name.toLowerCase().includes(filterValue)
    );
    return this.newAllergies?.length
      ? this.newAllergies
      : [{ data_name: "No data" }];
  }

  _allowSelection(option: string): { [className: string]: boolean } {
    return {
      "no-data": option === "No data",
    };
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

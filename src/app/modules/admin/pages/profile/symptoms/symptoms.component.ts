import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
} from "@angular/material/autocomplete";
import { MatChipInputEvent } from "@angular/material/chips";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { APIService } from "app/core/api/api";
import { BehaviorSubject } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";

import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import { AuthService } from "app/core/auth/auth.service";
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
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
  selector: "app-symptoms",
  templateUrl: "./symptoms.component.html",
  styleUrls: ["./symptoms.component.scss"],
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
export class SymptomsComponent implements OnInit {
  observations: any[] = [];
  @ViewChild("observationsInput")
  observationsInput: ElementRef<HTMLInputElement>;
  @ViewChild("auto2") matAutocomplete: MatAutocomplete;
  // @ViewChild(MatAutocompleteTrigger, {read: MatAutocompleteTrigger}) inputAutoComplit: MatAutocompleteTrigger;

  observationCtrl = new FormControl('',Validators.required);
  separatorKeysCodes: number[] = [ENTER];
  filteredObervationsOptions$ = new BehaviorSubject<any[]>(null);
  // date:string='';
  // durationId:any;
  // durationValue:any;
  // durations: any;
  // maxDate = new Date();
  userInfo:any;
  recentObervations: any;
  isLoadingSpinner:boolean=false;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>,
    private httpService: APIService,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) {
    this.userInfo = JSON.parse(this.auth.user);
  }

  ngOnInit(): void {
    console.log(this.data);
    // this.getDurations();
    let obj = this;
    if (
      this.data.complaints &&
      this.data.complaints.complaints_list &&
      this.data.complaints.complaints_list.length !== 0
    ) {
      this.observations = this.data.complaints.complaints_list.map(function (test: any) {
        return {
          patientid: parseInt(obj.data.patId),
          appointmentid: test.appointment_id,
          createdby: parseInt(obj.data.doctorId),
          isactive: true,
          complaintid: test.complaint_id,
          complaint_name: test.complaint,
        };
      });
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
    // const index = this.labs.indexOf(lab);
    // if (index >= 0) {
    //   this.labs.splice(index, 1);
    // }

    if (lab.complaintid) {
      lab.isactive = false;
    } else {
      this.observations = this.observations.filter(
        (obj) => obj.complaint_name !== lab.complaint_name
      );
    }

    // this.observations = this.observations.filter(obj => obj.complaint_name !== lab);
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
    // this.savePrescription(true);
  }

  // searchObservationsTerm(event) {
  //   const value = event.target.value;
  //   const url = `api/User/GetSearchMasterData?mastercategoryid=70&searchtext=${value}`;
  //   this.httpService.getAll(url).subscribe(
  //     (res: any) => {
  //       if (res.data && res.data.length > 0) {
  //         this.filteredObervationsOptions$.next(res.data);
  //       } else {
  //         this.filteredObervationsOptions$.next([]);
  //       }
  //     },
  //     (error: any) => {
  //       console.log("error", error);
  //     }
  //   );
  // }
  searchObservationsTerm(event) {

    const value = event.target.value;
    if(value) {
      const url = `api/User/GetSearchMasterData?mastercategoryid=70&searchtext=${value}`;
      this.httpService.getAll(url).subscribe(
        (res: any) => {
          if (res.data && res.data.length > 0) {
            this.filteredObervationsOptions$.next(res.data);
          } else {
            this.filteredObervationsOptions$.next([]);
          }
        },
        (error: any) => {
          console.log("error", error);
        }
      );
    } else {
      this.recentObservationList();
      // const url = `api/Doctor/GetPatientChiefComplaintsBySearch?doctorid=${this.userInfo.user_id}`;
      // this.httpService.getAll(url).subscribe(
      //   (res: any) => {
      //     if (res.data && res.data.length > 0) {
      //       this.recentObervations = res.data.map(value => ({
      //         name: value.complaint,
      //       }));
      //       this.filteredObervationsOptions$.next(this.recentObervations);
      //     } else {
      //       this.filteredObervationsOptions$.next([]);
      //     }
      //   },
      //   (error: any) => {
      //     console.log("error", error);
      //   }
      // );
    }
   
  }
  recentObservationList(){
    const url = `api/Doctor/GetPatientChiefComplaintsBySearch?doctorid=${this.userInfo.user_id}`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        if (res.data && res.data.length > 0) {
          this.recentObervations = res.data.map(value => ({
            name: value.complaint,
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
  recentObservation(){
    this.recentObservationList();
  }

  save() {
    this.isLoadingSpinner=true;
    const url = `api/Doctor/SavePatientSymptoms?patientId=${this.data.patId}&appointmentid=0&date_=''`;
    this.httpService.create(url, this.observations).subscribe(
      (res: any) => {
        if (res.data) {
          this.isLoadingSpinner=false;
          this.snackBar.open(
            "Symptoms added successfully. ",
            "close",
            {
              panelClass: "snackBarSuccess",
              duration: 2000,
            }
          );
          this.dialogRef.close(true);
        }
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }

  cancel() {}
  // getDurations() {
  //   const url = `api/User/GetMasterData?mastercategoryid=26`;
  //   this.httpService.getAll(url).subscribe((res: any) => {
  //     this.durations = res.data;
  //   });
  // }
  // openPanel(evt): void {
  //   evt.stopPropagation();
  //   this.inputAutoComplit.openPanel();
  // }
  selectionMade(event: Event, trigger: MatAutocompleteTrigger) {
    event.stopPropagation();
    trigger.openPanel();
    this.recentObservationList();
}
clear(){
  if(this.observations.length > 0){
    this.dialogRef.close();
  }else{
    this.observations =[];
  }
  
}
}

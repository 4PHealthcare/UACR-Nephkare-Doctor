import {
  Component,
  Inject,
  OnInit,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { FormGroup, NgForm, Validators, FormControl } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { APIService } from "app/core/api/api";
import { AuthService } from "app/core/auth/auth.service";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";


@Component({
  selector: "app-settings-modal",
  templateUrl: "./settings-modal.component.html",
  styleUrls: ["./settings-modal.component.scss"],
})
export class SettingsModalComponent implements OnInit {
 
  userInfo:any;
  patientId:number;
  filteredPatientOptions$ = new BehaviorSubject<any[]>(null);
  filteredOptions$ = new BehaviorSubject<any[]>(null);
  filteredCareOptions$ = new BehaviorSubject<any[]>(null);
  filteredCoachOptions$ = new BehaviorSubject<any[]>(null);
  
  accountInfo:any = {};
  selectedPatientId:number;
  selectedCareId:number;
  selectedCoachId:number;
  patientAppointmentForm: FormGroup;
  selectedPatient$ = new BehaviorSubject<string>(null);
  disablebtn:boolean = false;
  inputText:string;
  specialities:any [] = [];
  selectedDoctor: number;
  doctorText:string;
  labs:any = [];

  constructor(
    public dialogRef: MatDialogRef<any>,
    private auth: AuthService,
    private router: Router,
    private httpService: APIService,
    
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userInfo = JSON.parse(this.auth.user);
  }

  ngOnInit(): void {

    console.log(this.data);


    this.patientId = this.data.patient ? this.data.patient.user_id : 0;
    
   

    // this.patientId = this.data.patient ? this.data.patient.patient_id : 0;
    
    // if (this.patientId) {
    //   this.selectedPatientId = this.patientId;
    //   this.selectedPatient$.next(this.data.patient.first_name + ' ' + this.data.patient.last_name + ' - ' + this.data.patient.age+'yrs'+ ' - ' +this.data.patient.gender);

    // }else{
    //   this.selectedPatientId = this.data.patient.patient_id;
    //   this.selectedPatient$.next(this.data.patient.full_name + ' - ' + this.data.patient.age+'yrs'+ ' - ' +this.data.patient.gender);
    // }
    this.patientAppointmentForm = new FormGroup({
      // scheduleDate: new FormControl("", [Validators.required]),
      // scheduleTime: new FormControl("", [Validators.required]),
      // appointmentId:new FormControl("", [Validators.required]),
      specialityid: new FormControl("", [Validators.required]),
      careCoordinatorId: new FormControl("", [Validators.required]),
      coachId: new FormControl("", [Validators.required]),
      doctorId:new FormControl({value:'',disabled: false }, [Validators.required])
        
    });
    if (this.patientId) {
      this.selectedPatientId = this.patientId;
      this.selectedPatient$.next(this.data.patient.first_name + ' ' + this.data.patient.last_name + ' - ' + this.data.patient.age+'yrs'+ ' - ' +this.data.patient.gender);

    }else{
      this.selectedPatientId = this.data.patient.patient_id;
      this.selectedPatient$.next(this.data.patient.full_name + ' - ' + this.data.patient.age+'yrs'+ ' - ' +this.data.patient.gender);
      this.selectedDoctor = this.data.patient.doctor_id;
      this.selectedCareId = this.data.patient.assigned_to_careteam;
      this.selectedCoachId = this.data.patient.coach_id;
      this.patientAppointmentForm.patchValue({
        doctorId:this.data.patient.doctor,
        careCoordinatorId:this.data.patient.coordinator,
        coachId:this.data.patient.coach,
        specialityid:this.data.patient.speciality_id
      })
      console.log(this.selectedDoctor);

    }
    this.getMasterDataInfo();
    
  }

  dismiss() {
    this.dialogRef.close();
  }

  getDoctorDetails() {
    let obj = this;
    this.httpService.get("api/User/GetUsersById?userId=", this.userInfo?.user_id).subscribe(
      (res: any) => {
        obj.accountInfo = res.data;
        if(obj.accountInfo.role_id == 5) {
          obj.patientAppointmentForm.patchValue(
            {
              specialityid: obj.accountInfo.speciality_id
            },
        );
       // this.patientAppointmentForm.controls['specialityid'].disable();
        } else {

        }
       

      // 


      },
      (error: any) => {
        console.warn("error", error);
      }
    );
  }

  onSelectionChangePatient(event, value?:any) {
    console.log('click event')
if(event !== null && event?.option?.value !== undefined) {
  this.selectedPatient$.next(event.option.value);
  this.selectedPatientId=event?.option.id;
}
this.selectedPatientId = event?.option?.id !== undefined ? event?.option?.id : value;

}

onSelectionChange(event: any) {
  console.log('click..........')
  // this.patientAppointmentForm.controls.scheduleTime.setValue(undefined);
  // this.patientAppointmentForm.controls.scheduleDate.setValue(undefined);
  this.selectedDoctor = event.option.id;
  // this.patientAppointmentForm.controls['doctorId'].disable();

  // this.patientAppointmentForm.controls.scheduleTime.setValue(undefined);
  // this.patientAppointmentForm.controls.scheduleDate.setValue(undefined);
  // this.isScheduleTimeListEmpty=true;
  //this.getSchedukeTimes();
}

onSelectionCareChange(event: any) {
  this.selectedCareId = event.option.id;
}
onSelectioncoachChange(event: any) {
  this.selectedCoachId = event.option.id;
}

changeSpeciality(value:any) {
    
  // this.patientAppointmentForm.controls.doctorId.enable();
  // this.patientAppointmentForm.controls.scheduleTime.setValue(undefined);
  this.patientAppointmentForm.controls.doctorId.setValue(undefined);
  this.filteredPatientOptions$.next([]);
}

onSearchTerm(event) {
  this.doctorText = event.target.value;
  this.searchDoctors(event.target.value);
}

searchDoctors(value) {

  const url = `api/Doctor/SearchDoctor?searchText=${value}&mainbranchid=${this.userInfo.admin_account}&ismainbranch=true&specialityid=${this.patientAppointmentForm.controls.specialityid.value}`;
  this.httpService.getAll(url).subscribe(
    (res: any) => {
      if (res.data && res.data.length > 0) {
        this.filteredOptions$.next(res.data);
        console.log(this.filteredOptions$);
      } else {
        this.filteredOptions$.next([]);
      
      }
    },
    (error: any) => {
      console.log("error", error);
    }
  );
  
  


 
}

searchRole(roleId:number, event) {

  const url = `api/Patient/SearchTeamBasedOnRole?searchText=${event.target.value}&roleid=${roleId}&adminid=3`;
  this.httpService.getAll(url).subscribe(
    (res: any) => {
      if (res.data && res.data.length > 0) {
        if (roleId == 4) {
          this.filteredCareOptions$.next(res.data);
        } else {
          this.filteredCoachOptions$.next(res.data);
        }
       
      } else {

        if (roleId == 4) {
          this.filteredCareOptions$.next([]);
        } else {
          this.filteredCoachOptions$.next([]);
        }      
      }
    },
    (error: any) => {
      console.log("error", error);
    }
  );
  
  


 
}

getMasterDataInfo() {
  

  const url2 = `api/User/GetMasterData?mastercategoryid=`+21;
     
  this.httpService.getAll(url2).subscribe((res: any) => {
      this.specialities=res.data;   
      this.getDoctorDetails(); 
  },
  (error: any) => {
      console.log('error', error);
  });



}

clear() {

}
addService() {

}

clearDoctorId() {
  this.doctorText = undefined;
  this.selectedDoctor = undefined;
  this.patientAppointmentForm.controls['doctorId'].setValue(undefined);
}

clearCoach() {
  this.selectedCoachId = undefined;
  this.patientAppointmentForm.controls['coachId'].setValue(undefined);
}

clearCare() {
  this.selectedCareId = undefined;
  this.patientAppointmentForm.controls['careCoordinatorId'].setValue(undefined);
}

addSettings() {
  
  const obj = {
    "patient_id": this.selectedPatientId,
    "subscription_id": this.data.patient.opinion_id,
    "doctor_id": this.selectedDoctor,
    "coach_id": this.selectedCoachId,
    "cordinator_id": this.selectedCareId  
  }

  const url = `api/Patient/SavePatientSubscription_SupportTeam`;
     
  this.httpService.create(url, obj).subscribe((res: any) => {

    if(res.data) {
      this.dialogRef.close(true);
    }

  },
  (error: any) => {
      console.log('error', error);
  });

}


 
}

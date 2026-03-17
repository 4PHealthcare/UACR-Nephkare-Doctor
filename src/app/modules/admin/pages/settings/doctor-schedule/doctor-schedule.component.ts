import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTableDataSource } from "@angular/material/table";
import { FuseConfirmationService } from "@fuse/services/confirmation";
import { APIService } from "app/core/api/api";
import { AuthService } from "app/core/auth/auth.service";
import { UserService } from "app/core/user/user.service";
import * as moment from 'moment';



// const ELEMENT_DATA: PeriodicElement[] = [
//   { position: 1, name: "Hydrogen", weight: 1.0079, symbol: "H" },
//   { position: 2, name: "Helium", weight: 4.0026, symbol: "He" },
//   { position: 3, name: "Lithium", weight: 6.941, symbol: "Li" },
// ];

@Component({
  selector: "app-doctor-schedule",
  templateUrl: "./doctor-schedule.component.html",
  styleUrls: ["./doctor-schedule.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorScheduleComponent implements OnInit {
  isLoadingSpinner:boolean=false;
  isLoadingSpin:boolean=false;
  scheduledList: any[] = [];
  newShcheduleList: any = [];
  scheduleId: any;
  saveDisable:boolean = true;
  errorFound:boolean = false;
  feeMandatory:boolean = false;
  changesFound:boolean = false;
  endTimeError:boolean  =  false;
  displayedColumns: string[] = [
    "consultation_duration",
    "weeks",
    "from_time",
    "to_time",
    "action",
  ];
  dayMasterData: any = [];
  medicalInfoSelected: any = [];
  @ViewChild("fromtime") fromtime: any;
  @ViewChild("totime") totime: any;

  accountForm: FormGroup;
  feeForm: FormGroup;
  userInfo: any;
  accountInfo: any;
  photo: any;
  loading: boolean = false;
  uploaded = false;
  filename: any;
  mimetype: any;
  fileBase64: any;
  feeInfo:any = {};

  constructor(
    private _formBuilder: FormBuilder,
    private httpService: APIService,
    private auth: AuthService,
    private snackBar: MatSnackBar,
    private _userService: UserService,
    private _fuseConfirmationService: FuseConfirmationService,
    private cd: ChangeDetectorRef
  ) {
    this.userInfo = JSON.parse(this.auth.user);
  }

  ngOnInit(): void {

    let user = this._userService.user;
    console.log(user);
    this.getDays();
    // Create the form
    this.intitForm();
    this.getDoctorSchedule(this.userInfo.user_id);
    this.getUserInfo(this.userInfo.user_id);
  }

  intitForm() {
    this.accountForm = new FormGroup({
      slotDuration: new FormControl("", [Validators.required]),
      fromtime: new FormControl("", [Validators.required]),
      totime: new FormControl("", [Validators.required]),
    });

    this.feeForm = new FormGroup({
      videoconsultationfee: new FormControl({ value: "", disabled: true }),
      clientconsultationfee: new FormControl({ value: "", disabled: true }),
      isslotsdisplay:new FormControl({ value: false, disabled: true }),
      isEnabledVideoConsultation: new FormControl({ value: false, disabled: true }),
      isEnabledClientConsultaion: new FormControl({ value: false, disabled: true })
    });

    this.accountForm.get('totime').valueChanges.subscribe(val => {
      this.endTimeError = false;
    });
  
    this.accountForm.valueChanges.subscribe(x => {
      this.changesFound = true;
    })


  }

  getUserInfo(userId: number) {
    this.httpService.get("api/User/GetUsersById?userId=", userId).subscribe(
      (res: any) => {
        if (res.data) {          
          this.feeInfo= res.data;
          this.feeForm.patchValue({
            isEnabledClientConsultaion : this.feeInfo.isclient_consultationfee,
            isEnabledVideoConsultation: this.feeInfo.isvideo_consultationfee,
            videoconsultationfee: this.feeInfo.video_consultationfee,
            clientconsultationfee: this.feeInfo.client_consultationfee,
            isslotsdisplay:this.feeInfo.is_slots_display
          })

          if( !(this.feeInfo.isclient_consultationfee || this.feeInfo.isvideo_consultationfee)) {
            this.feeForm.get('isEnabledVideoConsultation').enable();
            this.feeForm.get('isEnabledClientConsultaion').enable();
            this.saveDisable = false;
          }
          
        }
      },
      (error: any) => {
        console.warn("error", error);
      }
    );
  }

  enableVideo(event:any) {

    if (event) {
      this.feeForm.get('videoconsultationfee').enable();
    } else {
      this.feeForm.get('videoconsultationfee').disable();
    }
  }

  enableClinic(event:any) {

    if (event) {
      this.feeForm.get('clientconsultationfee').enable();
    } else {
      this.feeForm.get('clientconsultationfee').disable();
    }
  }

  checkTime() {
    let start = moment(this.accountForm.value.fromtime, ["h:mm A"]).format("HH:mm");
    let end = moment(this.accountForm.value.totime, ["h:mm A"]).format("HH:mm");    
    let startTime = moment([start], "HH:mm");
    let endTime = moment([end], "HH:mm");
    return startTime.isBefore(endTime);
  }

  getDays() {
    this.dayMasterData = [
      {
        name: "All Days",
        masterdata_id: 1008,
        active: false,
      },
      {
        name: "Mon",
        masterdata_id: 1001,
        active: false,
      },
      {
        name: "Tue",
        masterdata_id: 1002,
        active: false,
      },
      {
        name: "Wed",
        masterdata_id: 1003,
        active: false,
      },
      {
        name: "Thu",

        masterdata_id: 1004,
        active: false,
      },
      {
        name: "Fri",

        masterdata_id: 1005,
        active: false,
      },
      {
        name: "Sat",

        masterdata_id: 1006,
        active: false,
      },
      {
        name: "Sun",

        masterdata_id: 1007,
        active: false,
      },
    ];
  }
  setIntialState() {
    this.dayMasterData.map(function (medical: any) {
      if (medical.masterdata_id == 1008) {
        medical.active = true;
      } else {
        medical.active = false;
      }
      return medical;
    });
  }
  setNoIssuesFalse(data: any) {
    let obj = this;
    this.dayMasterData.map(function (medical: any) {
      if (medical.masterdata_id == 1008) {
        medical.active = false;
        const indexValue = obj.medicalInfoSelected.indexOf(medical.name, 0);
        if (indexValue > -1) {
          obj.medicalInfoSelected.splice(indexValue, 1);
        }
      } else if (data.masterdata_id == medical.masterdata_id) {
        medical.active = true;
      }
      return medical;
    });
  }


  
  setStatus(data: any) {
    let name = data.name;
    this.changesFound = true;
    if (
      (this.medicalInfoSelected && this.medicalInfoSelected.length === 0) ||
      this.medicalInfoSelected.includes(name) === false
    ) {
      if (data.masterdata_id == 1008) {
        this.setIntialState();
        this.medicalInfoSelected = [];
        this.medicalInfoSelected.push(name);
        
        // console.log(this.medicalInfoSelected);
      } else {
        // this.setNoIssuesFalse(data);
        let medicalData = this.dayMasterData.find(o => o.masterdata_id === 1008);

        if(medicalData && medicalData.name) {
          const indexValue = this.medicalInfoSelected.indexOf(medicalData.name, 0);
          if (indexValue > -1) {
            this.medicalInfoSelected.splice(indexValue, 1);
          }
        }
        this.medicalInfoSelected.push(name);
        // console.log(this.medicalInfoSelected);
      }
    } else {
      const indexValue = this.medicalInfoSelected.indexOf(name, 0);
      if (indexValue > -1) {
        this.medicalInfoSelected.splice(indexValue, 1);
        // console.log(this.medicalInfoSelected);
        // data.active = false;
      }
    }
    this.cd.detectChanges();
    // this.medicalInfoSelected=this.medicalInfoSelected.push(this.newShcheduleList);

    // this.accountForm.controls.diseases.setValue(this.medicalInfoSelected);
  }

  saveFees() {
    this.isLoadingSpinner=true;

    if (!(this.feeForm.get("isEnabledVideoConsultation").value || this.feeForm.get("isEnabledClientConsultaion").value)) {
      this.errorFound = true;
      return;
    } else  if(this.feeForm.get("isEnabledVideoConsultation").value && !this.feeForm.get("videoconsultationfee").value){
      this.errorFound = false;
      this.feeMandatory  = true;
      return;
    } else if (this.feeForm.get("isEnabledClientConsultaion").value && !this.feeForm.get("clientconsultationfee").value) {
      this.errorFound = false;
      this.feeMandatory  = true;
      return;
    }
     
       
    // this.feeForm.markAsPristine();
    const body = {
      doctorid: this.userInfo.user_id,
      isvideoconsultationfee: this.feeForm.get("isEnabledVideoConsultation").value,
      isclientconsultationfee : this.feeForm.get("isEnabledClientConsultaion").value,
      videoconsultationfee: this.feeForm.get("isEnabledVideoConsultation").value ? this.feeForm.get("videoconsultationfee").value.toString() : undefined,
      clientconsultationfee: this.feeForm.get("isEnabledClientConsultaion").value ? this.feeForm.get("clientconsultationfee").value.toString() : undefined,
      isaudioconsultationfee: false,
      isslotsdisplay:this.feeForm.get("isslotsdisplay").value
    };

    this.httpService
    .create(`api/User/UpdateDoctorFee`, body)
    .subscribe(
      (res: any) => {
        this.isLoadingSpinner=false;

        if(res.data) {
          this.snackBar.open("Fee saved successfully.", "close", {
            panelClass: "snackBarSuccess",
            duration: 2000,
          });
        }
        this.errorFound = false;
        this.feeMandatory  = false;
        this.saveDisable = true;
        this.disableAll();
        this.cd.detectChanges();
      },
      (error: any) => {
        console.warn("error", error);
      }
    );

  }
  saveDoctorSchedule() { 
    this.isLoadingSpin=true;
    this.endTimeError= false;
    let selectedDays:string[] = [];

    if (this.medicalInfoSelected.includes('All Days') || this.medicalInfoSelected.includes('All')) {

      selectedDays.push('Mon','Tue','Wed','Thu','Fri','Sat','Sun');

    } else {

      selectedDays = this.medicalInfoSelected;

    } 
    
    if(!this.checkTime()) {
      this.endTimeError = true;
      return;
    }
    this.accountForm.markAsPristine();
    const body = {
      scheduleid: this.scheduleId ? this.scheduleId : 0,
      doctorid: this.userInfo.user_id,
      patient_perhour: 0,
      fromtime: this.accountForm.get("fromtime").value,
      totime: this.accountForm.get("totime").value,
      createdby: this.userInfo.user_id,
      weeklist: selectedDays,
      consultationduration: this.accountForm.get("slotDuration").value
    };
    this.httpService
      .create("api/Doctor/CreateUpdateDoctorSchedule", body)
      .subscribe(
        (res: any) => { 
          this.isLoadingSpin=false;
          console.warn(res);
          if(res.data) {
            if(this.scheduleId){
              this.snackBar.open("Schedules timings updated successfully.", "close", {
                panelClass: "snackBarSuccess",
                duration: 2000,
              });
  
            }else{
              this.snackBar.open("Schedules timings saved successfully.", "close", {
                panelClass: "snackBarSuccess",
                duration: 2000,
              });
            }
            const body = {
              doctorid: this.userInfo.user_id,
              isvideoconsultationfee: true,
              isclientconsultationfee :true,
              videoconsultationfee: "0",
              clientconsultationfee: "0",
              isaudioconsultationfee: true,
              isslotsdisplay:true
            };
        
            this.httpService.create(`api/User/UpdateDoctorFee`, body).subscribe((res: any) => {},
              (error: any) => {
                console.warn("error", error);
              }
            );
            this.clear();
            this.getDoctorSchedule(this.userInfo.user_id);
          }else {
            this.snackBar.open("Slot is already available, please check the input", "close", {
              panelClass: "snackBarWarning",
              duration: 2000,
            });
          }
         
          
         
        },
        (error: any) => {
          console.warn("error", error);
        }
      );
  }
  getDoctorSchedule(userId: number) {
    this.loading = true;
    this.httpService
      .get("api/Doctor/GetDoctorScheduleTimming?doctorid=", userId)
      .subscribe(
        (res: any) => {
          this.accountInfo = res.data;

          this.scheduledList = res.data ? res.data : [];

          this.cd.detectChanges();

          //  this.dataSource = new MatTableDataSource<scheduledList>(res.data);
        },
        (error: any) => {
          console.warn("error", error);
        }
      );
  }

  deleteRecord(id: number) {
    const confirmation = this._fuseConfirmationService.open({
      title: "Delete Schedule Timing",
      message:
        "Are you sure you want to delete this? This action cannot be undone!",
      actions: {
        confirm: {
          label: "Delete",
        },
      },
    });
    confirmation.afterClosed().subscribe((result) => {
      if (result === "confirmed") {
        const url = `api/Doctor/DeleteDoctorSchedule?id=` + id;
        this.httpService.getAll(url).subscribe(
          (res: any) => {
            if (res?.isSuccess) {
              this.getDoctorSchedule(this.userInfo.user_id);
              // this.getMedicalHistory();
              this.snackBar.open(
                "Schedule Timing deleted successfully. ",
                "close",
                {
                  panelClass: "snackBarSuccess",
                  duration: 2000,
                }
              );
            }
          },
          (error: any) => {
            console.log("error", error);
          }
        );
      }
    });
  }

  editDoctorSchedule(data) {
    this.accountForm.patchValue({
      slotDuration: data.consultation_duration,
      fromtime: data.from_time,
      totime: data.to_time
    });
    this.getStatus(data);
  }
  checkAll() {

  }
  getStatus(data: any) {
    console.log(data.weeklist);
    this.medicalInfoSelected = [];

    this.scheduleId = data.schedule_id;
    this.newShcheduleList = data.weeklist;
    
    if(data.weeklist.length == 7) {
      this.medicalInfoSelected.push('All Days');
    }else {
      this.medicalInfoSelected = data.weeklist.map(element => {
        return element.trim();
      });
      
    }
    this.changesFound = false;
  }
  clear(){
    
    this.accountForm.reset();
    this.scheduleId  = undefined;
    this.medicalInfoSelected = [];
    this.newShcheduleList = [];
    this.changesFound = false;
  }

  /**
   * Lets the user click on the icon in the input.
   */
   openFromIcon(timepicker: { open: () => void }) {
      timepicker.open();
  }

  keyPressNumbers(event) {
    var charCode = (event.which) ? event.which : event.keyCode;
    // Only Numbers 0-9
    if ((charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }


  enablEdit() {
    this.feeForm.get('isEnabledVideoConsultation').enable();
    this.feeForm.get('isEnabledClientConsultaion').enable();
    this.feeForm.get('isslotsdisplay').enable();
    this.saveDisable = false;
    if (this.feeForm.get('isEnabledVideoConsultation').value) {
      this.feeForm.get('videoconsultationfee').enable();
    }
    if (this.feeForm.get('isEnabledClientConsultaion').value) {
      this.feeForm.get('clientconsultationfee').enable();
    }
  }
  disableAll() {
    this.feeForm.get('isEnabledVideoConsultation').disable();
    this.feeForm.get('isEnabledClientConsultaion').disable();
    this.feeForm.get('videoconsultationfee').disable();
    this.feeForm.get('clientconsultationfee').disable();
    this.feeForm.get('isslotsdisplay').disable();
  }
  changeStatus() {
    // console.log(data);
   
  }
  
}

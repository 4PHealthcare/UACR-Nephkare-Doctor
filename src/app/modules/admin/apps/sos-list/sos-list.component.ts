import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import { MatDialog } from "@angular/material/dialog";
import { MatDrawer } from "@angular/material/sidenav";
import { FullCalendarComponent } from "@fullcalendar/angular";
import { Calendar as FullCalendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import momentPlugin from "@fullcalendar/moment";
import rrulePlugin from "@fullcalendar/rrule";
import timeGridPlugin from "@fullcalendar/timegrid";
import { MatTabChangeEvent } from "@angular/material/tabs";

import { clone, cloneDeep, isEqual, omit } from "lodash-es";
import * as moment from "moment";
import { RRule } from "rrule";
import { Subject, BehaviorSubject } from "rxjs";
import { takeUntil, debounceTime, map } from "rxjs/operators";
import { fuseAnimations } from "@fuse/animations";
import { FuseMediaWatcherService } from "@fuse/services/media-watcher";
import { CalendarRecurrenceComponent } from "app/modules/admin/apps/calendar/recurrence/recurrence.component";
import { CalendarService } from "app/modules/admin/apps/calendar/calendar.service";
import {
  Calendar,
  CalendarDrawerMode,
  CalendarEvent,
  CalendarEventEditMode,
  CalendarEventPanelMode,
  CalendarSettings,
} from "app/modules/admin/apps/calendar/calendar.types";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from "@angular/material-moment-adapter";

import { AuthService } from "app/core/auth/auth.service";
import { APIService } from "app/core/api/api";
import * as XLSX from "xlsx";
import { AppointmentFormModalComponent } from "../appointment-form-modal/appointment-form-modal.component";
import { FuseConfirmationService } from "@fuse/services/confirmation";
import { MatSnackBar } from "@angular/material/snack-bar";
import { BillingComponent } from "../queue/billing/billing.component";


import { Router } from "@angular/router";
import { ReasonForCancelComponent } from "../calendar/reason-for-cancel/reason-for-cancel.component";
export const MY_FORMATS = {
  parse: {
    dateInput: "LL",
  },
  display: {
    dateInput: "DD-MMM-YYYY",
    monthYearLabel: "YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "YYYY",
  },
};

@Component({
  selector: 'app-sos-list',
  templateUrl: './sos-list.component.html',
  styleUrls: ['./sos-list.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class SosListComponent implements OnInit, AfterViewInit {

  @ViewChild("eventPanel") private _eventPanel: TemplateRef<any>;
  @ViewChild("fullCalendar", { static: false })
  private _fullCalendar: FullCalendarComponent;
  @ViewChild("drawer") private _drawer: MatDrawer;
  @ViewChild(MatPaginator) private _paginator: MatPaginator;
  @ViewChild(MatSort) private _sort: MatSort;
  // Patien List Variablea
  userInfo: any;
  public myMath = Math;
  patients$ = new BehaviorSubject<any>([]);
  pageSize = 10;
  currentPage = 0;
  filterVal = "";
  filterSubject = new Subject();
  totalRecords$ = new BehaviorSubject<any>(null);
  fromDate: Date;
  dateForm: FormGroup;
  sortDirection = "";
  sortBy = "";
  selectedDoctor='all';
  fileName = "Appointments List.xlsx";
  uploadData: any = [];
  appointmentType = 0;
  statusType = 0;
  calAppoinments: any[] = [];
  //End  Patien List Variablea

  calendars: Calendar[];
  calendarPlugins: any[] = [
    dayGridPlugin,
    interactionPlugin,
    listPlugin,
    momentPlugin,
    rrulePlugin,
    timeGridPlugin,
  ];
  drawerMode: CalendarDrawerMode = "side";
  drawerOpened: boolean = true;
  event: CalendarEvent;
  eventEditMode: CalendarEventEditMode = "single";
  eventForm: FormGroup;
  eventTimeFormat: any;
  events: CalendarEvent[] = [];
  selectedStatus:number = 0;

  tabs: any[] = [];
  panelMode: CalendarEventPanelMode = "view";
  settings: CalendarSettings;
  view: "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listYear" =
    "timeGridWeek";
  views: any;
  viewTitle: string;
  private _eventPanelOverlayRef: OverlayRef;
  private _fullCalendarApi: FullCalendar;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  appTypes: any;
  statusTypes: any = [ 
    {
      data_name:'Pending',
      masterdata_id: 8
    },
    {
      data_name:'Running',
      masterdata_id: 9
    },
    {
      data_name:'Completed',
      masterdata_id: 10
    },
    {
      data_name:'Cancelled',
      masterdata_id: 13
    }

];
visits:any = [ {
  data_name:'Hospital Visit',
  masterdata_id:72
},
{
  data_name:'Video Consultaion',
  masterdata_id:73
}];

  bookingConfirmationTypes: any[] = [];
  appointmentData: any;
  doctors: any = [];
  doctorId: any = 0;
  patientName:string = "";

  constructor(
    private _matDialog: MatDialog,
    private auth: AuthService,
    private httpService: APIService,
    private fb: FormBuilder,
    private _fuseConfirmationService: FuseConfirmationService,
    private snackBar: MatSnackBar,
    private _router: Router
  ) {
    this.userInfo = JSON.parse(this.auth.user);
    //  this.renderCalendar();
  }

  gotoProfilePage(data:any) {

    let category = 0;
    let isSecondOpinion = data?.patient_service_type == 7 || data.subscription_typeid == 7 ? true : false
    data.opinion_id = data.opinion_id ? data.opinion_id: 0;
    
    if(data.opinion_id && data.appointment_category == 'Follow Up') {
      category = -1;
    } else if(data.opinion_id) {
      category = 2;
    }

    if(this.userInfo.admin_account == 3) {
      this._router.navigateByUrl(`/pages/profile?id=${data.patient_id}&opinion_id=${data.opinion_id}&secondopionion=${isSecondOpinion}&appointment=${data.calender_id}`);

    } else {
      this._router.navigateByUrl(`/pages/profile?id=${data.patient_id}&appointment=${data.calender_id}`);
    }

    
    
  }

  ngOnInit(): void {
  
    this.statusType = this.selectedStatus;
    
    if(history.state.patientName) {
      this.filterVal = history.state.patientName.trim();
      this.patientName = history.state.patientName.trim();
    }
    
    this.initForm();
    
    this.filterSubject.pipe(debounceTime(500),map((val) => {this.getPatientsInfo();})).subscribe();


    this.dateForm.valueChanges.subscribe((data: any) => {
      this.getPatientsInfo();
    });
  }


  /**
   * After view init
   */
  ngAfterViewInit(): void {

    if (this.userInfo.role_id) {
      const url = `api/User/GetCoordinatorTeam?userid=${this.userInfo.user_id}`; 

      this.httpService.getAll(url).subscribe((res: any) => {
        this.doctors = res.data ? res.data : [];
        if(history.state && history.state.patientName && history.state.doctor_id) {
          let doctor = this.doctors.find(item => item.doctorid == history.state.doctor_id);

          if (doctor) {
            this.doctorId = doctor.doctorid;
            this.selectedDoctor = doctor.doctorid;
          } else {
            this.doctorId = this.doctors ? this.doctors[0]?.doctorid : 0;
            this.selectedDoctor = this.doctors ? this.doctors[0].doctorid : undefined;
          }

        } else if (!history.state.patientName && sessionStorage.getItem('sessionDoctorId') ) {
          const filteredDoctor = this.doctors.find(item => item.doctorid == sessionStorage.getItem('sessionDoctorId'));
          if (filteredDoctor) {
            this.doctorId = filteredDoctor.doctorid;
            this.selectedDoctor = filteredDoctor.doctorid;
          }else {
            
            if(this.userInfo.role_id==481) {
              this.doctorId = this.doctors ? this.doctors[0].doctorid : 0;
              this.selectedDoctor = this.doctors ? this.doctors[0].doctorid : undefined;
            } else {
              this.doctorId = this.userInfo.user_id;
              this.selectedDoctor = this.userInfo.user_id;
            }

          }
        }
        else if(this.userInfo.role_id == 5 && this.userInfo.isadmin_account ) {
              
          if( !(history.state  && history.state.appointmentDate)) {
            this.selectedDoctor = this.userInfo.user_id;
          }
          this.doctorId = this.userInfo.user_id; 
        } 
        else if(this.userInfo.role_id==481)  {
          this.doctorId = this.doctors ? this.doctors[0].doctorid : 0;
          this.selectedDoctor = this.doctors ? this.doctors[0].doctorid : undefined;
        } else {
          this.doctorId = this.userInfo.user_id;
        }

        if (history.state && history.state.navType) {
          
          this.statusType = history.state.navType;
          this.selectedStatus = history.state.navType;
          this.getPatientsInfo(true);
          
        } else {
          this.getPatientsInfo(true);
  
        }    
      });
    }
   
  }
 
  initForm() {
    
    let endDate = new Date(new Date().getTime()+(6*24*60*60*1000));

    if(history.state && history.state.appointmentDate) {
      endDate = new Date(new Date(history.state.appointmentDate).getTime()+(6*24*60*60*1000));
    }

    this.dateForm = this.fb.group({
      fromDate: [history.state && history.state.appointmentDate ? new Date(history.state.appointmentDate) : new Date()],
      toDate: [endDate]
    });
    if (this.userInfo.role_id == 5) {
      if (history.state && history.state.navType) {
       
        this.statusType = history.state.navType;
        this.selectedStatus = history.state.navType;
        this.getPatientsInfo();    
      } else {
                this.getPatientsInfo();
      }
    } 

  }


  getDoctorsList() {
    const url = `api/User/GetCoordinatorTeam?userid=${this.userInfo.user_id}`;

    this.httpService.getAll(url).subscribe((res: any) => {
      // this.doctors = res.data.userdata ? res.data.userdata : [];

      this.doctors = res.data ? res.data : [];
      this.doctorId = this.doctors[0].doctorid;
      this.selectedDoctor = 'all';

    //  this.doctorId = this.userInfo.user_id;

      if (history.state && history.state.navType) {
     
        this.statusType = history.state.navType;
        this.selectedStatus = history.state.navType;
        this.getPatientsInfo();
        
      } else {
        this.getPatientsInfo();

      }

      if (this.userInfo.role_id != 5) {
      

      }
        
    });
  }
  getPatientsInfo(initCall?:boolean) {
    console.log(this.doctorId)
    console.log(history.state.doctor_id);
    const currentDate=moment().format('YYYY-MM-DD');
    const afterWeekDate=(moment().add(6, 'days')).format('YYYY-MM-DD');
   
    let allDoctors = false;
    if( !(this.userInfo.role_id  == 5 && this.userInfo.isadmin_account) ) {
    // for dashboard to click nextvisit date all doctors should display
      allDoctors = initCall && history.state  && history.state.appointmentDate ? true :false;

      if (this.userInfo.role_id  != 5 && allDoctors) {
        // this.selectedDoctor = 'all';
      }
      
    }

    const url = `api/Doctor/GetPatientsNextVisitAppointmentDate`;
    const body = {
      // appointmenttypeid: this.appointmentType,
      // statusid: this.statusType,
      pagesize: this.pageSize,
      pageno: this.currentPage + 1,
      searchkey: this.filterVal,
      isdoctorlogged: allDoctors ? false :  this.userInfo.role_id == 6 ? false: this.userInfo.role_id == 4 ? false: this.userInfo.role_id == 5? true : this.doctorId == this.userInfo.user_id ? false: true,
      fromdate: this.dateForm.get("fromDate").value ? moment(this.dateForm.get("fromDate").value).format("YYYY-MM-DD") : currentDate,
      todate: this.dateForm.get("toDate").value ? moment(this.dateForm.get("toDate").value).format("YYYY-MM-DD"): afterWeekDate,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
      allrecords: false,
      // isqueued: false,
      doctorid: this.userInfo.role_id == 5 && !this.userInfo.isadmin_account ? this.userInfo.user_id : this.userInfo.role_id == 6 ? this.userInfo.admin_account: this.userInfo.role_id == 4 ? this.userInfo.admin_account: initCall && history.state.doctor_id? history.state.doctor_id : this.doctorId,
    };
    this.httpService.create(url, body).subscribe((res: any) => {
      this.patients$.next(res.data.app);
      this.totalRecords$.next(res.data.totalrecords);
    });
  }

  onPageChange(index: any) {
    this.currentPage = index.pageIndex;
    this.pageSize = index.pageSize;
    this.getPatientsInfo();
  }

  filterData(val: any) {
    this.filterVal = val;
    this.currentPage = 0;
    this.filterSubject.next(val);
    this.getPatientsInfo();
  }

  sortData(event: any) {
    this.sortBy = event.active;
    this.sortDirection = event.direction;
    this.getPatientsInfo();
  }
  onQueueVisitChange(event?:any, data?:any) {

    if (event.value == 486) {
      this.noShowConfirmation(event, data)
    }else{
      this.updateStatus(event, data);
    }



  }

  noShowConfirmation(event, data: any): void {
    const confirmation = this._fuseConfirmationService.open({
      title: 'Appointment Cancelled',
      message: 'Are you sure you want to cancel? This action cannot be undone!',
      actions: {
        confirm: {
          label: 'Ok',
        },
      },
    });

    confirmation.afterClosed().subscribe((result) => {
      console.log(result);
      if (result === 'confirmed') {
        const url = `api/Doctor/UpdateAppointmentStatus?appointmentid=${
          data.calender_id
        }&statusid=${13}&actionby=${data.doctor_id}&patientid=${data.patient_id}`;

         this.httpService.create(url, {}).subscribe(
          (res: any) => {

            this.snackBar.open('Appointment canceled successfully', 'close', {
              panelClass: 'snackBarSuccess',
              duration: 2000,
            });

            this.updateStatus(event, data);

          },
          (error: any) => {
            this.snackBar.open(error, 'close', {
              panelClass: 'snackBarFailure',
              duration: 2000,
            });
          }
        );
      } else {
        this.getPatientsInfo();
      }
    });
  }

  updateStatus(event, data) {
    const url = `api/Doctor/GetAppointmentVisitstatus?appointmentid=${data?.calender_id}&visitstatusid=${event.value}`;

      this.httpService.create(url, {}).subscribe(
        (res: any) => {
  
          if(!res.data) {
            this.snackBar.open("Try again", "close", {
              panelClass: "snackBarWarning",
              duration: 2000,
            });
          }
          this.getPatientsInfo();
         },
        (error: any) => {
          console.log("error", error);
        }
      );
  }

  getStatusMasterDataInfo() {
    const url = `api/User/GetMasterData?mastercategoryid=4`;

    this.httpService.getAll(url).subscribe(
      (res: any) => {
        //this.statusTypes = res.data;
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }
  
  cancelAppointment(data) {
    const confirmation = this._fuseConfirmationService.open({
      title: "Cancel Appointment",
      message:
        "Are you sure you want to cancel this appointment? This action cannot be undone!",
      actions: {
        confirm: {
          label: "Cancel",
        },
        cancel: {
          label: "Close",
        },
      },
    });
    confirmation.afterClosed().subscribe((result) => {
      if (result === "confirmed") {
          // this.openDialog();
        const url = `api/Doctor/UpdateAppointmentStatus?appointmentid=${data.calender_id}&statusid=${13}&actionby=${this.userInfo.user_id}&patientid=${data.patient_id}`;
        this.httpService.create(url, null).subscribe((res: any) => {
            if (res?.isSuccess) {
              this.getPatientsInfo();
              this.snackBar.open("Appointment canceled successfully. ","close",
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

 

 
  // openDialog(): void {

  // }
  onSelectionChange(key) {
    this.appointmentType = key.value;
    this.getPatientsInfo();
  }
  onStatusChange(key) {
    this.currentPage = 0;
    this.statusType = key.value;
    this.getPatientsInfo();
  }

  onDoctorChange(key) {
    this.currentPage = 0;
    if(key.value == 'all'){
      this.doctorId = this.userInfo.user_id;
    }else{
      this.doctorId = key.value ;
    }
    
    if(key.value && key.value != 'all') {
      sessionStorage.setItem('sessionDoctorId', key.value)
    } else {
      sessionStorage.removeItem('sessionDoctorId');
    }
    this.getPatientsInfo();
  }

 

  onBookingChange(event, data) {
    if (event.value == 981) {
      const url = `api/Doctor/UpdateAppointmentStatus?appointmentid=${
        data.calender_id
      }&statusid=${8}&actionby=${data.doctor_id}`;
      this.httpService.create(url, null).subscribe(
        (res: any) => {
          if (res?.isSuccess) {
            this.getPatientsInfo();
            this.snackBar.open(
              "Appointment Confirmed successfully. ",
              "close",
              {
                panelClass: "snackBarSuccess",
                duration: 2000,
              }
            );
            this.getPatientsInfo();
          }
        },
        (error: any) => {
          console.log("error", error);
        }
      );
    } else if (event.value == 982) {
    
    }
  }

  isApproved: boolean = false;

  confirmAppointment(data) {
    const url = `api/Doctor/UpdateAppointmentStatus?appointmentid=${
      data.calender_id
    }&statusid=${8}&actionby=${data.doctor_id}&patientid=${data.patient_id}`;
    this.httpService.create(url, null).subscribe(
      (res: any) => {
        if (res?.isSuccess) {
          this.isApproved = true;
          this.getPatientsInfo();
          this.snackBar.open("Appointment Confirmed successfully. ", "close", {
            panelClass: "snackBarSuccess",
            duration: 2000,
          });
          this.getPatientsInfo();
        } else {
          this.isApproved = false;
        }
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }



  gotoProfile(data) {
    console.log("started");
    const url = `api/Doctor/UpdateAppointmentStatus?appointmentid=${
      data.calender_id
    }&statusid=${9}&actionby=${data.doctor_id}&patientid=${data.patient_id}`;
    this.httpService.create(url, null).subscribe(
      (res: any) => {
        if (res?.isSuccess) {
          // this.isApproved=true;
          this.getPatientsInfo();
          // this.snackBar.open(
          //   "Appointment Confirmed successfully. ",
          //   "close",
          //   {
          //     panelClass: "snackBarSuccess",
          //     duration: 2000,
          //   }
          // );
          // this.getPatientsInfo();
        } else {
          // this.isApproved=false;
        }
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }
  //   this._router.navigate([], { queryParams: {layout: null}}).then(() => {
  // });

  setDisplayPrescription() {
    localStorage.setItem("displayPrescription", "appointments");
  }

  appointmentEdit(data: any, page?:any) {
    this.bookAppointment(data,page);
  }
  bookAppointment(appointmentdata?: any, page?:any) {
    this._matDialog
      .open(AppointmentFormModalComponent, {
        width: "50rem",
        height: "100%",
        panelClass: "no-padding-popup",
        position: { right: "0" },
        data: {
          appointmentdata: appointmentdata, page:page, patient: appointmentdata
         
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.getPatientsInfo();
        }
      });
  }
  addSpace(data: any) {
    const formatText = data.match(/.{1,5}/g);
    return formatText.join(" ");
  }

  

  getAllRecords() {
    const url = `api/Doctor/GetPatientAppointments`;
    const body = {
      allrecords: false,
      pageSize: 1,
      pageNo: 100,
      searchkey: "",
      isdoctorlogged:
        this.userInfo.role_id == 5
          ? true
          : this.doctorId == this.userInfo.user_id
          ? false
          : true,

      // fromdate: null,
      // todate: null,
      fromdate: this.dateForm.get("fromDate").value
        ? moment(this.dateForm.get("fromDate").value).format("YYYY-MM-DD")
        : null,
      todate: this.dateForm.get("toDate").value
        ? moment(this.dateForm.get("toDate").value).format("YYYY-MM-DD")
        : null,
      sortBy: "",
      sortDirection: "",
      isqueued: false,
      appointmenttypeid: 0,
      doctorid:
        this.userInfo.role_id == 5 ? this.userInfo.user_id : this.doctorId,
    };
    this.httpService.create(url, body).subscribe((res: any) => {
      const usersData = res.data?.patientAppointments;
      if (usersData?.length > 0) {
        let patientId = "Queue Number";
        let personalInfo = "Patient Info";
        let phoneNumber = "Phone Number";
        // let riskCondition = "Risk/Condition";
        let appointmentDate = "Appointment Date & Time";
        // let appointmentType = "Appointment Type";
        let appointmentStatus = "Status";
        const headers = [
          patientId,
          personalInfo,
          phoneNumber,
          // riskCondition,
          appointmentDate,
          // appointmentType,
          appointmentStatus,
        ];
        this.uploadData.push(headers);
        let i = 0;
        usersData.map((data: any) => {
          patientId = "HK00000" + (i + 1);
          personalInfo =
            data.first_name +
            " " +
            data.last_name +
            "," +
            data.age +
            "yrs," +
            data.gender;
          phoneNumber = data.mobile_no;
          // riskCondition = "--";
          appointmentDate = data.appointment_date;
          // appointmentType = data.appointment_type;
          // this.statusType=data.status_id;

          appointmentStatus = data.status;
          const importData = [
            patientId,
            personalInfo,
            phoneNumber,
            // riskCondition,
            appointmentDate,
            // appointmentType,
            appointmentStatus,
          ];
          this.uploadData.push(importData);
        });
        const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.uploadData);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, this.fileName);
        this.uploadData = [];
      }
    });
    
  }

}

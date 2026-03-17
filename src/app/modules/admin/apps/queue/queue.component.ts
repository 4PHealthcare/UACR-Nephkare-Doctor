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
import { FormBuilder, FormGroup } from "@angular/forms";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { MatDialog } from "@angular/material/dialog";
import * as moment from "moment";
import { Subject, BehaviorSubject } from "rxjs";
import { debounceTime, map } from "rxjs/operators";
import { fuseAnimations } from "@fuse/animations";


import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';

import { AuthService } from "app/core/auth/auth.service";
import { APIService } from "app/core/api/api";
import * as XLSX from "xlsx";
import { AppointmentFormModalComponent } from "../appointment-form-modal/appointment-form-modal.component";
import { FuseConfirmationService } from "@fuse/services/confirmation";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AddVitalModalComponent } from "../../pages/profile/add-vital-modal/add-vital-modal.component";
import { BillingComponent } from "./billing/billing.component";

import { ReasonForCancelComponent } from "../calendar/reason-for-cancel/reason-for-cancel.component";
import { Router } from "@angular/router";
import { environment } from "environments/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";

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
  selector: "queue",
  templateUrl: "./queue.component.html",
  styleUrls: ["./queue.component.scss"],
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class QueueComponent implements OnInit, AfterViewInit, OnDestroy {

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
  fileName = "Appointments List.xlsx";
  uploadData: any = [];
  appointmentType = 0;
  statusType = 0;
  doctorId:any = 0;

  visits:any = [ {
    data_name:'Hospital Visit',
    masterdata_id:72
  },
  {
    data_name:'Video Consultaion',
    masterdata_id:73
  }
]
  
  viewTitle: string;
  selectedDoctor:any = 0;
  private _eventPanelOverlayRef: OverlayRef;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  appTypes: any;
 
  statusTypes: any = [ 
    {
      data_name:'Checked in',
      masterdata_id: 8
    },
    {
      data_name:'Running',
      masterdata_id: 9
    },
    {
      data_name:'Completed',
      masterdata_id: 10
    }
    // {
    //   data_name:'Cancelled',
    //   masterdata_id: 13
    // }

];
  selectedStatus:number = 0;

  bookingConfirmationTypes: any[] = [];
  appointmentData: any;
  doctors:any = [];
  constructor(
    private _matDialog: MatDialog,
     private auth: AuthService,
    private httpService: APIService,
    private fb: FormBuilder,
    private _fuseConfirmationService: FuseConfirmationService,
    private snackBar: MatSnackBar,
    private _router: Router,
    private http: HttpClient,
    private cd: ChangeDetectorRef
  ) {
    this.userInfo = JSON.parse(this.auth.user);
  }

 

  ngOnInit(): void {
   // this.getBookingTypes();
   this.getStatusMasterDataInfo();
   
    this.getMasterDataInfo();
   
   
    this.statusType = this.selectedStatus;
    // patient calls
    this.filterSubject
      .pipe(
        debounceTime(500),
        map((val) => {

          if(this.userInfo.role_id == 5) {
            this.getPatientsInfo();
          } else {
            this.getPatientAllAppointments();
          }
          
          
        })
      )
      .subscribe();
  }

  

  /**
   * After view init
   */
  ngAfterViewInit(): void {
    this.getStatusMasterDataInfo();
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();

    // Dispose the overlay
    if (this._eventPanelOverlayRef) {
      this._eventPanelOverlayRef.dispose();
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------


  initForm() {
    //console.log(moment().subtract(7, 'days'));
    this.dateForm = this.fb.group({
      fromDate: [moment().subtract(7, "days")],
      toDate: [moment()],
    });
    this.getPatientsInfo();
    this.dateForm.valueChanges.subscribe((data: any) => {
      this.getPatientsInfo();
    });
  }

  getDoctorsList() {
   
    const url = `api/User/GetCoordinatorTeam?userid=${this.userInfo.user_id}`;
    
    this.httpService.getAll(url).subscribe((res: any) => {
      this.doctors = res.data ? res.data : [];
      

     if (sessionStorage.getItem('sessionDoctorId') ) {

        const filteredDoctor = this.doctors.find(item => item.doctorid == sessionStorage.getItem('sessionDoctorId'));
       
        if (filteredDoctor) {
          this.doctorId = filteredDoctor.doctorid;
          this.selectedDoctor = filteredDoctor.doctorid;
          // this.selectedDoctor = filteredDoctor.doctorid;
          // this.getPatientsInfo();
        }else {

          if(this.userInfo.role_id==481) {
            this.doctorId = this.doctors ? this.doctors[0].doctorid : 0;
            this.selectedDoctor = this.doctors ? this.doctors[0].doctorid : undefined;
          } else {
            this.doctorId = this.userInfo.user_id;
            this.selectedDoctor = this.userInfo.user_id;
          }
        }
      } else {
        if(this.userInfo.role_id == 5 && this.userInfo.isadmin_account ) {
          this.selectedDoctor = this.userInfo.user_id;
          this.doctorId = this.userInfo.user_id;
        } else if(this.userInfo.role_id==481)  {
          this.doctorId = this.doctors ? this.doctors[0].doctorid : 0;
          this.selectedDoctor = this.doctors ? this.doctors[0].doctorid : undefined;
        } else {
          this.doctorId = this.userInfo.user_id;
        }
       

        // this.selectedDoctor = this.doctors[0].doctorid;
        // this.getPatientsInfo();
      }
      this.getPatientsInfo();
      
    });
  }

  getPatientsInfo() {
    console.log(this.userInfo.role_id);
    const url = `api/Doctor/GetPatientAppointments`; 
    const body = {
      appointmenttypeid: this.appointmentType,
      statusid: this.statusType,
      pagesize: this.pageSize,
      pageno: this.currentPage + 1,
      searchkey: this.filterVal,
      isdoctorlogged: this.userInfo.role_id == 6 ? false: this.userInfo.role_id == 4 ? false: this.userInfo.role_id == 5? true : this.doctorId == this.userInfo.user_id ? false: true,
      fromdt: moment().format("YYYY-MM-DD"),
      todt: moment().format("YYYY-MM-DD"),
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
      allrecords: false,
      isqueued: true,
      doctorid: this.userInfo.role_id == 5 ? this.userInfo.user_id : this.doctorId ? this.doctorId: this.userInfo.user_id,
    };
    this.httpService.create(url, body).subscribe((res: any) => {
      console.log(res.data);
      this.patients$.next(res.data.patientAppointments);
      this.totalRecords$.next(res.data.totalRecords);
      this.cd.detectChanges();
    });
  }

  getPatientAllAppointments() {

    console.log(this.userInfo.user_id)
    const url = `api/Doctor/GetPatientAppointments`;
    const body = {
      appointmenttypeid: this.appointmentType,
      statusid: this.statusType,
      pagesize: this.pageSize,
      pageno: this.currentPage + 1,
      searchkey: this.filterVal,
      isdoctorlogged: this.userInfo.role_id == 5 ? true: this.selectedDoctor == 0 || this.selectedDoctor == this.userInfo.user_id ? false : true,
      fromdt: moment().format("YYYY-MM-DD"),
      todt: moment().format("YYYY-MM-DD"),
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
      allrecords: false,
      isqueued: true,
      doctorid: this.selectedDoctor ? this.selectedDoctor : this.userInfo.user_id,
      iscoordinator: this.selectedDoctor == 0 || this.selectedDoctor == this.userInfo.user_id ? true:false
    };
    this.httpService.create(url, body).subscribe((res: any) => {
      console.log(res.data);
      this.patients$.next(res.data.patientAppointments);
      this.totalRecords$.next(res.data.totalRecords);
    });
  }

  onPageChange(index: any) {
    this.currentPage = index.pageIndex;
    this.pageSize = index.pageSize;
    if(this.userInfo.role_id == 5) {
      this.getPatientsInfo();
    } else {
      this.getPatientAllAppointments();
    }

  }

  filterData(val: any) {
    this.filterVal = val;
    this.currentPage = 0;
    this.filterSubject.next(val);
  }

  sortData(event: any) {
   console.log(event);
    // // doctorid: this.userInfo.role_id == 5 ? this.userInfo.user_id : this.doctorId ? this.doctorId: this.userInfo.user_id,
    // console.log(this.userInfo.role_id)
    // console.log(this.userInfo.user_id)
    this.sortBy = event.active;
    this.sortDirection = event.direction;
    // console.log(this.sortDirection);
    // console.log(this.sortBy)
     console.log(this.sortDirection)

    if(this.userInfo.role_id == 5) {
      this.getPatientsInfo();
    } else {
      this.getPatientAllAppointments();
    }
    // this.getPatientsInfo();
  }

  downloadData() {
    this.getAllRecords();
  }

  getAllRecords() {
    const url = `api/Doctor/GetPatientAppointments`;
    const body = {
      allrecords: false,
      pageSize: 1,
      pageNo: 100,
      searchkey: "",
      // fromdate: null,
      // todate: null,
      fromdate: this.dateForm.get("fromDate").value
        ? moment(this.dateForm.get("fromDate").value).format("YYYY-MM-DD")
        : null,
        todate: this.dateForm.get("toDate").value
        ? moment(this.dateForm.get("toDate").value).format("YYYY-MM-DD")
        : null,
      sortBy: this.sortBy,
      isqueued: true,
      sortDirection: this.sortDirection,
      appointmenttypeid: 0,
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

  

  getMasterDataInfo() {
    const url = `api/User/GetMasterData?mastercategoryid=24`;

    this.httpService.getAll(url).subscribe(
      (res: any) => {
        this.appTypes = res.data;
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
        // this.statusTypes = res.data.filter();

        if(this.userInfo.role_id == 5) {
          this.getPatientsInfo();
        }else {
          this.getDoctorsList();
          // this.getPatientAllAppointments();
        }
        
      },
      (error: any) => {
        console.log("error", error);
      }
    );

    const queueStatus = `api/User/GetMasterData?mastercategoryid=59`;

    this.httpService.getAll(queueStatus).subscribe(
      (res: any) => {
        this.bookingConfirmationTypes = res.data;
      },
      (error: any) => {
        console.log("error", error);
      }
    );

  }
  

  appointmentEdit(data: any) {
    this.bookAppointment(data);
    // const url = `api/Doctor/GetAppointmentById?appointmentid=${data?.calender_id}`;

    // this.httpService.getAll(url).subscribe(
    //   (res: any) => {
    //     this.appointmentData = res.data;
    //     this.bookAppointment(this.appointmentData, data);
    //   },
    //   (error: any) => {
    //     console.log("error", error);
    //   }
    // );
  }

  bookAppointment(appointmentdata: any) {
    this._matDialog
      .open(AppointmentFormModalComponent, {
        width: "50rem",
        height: "100%",
        panelClass:"no-padding-popup",
        position: { right: "0" },
        data: {
          appointmentdata: appointmentdata,
          // patientid: data.patient_id,
          // doctorName: data?.doctor_name,
          // appType: data?.appointment_type,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.getPatientsInfo();
        }
      });
  }

  deleteAppointment(data) {
    const dialogRef = this._matDialog.open(ReasonForCancelComponent, {
      width: "450px",
      data: { patientData: data },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.getPatientsInfo();
      console.log("The dialog was closed");
      //   this.animal = result;
    });
    // const confirmation = this._fuseConfirmationService.open({
    //   title: "Cancel Appointment",
    //   message:
    //     "Are you sure you want to cancel this appointment? This action cannot be undone!",
    //   actions: {
    //     confirm: {
    //       label: "Cancel",
    //     },
    //     cancel: {
    //       label: "Close",
    //     },
    //   },
    // });
    // confirmation.afterClosed().subscribe((result) => {
    //   if (result === "confirmed") {
    //       this.openDialog();
    //     const url = `api/Doctor/UpdateAppointmentStatus?appointmentid=${id}&statusid=${13}&actionby=1`;
    //     this.httpService.create(url, null).subscribe(
    //       (res: any) => {
    //         if (res?.isSuccess) {
    //           this.getPatientsInfo();
    //           this.snackBar.open(
    //             "Appointment canceled successfully. ",
    //             "close",
    //             {
    //               panelClass: "snackBarSuccess",
    //               duration: 2000,
    //             }
    //           );
    //           this.getPatientsInfo();
    //         }
    //       },
    //       (error: any) => {
    //         console.log("error", error);
    //       }
    //     );
    //   }
    // });
  }
  // openDialog(): void {

  // }
  onSelectionChange(key) {
    this.currentPage = 0;
    this.appointmentType = key.value;
    if (this.userInfo.role_id == 5) {
      this.getPatientsInfo();
    }else {
      this.getPatientAllAppointments();
    }
    
  }
  onStatusChange(key) {
    this.currentPage = 0;
    this.statusType = key.value;

    if (this.userInfo.role_id == 5) {
      this.getPatientsInfo();
    } else {
      this.getPatientAllAppointments();
    }

    
  }

  onDoctorChange(key) {
    console.log('###', key);
    this.currentPage = 0;
    this.selectedDoctor = key.value;
    if (key.value === 0) {
      this.getPatientAllAppointments();
      sessionStorage.removeItem('sessionDoctorId');
    }
    else {
      this.doctorId = key.value ? key.value: this.userInfo.user_id;
      if (key.value) {
        sessionStorage.setItem('sessionDoctorId', key.value)
      }
      this.getPatientsInfo();
    }
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
      this.appointmentEdit(data);
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

  gotoProfilePage(data:any) {
    this._router.navigateByUrl(`/pages/profile?id=${data.patient_id}&appointment=${data.calender_id}&hwrId=${data.created_by}`);

  }
  gotoProfileinfo(data:any){
    this._router.navigateByUrl(`/pages/profile?id=${data.patient_id}&appointment=${data.calender_id}&hwrId=${data.created_by}`);
  }
  gotoProfile(data) {
    if(data?.status === 'Start' || data?.status === 'Pending') {
      const url = `api/Doctor/UpdateAppointmentStatus?appointmentid=${data.calender_id}&statusid=${9}&actionby=${data.doctor_id}&patientid=${data.patient_id}`;
      this.httpService.create(url, null).subscribe(
        (res: any) => {
          if (res?.isSuccess) {
            this._router.navigateByUrl(`/pages/profile?id=${data.patient_id}&appointment=${data.calender_id}&hwrId=${data.created_by}`);
          } else {}
        },
        (error: any) => {
          console.log("error", error);
        }
      );
    }else {
      this._router.navigateByUrl(`/pages/profile?id=${data.patient_id}&appointment=${data.calender_id}&hwrId=${data.created_by}`);
    }
    
  }
  

  setDisplayPrescription() {
    localStorage.setItem("displayPrescription", "appointments");
  }

  

  editAppointment(data: any) {
    // Close the event panel
    // this._closeEventPanel();
    this._router.navigateByUrl("/apps/patients");
  }
 
  addSpace(data: any) {
    const formatText = data.match(/.{1,5}/g);
    return formatText.join(' ');
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
  onQueueVisitChange(event?:any, data?:any) {

    if (event.value == 486) {
      this.noShowConfirmation(event, data)
    }else{
      this.updateStatus(event, data);
    }

   

    


  }

  addVitals(data:any) {
    this._matDialog
      .open(AddVitalModalComponent, {
        width: "50rem",
        height: "100%",
        panelClass:"no-padding-popup",
        position: { right: "0" },
        data: { patId: data.patient_id, doctorId:data.doctor_id, appointmentId:data.calender_id},
      })
      .afterClosed()
      .subscribe((dataObj) => {
        if (dataObj) {
           data.have_vitals = true;
           this.cd.detectChanges();
         // this.getPatientVital();
        }
      });
  }

  displayPrescription(data:any) {
    const url = `${environment.apiURL}api/Doctor/DownloadPatientPrescriptions?patientid=${data.patient_id}&appointmentid=${data.calender_id}`;
    const headers = new HttpHeaders().set(
      "Content-Type",
      "text/plain; charset=utf-8"
    );
    this.http
      .post(url, {}, { headers, responseType: "text" })
      .subscribe((data: any) => {
      
        const isSafari = /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent);

        const iframe = document.createElement("iframe");
        document.body.appendChild(iframe); // 👈 still required
        iframe.contentWindow.document.open();
        iframe.style.width = '1px';
        iframe.style.height = '1px';
        iframe.style.opacity = '0.01';
        iframe.contentWindow.document.title=`${data.patient_full_name}-${moment(data.appointment_date).format("DD-MMM-YYYY")}.pdf`;

        iframe.contentWindow.document.write(data);

        var tempTitle = document.title;
        document.title = `${data.patient_full_name}-${moment(data.appointment_date).format("DD-MMM-YYYY")}.pdf`;

        
        try {
          iframe.contentWindow.document.execCommand('print', false, null);
        } catch (e) {
          iframe.contentWindow.print();
        }
    
        iframe.contentWindow.document.close();

        document.title = tempTitle;

                
        // html2canvas(iframe.contentWindow.document.body).then(canvas => {
        //   // Few necessary setting options
           
        //   const contentDataURL = canvas.toDataURL('image/png')
        //   let pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
        //   var width = pdf.internal.pageSize.getWidth();
        //   var height = canvas.height * width / canvas.width;
        //   pdf.addImage(contentDataURL, 'PNG', 0, 0, width, height)
        //   pdf.save(`${this.patient$.value.first_name?.trim()}-${moment(this.prescriptionStatus.appointment_date).format("DD-MMM-YYYY")}.pdf`); // Generated PDF

        //   });



       
      });
  }

  billingModel(data) {
    this._matDialog
      .open(BillingComponent, {
        width: "60rem",
        height: "100%",
        panelClass:"no-padding-popup",
        position: { right: "0" },
        data: data,
      })
      .afterClosed()
      .subscribe((dataObj) => {
        if (dataObj) {
           data.have_vitals = true;
         // this.getPatientVital();
        }
        this.getPatientsInfo();
      });
  }

}

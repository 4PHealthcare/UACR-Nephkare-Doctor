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
  ElementRef,
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
import { AddVitalModalComponent } from "../../pages/profile/add-vital-modal/add-vital-modal.component";
import { ReasonForCancelComponent } from "../calendar/reason-for-cancel/reason-for-cancel.component";
import { Router } from "@angular/router";
import { environment } from "environments/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { TestListModalComponent } from "../test-list-modal/test-list-modal.component";
import { LabBillingComponent } from "../../lab/lab-billing/lab-billing.component";
import { LabTestsComponent } from "../../lab/lab-tests/lab-tests.component";
import { TestListComponent } from './test-list/test-list.modal.component';

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
  selector: "test-queue",
  templateUrl: "./test-queue.component.html",
  styleUrls: ["./test-queue.component.scss"],
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
  styles: [
    `
      .test-list-grid {
        grid-template-columns: 48px auto 40px;

        @screen sm {
          grid-template-columns: 48px auto 112px 72px;
        }

        @screen md {
          grid-template-columns: 160px auto 112px 72px;
        }

        @screen lg {
          grid-template-columns: 7% 15% 13% 10% 12% 12% 12% 5%;
        }
      }
      .front-desk-test-list {
        grid-template-columns: 48px auto 40px;

        @screen sm {
          grid-template-columns: 48px auto 112px 72px;
        }

        @screen md {
          grid-template-columns: 160px auto 112px 72px;
        }

        @screen lg {
          grid-template-columns: 7% 24% 25% 15% 10% 5%;
        }
      }
    `,
  ],

  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class TestQueueComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) private _paginator: MatPaginator;
  @ViewChild(MatSort) private _sort: MatSort;
  // Patien List Variablea
  userInfo: any;
  billId:any;
  @ViewChild('print') printBtn: ElementRef<HTMLElement>;

  currentDate:any;
  docInfo:boolean=true;
  patient:boolean=true;
  subTotalAmount:any
  discountAmount:any;
  servicesAmounts:any=[];
  finalAmount:any
  public myMath = Math;
  patients$ = new BehaviorSubject<any>([]);
  pageSize = 10;
  currentPage = 0;
  TestsList:any=[];
  filterVal = "";
  filterSubject = new Subject();
  totalRecords$ = new BehaviorSubject<any>(null);

  accountInfo = new BehaviorSubject<any>(null);
  fromDate: Date;
  dateForm: FormGroup;
  sortDirection = "";
  sortBy = "";
  fileName = "Appointments List.xlsx";
  uploadData: any = [];
  appointmentType = 0;
  statusType = 0;
  doctorId: any = 0;

  visits: any = [
    {
      data_name: "Hospital Visit",
      masterdata_id: 72,
    },
    {
      data_name: "Video Consultaion",
      masterdata_id: 73,
    },
  ];

  viewTitle: string;
  selectedDoctor: any;
  private _eventPanelOverlayRef: OverlayRef;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  appTypes: any;

  statusTypes: any = [
    {
      data_name: "In-queue",
      masterdata_id: 8,
    },
    {
      data_name: "Running",
      masterdata_id: 9,
    },
    {
      data_name: "Completed",
      masterdata_id: 10,
    },
    // {
    //   data_name:'Cancelled',
    //   masterdata_id: 13
    // }
  ];
  testData: any = [
    {
      data_name: "Lakshmi (33y, F)",
      masterdata_id: 1,
      test_name: "1, 25 Dihydroxy Vitamin D Serum",
      test_name2: "17 Ketosteroids (Urine)",
    },
    {
      data_name: "Sudheer (33y, M)",
      masterdata_id: 2,
      test_name: "1, 25 Dihydroxy Vitamin D Serum",
      test_name2: "17 Ketosteroids (Urine)",
    },
    {
      data_name: "Parvathi (50, F)",
      masterdata_id: 3,
      test_name: "17 Ketosteroids (Urine)",
      test_name2: "1, 25 Dihydroxy Vitamin D Serum",
    },
  ];
  selectedStatus: number = 0;

  bookingConfirmationTypes: any[] = [];
  appointmentData: any;
  doctors: any = [];
  name:any;
id:any;
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
    this.initForm();
    
    

    this.getMasterDataInfo();

    this.statusType = this.selectedStatus;
    // patient calls
    this.filterSubject
      .pipe(
        debounceTime(500),
        map((val) => {
          this.newGetPatientsInfo();
        })
      )
      .subscribe();
  }
  initForm() {
    this.dateForm = this.fb.group({
      fromDate: [moment().subtract(7, "days")],
      toDate: [moment()],
    });
    this.newGetPatientsInfo();
    this.dateForm.valueChanges.subscribe((data: any) => {
      this.newGetPatientsInfo();
    });
  }
  

  newGetPatientsInfo() {
    const url = `api/User/GetPatientServicePaymentsForTests`;
    const body = {
      pageSize: this.pageSize,
      pageNo: this.currentPage + 1,
      searchtext: this.filterVal,
      // fromdate: this.dateForm.get("fromDate").value ? moment(this.dateForm.get("fromDate").value) : moment(), 
      // todate: this.dateForm.get("toDate").value ? moment(this.dateForm.get("toDate").value) : moment(),
      fromdate: this.dateForm.get('fromDate').value ? moment(this.dateForm.get('fromDate').value).format('YYYY-MM-DD') : null,
      todate: this.dateForm.get('toDate').value ? moment(this.dateForm.get('toDate').value).format('YYYY-MM-DD'): null,
      adminid: this.userInfo.admin_account,
    };
    this.httpService.create(url, body).subscribe((res: any) => {
      this.patients$.next(res.data.labdata);
      this.totalRecords$.next(res.data.totalrecords);
      console.log(this.patients$);
    });
  }

  /**
   * After view init
   */
  ngAfterViewInit(): void {}

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

  // onPageChange(index: any) {
  //   this.currentPage = index.pageIndex;
  //   this.pageSize = index.pageSize;
  //   this.newGetPatientsInfo();
  // }

  // filterData(val: any) {
  //   this.filterVal = val;
  //   this.filterSubject.next(val);
  // }

  filterData(val: any) {
    this.filterVal = val;
    this.currentPage=0;
    this.filterSubject.next(val);
  }
  onPageChange(index: any) {
    this.currentPage = index.pageIndex;
    this.pageSize = index.pageSize;
    this.newGetPatientsInfo();
  }
  sortData(event: any) {
    this.sortBy = event.active;
    this.sortDirection = event.direction;
    this.newGetPatientsInfo();
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
      sortBy: "",
      isqueued: true,
      sortDirection: "",
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

  viewTestList(labUniqueId, patientID) { 
    this._matDialog
      .open(TestListModalComponent, {
        width: "75rem",
        panelClass: "no-padding-popup",
        height: "100%",
        data: { labId: labUniqueId, patient: patientID},
        // panelClass:"custom-margin-modal",
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.newGetPatientsInfo();
        }
        this.newGetPatientsInfo();
      });
  }

  appointmentEdit(data: any) {
    this.bookAppointment(data);
    
  }

  editTest(data:any) {
    data['user_id'] = data.patient_id;
    this._matDialog
      .open(LabTestsComponent, {
        width: "50rem",
        height: "100%",
        panelClass: "no-padding-popup",
        position: { right: "0" },
        data: { patient: data, page: "test-queue" },
      })
      .afterClosed()
      .subscribe((dataObj) => {
        console.log(dataObj);
        if (dataObj) {
          //this.billingModel(dataObj);

          // this.getPatientVital();
        }
        this.newGetPatientsInfo();
      });
  }

  deeleteTest(labId:any) {
    const confirmation = this._fuseConfirmationService.open({
      title: "Delete labService",
      message:
        "Are you sure you want to delete this labService? This action cannot be undone!",
      actions: {
        confirm: {
          label: "Delete",
        },
      },
    });
    confirmation.afterClosed().subscribe((result) => {
      if (result === "confirmed") {
        const url = `api/User/Delete_patient_labservice?labuniqueid=` + labId;
        this.httpService.create(url, {}).subscribe(
          (res: any) => {
            if (res?.isSuccess) {
              this.newGetPatientsInfo();
              this.snackBar.open(
                "Family history deleted successfully. ",
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
  

  bookAppointment(appointmentdata: any) {
    this._matDialog
      .open(AppointmentFormModalComponent, {
        width: "50rem",
        height: "100%",
        panelClass: "no-padding-popup",
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
          this.newGetPatientsInfo();
        }
      });
  }

  deleteAppointment(data) {
    const dialogRef = this._matDialog.open(ReasonForCancelComponent, {
      width: "450px",
      data: { patientData: data },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.newGetPatientsInfo();
      console.log("The dialog was closed");
      //   this.animal = result;
    });
    
  }
  // openDialog(): void {

  // }
  onSelectionChange(key) {
    this.currentPage = 0;
    this.appointmentType = key.value;
    this.newGetPatientsInfo();
  }
  onStatusChange(key) {
    this.currentPage = 0;
    this.statusType = key.value;
    this.newGetPatientsInfo();
  }

  onDoctorChange(key) {
    this.currentPage = 0;
    this.doctorId = key.value ? key.value : this.userInfo.user_id;
    if (key.value) {
      sessionStorage.setItem("sessionDoctorId", key.value);
    }
    this.newGetPatientsInfo();
  }

  onBookingChange(event, data) {
    if (event.value == 981) {
      const url = `api/Doctor/UpdateAppointmentStatus?appointmentid=${
        data.calender_id
      }&statusid=${8}&actionby=${data.doctor_id}`;
      this.httpService.create(url, null).subscribe(
        (res: any) => {
          if (res?.isSuccess) {
            this.newGetPatientsInfo();
            this.snackBar.open(
              "Appointment Confirmed successfully. ",
              "close",
              {
                panelClass: "snackBarSuccess",
                duration: 2000,
              }
            );
            this.newGetPatientsInfo();
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
          this.newGetPatientsInfo();
          this.snackBar.open("Appointment Confirmed successfully. ", "close", {
            panelClass: "snackBarSuccess",
            duration: 2000,
          });
          this.newGetPatientsInfo();
        } else {
          this.isApproved = false;
        }
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }

  gotoProfilePage(data: any) {
    this._router.navigateByUrl(
      `/pages/profile?id=${data.patient_id}&appointment=${data.calender_id}`
    );
  }
  gotoProfile(data) {
    if (data?.status === "Start" || data?.status === "Pending") {
      const url = `api/Doctor/UpdateAppointmentStatus?appointmentid=${
        data.calender_id
      }&statusid=${9}&actionby=${data.doctor_id}&patientid=${data.patient_id}`;
      this.httpService.create(url, null).subscribe(
        (res: any) => {
          if (res?.isSuccess) {
            this._router.navigateByUrl(
              `/pages/profile?id=${data.patient_id}&appointment=${data.calender_id}`
            );
            // this.isApproved=true;
            // this.snackBar.open(
            //   "Appointment Confirmed successfully. ",
            //   "close",
            //   {
            //     panelClass: "snackBarSuccess",
            //     duration: 2000,
            //   }
            // );
            // this.newGetPatientsInfo();
          } else {
            // this.isApproved=false;
          }
        },
        (error: any) => {
          console.log("error", error);
        }
      );
    } else {
      this._router.navigateByUrl(
        `/pages/profile?id=${data.patient_id}&appointment=${data.calender_id}`
      );
    }
  }
  //   this._router.navigate([], { queryParams: {layout: null}}).then(() => {
  // });

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
    return formatText.join(" ");
  }

  noShowConfirmation(event, data: any): void {
    const confirmation = this._fuseConfirmationService.open({
      title: "Appointment Cancelled",
      message: "Are you sure you want to cancel? This action cannot be undone!",
      actions: {
        confirm: {
          label: "Ok",
        },
      },
    });

    confirmation.afterClosed().subscribe((result) => {
      console.log(result);
      if (result === "confirmed") {
        const url = `api/Doctor/UpdateAppointmentStatus?appointmentid=${
          data.calender_id
        }&statusid=${13}&actionby=${data.doctor_id}&patientid=${
          data.patient_id
        }`;

        this.httpService.create(url, {}).subscribe(
          (res: any) => {
            this.snackBar.open("Appointment canceled successfully", "close", {
              panelClass: "snackBarSuccess",
              duration: 2000,
            });

            this.updateStatus(event, data);
          },
          (error: any) => {
            this.snackBar.open(error, "close", {
              panelClass: "snackBarFailure",
              duration: 2000,
            });
          }
        );
      } else {
        this.newGetPatientsInfo();
      }
    });
  }

  updateStatus(event, data) {
    const url = `api/Doctor/GetAppointmentVisitstatus?appointmentid=${data?.calender_id}&visitstatusid=${event.value}`;

    this.httpService.create(url, {}).subscribe(
      (res: any) => {
        if (!res.data) {
          this.snackBar.open("Try again", "close", {
            panelClass: "snackBarWarning",
            duration: 2000,
          });
        }
        this.newGetPatientsInfo();
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }
  onQueueVisitChange(event?: any, data?: any) {
    if (event.value == 486) {
      this.noShowConfirmation(event, data);
    } else {
      this.updateStatus(event, data);
    }
  }

  addVitals(data: any) {
    this._matDialog
      .open(AddVitalModalComponent, {
        width: "50rem",
        height: "100%",
        panelClass: "no-padding-popup",
        position: { right: "0" },
        data: {
          patId: data.patient_id,
          doctorId: data.doctor_id,
          appointmentId: data.calender_id,
        },
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

  displayPrescription(data: any) {
    const url = `${environment.apiURL}api/Doctor/DownloadPatientPrescriptions?patientid=${data.patient_id}&appointmentid=${data.calender_id}`;
    const headers = new HttpHeaders().set(
      "Content-Type",
      "text/plain; charset=utf-8"
    );
    this.http
      .post(url, {}, { headers, responseType: "text" })
      .subscribe((data: any) => {
        const isSafari = /^((?!chrome|android).)*safari/i.test(
          window.navigator.userAgent
        );

        const iframe = document.createElement("iframe");
        document.body.appendChild(iframe); // 👈 still required
        iframe.contentWindow.document.open();
        iframe.style.width = "1px";
        iframe.style.height = "1px";
        iframe.style.opacity = "0.01";
        iframe.contentWindow.document.title = `${
          data.patient_full_name
        }-${moment(data.appointment_date).format("DD-MMM-YYYY")}.pdf`;

        iframe.contentWindow.document.write(data);

        var tempTitle = document.title;
        document.title = `${data.patient_full_name}-${moment(
          data.appointment_date
        ).format("DD-MMM-YYYY")}.pdf`;

        try {
          iframe.contentWindow.document.execCommand("print", false, null);
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
      .open(LabBillingComponent, {
        width: "60rem",
        height: "100%",
        panelClass: "bg-billing-popup",
        position: { right: "0" },
        data: { data, role: "Lab" },
      })
      .afterClosed()
      .subscribe((dataObj) => {
        if (dataObj) {
          data.have_vitals = true;
          // this.getPatientVital();
        }
        this.newGetPatientsInfo();
      });
  }
  //readmore variable, its true than read more string will print
  ReadMore: boolean = true;

  //hiding info box
  visible: boolean = false;

  //onclick toggling both
  onclick(item) {
    item.visible = !item.visible;
  }

  generateBill(data) { 
    console.log(data)
    this.name=data.patient_name;
    this.id=data.patient_uniqueid;
    
    // data.lab_uniqueid,data.patient_id
    this.httpService
    .getAll(
      `api/Lab/GetPatienttest_bylabgroup?labuniqueid=${data.lab_uniqueid}&patientid=${data.patient_id}`
    )
    .subscribe(
      (res: any) => {
        if (res.data) {
          this.TestsList = res.data;

          console.log(this.TestsList);
          // for (let i=0;i<this.TestsList.length;i++) {
          //   this.ad
          this.billId = res.data;
          setTimeout(() => {
            let el: HTMLElement = this.printBtn.nativeElement;
            el.click();
            // this.billLoading = false;
          }, 2000);
          
          // } 

        }
      },
      (error: any) => {
        console.warn("error", error);
      }
    );
    
  }
  openLabModal(data){
    console.log(data)


    this.httpService
    .getAll(
      `api/Lab/GetPatienttest_bylabgroup_ForEdit?labuniqueid=${data.lab_uniqueid}&patientid=${data.patient_id}`
    )
    .subscribe(
      (res: any) => {
        if (res.data) {
        
          this._matDialog
          .open(TestListComponent, {
            width: "500px",
            height: "500px",
            panelClass: "no-padding-popup",
               data: { tests: res.data},
          })
          .afterClosed()
          .subscribe((dataObj) => {
            if (dataObj) {
              data.have_vitals = true;
              // this.getPatientVital();
            }
            this.newGetPatientsInfo();
          });
          

        }
      },
      (error: any) => {
        console.warn("error", error);
      }
    );

  }
  addTestModel() {
    // console.log(data);
    this._matDialog
      .open(LabTestsComponent, {
        width: "50rem",
        height: "100%",
        panelClass: "no-padding-popup",
        position: { right: "0" },
        // data: { patient: data, role: "Front Desk" },
      })
      .afterClosed()
      .subscribe((dataObj) => {
        console.log(dataObj);
        if (dataObj) {
          //this.billingModel(dataObj);

          // this.getPatientVital();
        }
        this.newGetPatientsInfo();
      });
  }
    
}

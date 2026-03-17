import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy,
   OnInit, ViewChild, ViewEncapsulation,Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/file-manager.service';
import { Item, Items } from 'app/modules/admin/apps/file-manager/file-manager.types';
import { APIService } from 'app/core/api/api';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AddSerumCreatinineComponent } from './add-serum-creatinine/add-serum-creatinine.component';


import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid,
  ApexFill,
  ApexAnnotations,
  ApexMarkers,
} from 'ng-apexcharts';

import { MatDialog } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AuthService } from 'app/core/auth/auth.service';
import { ReportUploadComponent } from 'app/modules/admin/apps/file-manager/report-upload/report-upload.component';
import { FileManagerReportViewComponent } from 'app/modules/admin/apps/file-manager/report-view/report-view.component';
import { environment } from "environments/environment";
import moment from "moment";
import { saveAs } from 'file-saver';
import { ApexOptions } from 'ng-apexcharts';
import { ThisReceiver } from '@angular/compiler';


export type PatientData = {
    patientid: number,
    details: string
}
export type ChartOptions = {
  series: ApexAxisChartSeries;
  annotations: ApexAnnotations;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  fill:ApexFill,
  markers:ApexMarkers,
  labels: string[];
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-report-analysis',
  templateUrl: './report-analysis.component.html',
  styleUrls: ['./report-analysis.component.scss'],
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportAnalysisComponent implements OnInit {
  @Input() patientReportId: any;
  @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;
  drawerMode: 'side' | 'over';
  selectedItem: Item;
  items: Items;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  //searchControl = new FormControl();
  //searchPatients: string[] = [];
  filteredOptions$  = new BehaviorSubject<PatientData[]>(null);
  patientData : PatientData;
  selectedPatient$ = new BehaviorSubject<string>(null);
  selectedPatientId : string;
  patientReport$ = new BehaviorSubject<any>(null);
  investigationReports: any;
  labReport$ = new BehaviorSubject<any>([]);
  radiologyReport$ = new BehaviorSubject<any>(null);
  investigationReport$ = new BehaviorSubject<any>([]);
  isPrescription = false;
  isLabReport = true;
  isInvestigation = false;
  id: string;
  host:string = 'https://hellokidneydata.s3.ap-south-1.amazonaws.com/';
  backwardSlash:string = '/'
  patient: any; 
  pageSize=20;
  pageNumber=1;
  userInfo: any;
  toggleGroupType:number = 55;
  reportsPageNumber = 1;

  //  Apx Chart decleration -- //

  @ViewChild('chart') chart: ChartComponent;
  public chartOptionsSC: Partial<ChartOptions>;
  public chartOptionsUP: Partial<ChartOptions>;
  public chartOptionsHG: Partial<ChartOptions>;
  public chartOptionsSA: Partial<ChartOptions>;
  selectedTabIndex = 0;
  selectedTimeRangeSC: string = '3months';
  selectedTimeRangeUP: string = '3months';
  selectedTimeRangeHG: string = '3months';
  selectedTimeRangeSA: string = '3months';
 
  constructor(
      private route: ActivatedRoute,
      private _changeDetectorRef: ChangeDetectorRef,
      private _router: Router,
      private _fileManagerService: FileManagerService,
      private _fuseMediaWatcherService: FuseMediaWatcherService,
      private httpService: APIService,
      private _matDialog: MatDialog,
      private auth: AuthService, 
      private _fuseConfirmationService: FuseConfirmationService,
      private http: HttpClient,
      private dialog: MatDialog,
      private cd: ChangeDetectorRef,
      private renderer: Renderer2,
      // private _projectService: ProjectService,
  ) {}


  ngOnInit(): void
  {
    this.id = this.route.snapshot.queryParamMap.get("id");
    // this._activatedRoute.queryParams.subscribe((params) => {
    //   this.id = params["id"];
    // });

    this.userInfo = JSON.parse(this.auth.user);
    console.log( this.id);

    if(this.id) {
      this.selectedPatientId = this.id;
      this.selectedPatId = this.id;
      this.getPatientInfo();
      this.onSelectionChange(null, this.id);
    }else  {
      this.selectedPatientId = localStorage.getItem('selectedPatientId');
      if(this.selectedPatientId) {
        this.getPatientInfo();
        this.onSelectionChange(null, this.selectedPatientId);
      }

    }
      // Get the items
      this._fileManagerService.items$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((items: Items) => {
              this.items = items;

              // Mark for check
              this._changeDetectorRef.markForCheck();
          });

      // Get the item
      // this._fileManagerService.item$
      //     .pipe(takeUntil(this._unsubscribeAll))
      //     .subscribe((item: Item) => {
      //         this.selectedItem = item;

      //         // Mark for check
      //         this._changeDetectorRef.markForCheck();
      //     });

      // Subscribe to media query change
      this._fuseMediaWatcherService.onMediaQueryChange$('(min-width: 1440px)')
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((state) => {

              // Calculate the drawer mode
              this.drawerMode = state.matches ? 'side' : 'over';

              // Mark for check
              this._changeDetectorRef.markForCheck();
          });
          this.toggleGroupType === 55

             
                this.serumCreatinine(3);
                this.urineProtein(3);
                this.hemoglobin(3);
                this.serumAlbumin(3);

  }

  ngOnDestroy(): void
  {
      // Unsubscribe from all subscriptions
      this._unsubscribeAll.next();
      this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------
 
  serumCreatinine (monthCount:number) {
    const url = `api/User/Patient_tests_graphs?patientid=${this.id}&testname=serum_creatinine&monthcount=${monthCount}`;
    this.httpService.getAll(url).subscribe((res: any) => {
      console.log(res,'efi9ejf9')
      if (res.data) {
        // const chartData = res.data;

        const months = res.data.map(object => object.month_name);
        const values = res.data.map(object => object.value);
      console.log(months)
      //   console.log(customMonthOrder)
        this._prepareChartDataSC(months, values);
        this.cd.detectChanges();
      } 
       
    })
  }
  urineProtein (monthCount:number) {
    const url = `api/User/Patient_tests_graphs?patientid=${this.id}&testname=urine_protein&monthcount=${monthCount}`;
    this.httpService.getAll(url).subscribe((res: any) => {
      console.log(res,'efiufuifu9fu4jf9')
      if (res.data) {
        const months = res.data.map(object => object.month_name);
        const values = res.data.map(object => object.value);
        this._prepareChartDataUP(months, values);
        this.cd.detectChanges();
      } 
       
    })
  }
  hemoglobin (monthCount:number) {
    const url = `api/User/Patient_tests_graphs?patientid=${this.id}&testname=hemoglobin&monthcount=${monthCount}`;
    this.httpService.getAll(url).subscribe((res: any) => {
      console.log(res,'efi9ejkqjdn[o2fijr0f9')
      if (res.data) {
        const months = res.data.map(object => object.month_name);
        const values = res.data.map(object => object.value);
        this._prepareChartDataHemoglobin(months, values);
        this.cd.detectChanges();
      } 
       
    })
  }
  serumAlbumin (monthCount:number) {
    const url = `api/User/Patient_tests_graphs?patientid=${this.id}&testname=serum_albumin&monthcount=${monthCount}`;
    this.httpService.getAll(url).subscribe((res: any) => {
      console.log(res,'efi9ejif4pu4hf9')
      if (res.data) {
        const months = res.data.map(object => object.month_name);
        const values = res.data.map(object => object.value);
        this._prepareChartDataSA(months, values);
        this.cd.detectChanges();
      } 
       
    })
  }
  private _prepareChartDataSC(months, data): void {   
    console.log(this.chartOptionsSC)
    console.log(months)

    this.chartOptionsSC = {
      series: [
        {
          data: data,
        },
      ],
      chart: {
        type: 'area',
        height: 350,
        toolbar: {
          show: false, 
        },
      },
      annotations: {
        points: [
          {
            x: new Date().getTime(),
            y: 8900,
            marker: {
              size: 2,
              fillColor: '#fff',
              strokeColor: 'red',
              radius: 2,
            },
            label: {
              text: 'Data feature',
              borderColor: '#FF4560',
              offsetY: 0,
              style: {
                color: '#fff',
                background: 'rgb(0, 227, 150)',
              },
            },
          },
        ],
      },
      dataLabels: {
        enabled: true,
        style: {
          colors: ['rgb(0, 227, 150)']
        }
      },
      fill: {
        colors: ['rgb(0, 227, 150)']
      },
      markers: {
        colors: ['rgb(0, 227, 150)'] 
      },
      stroke: {
        curve: "smooth",
        colors: ['rgb(0, 227, 150)'],
        // backgroundColor: ['rgb(0, 227, 150)'],
        // width: 3,
        // curve: 'straight',
      },
      
      grid: {
        padding: {
          right: 30,
          left: 30,
        },
      },
      title: {
        // text: 'Notification anomalies',
        align: 'left',
      },
       labels: months,
      xaxis: {
        labels: {
          style: {
            colors: ['black'],
            fontWeight: 500,
            fontSize: '14px',
          },
        },
        // type: 'datetime',
        // min: 1,
        // max: 31,
      },
      yaxis: {
        max:9.5,
        min: 0.5,
        tickAmount:9,
        labels: {
          style: {
            colors: ['black'],
            fontWeight: 500,
            fontSize: '14px',
          },
        },
        }
    };
  } 
  

  private _prepareChartDataUP(months, data): void {

    console.log(this.chartOptionsUP)

    this.chartOptionsUP = {
      series: [
        {
          data: data,
        },
      ],
      chart: {
        type: 'line',
        // type: "area",
        height: 320,
        toolbar: {
          show: false, 
        },
      },
      annotations: {
        points: [
          {
            x: new Date().getTime(),
            y: 8900,
            marker: {
              size: 2,
              fillColor: '#fff',
              strokeColor: 'red',
              radius: 2,
            },
            label: {
              text: 'Data feature',
              borderColor: '#FF4560',
              offsetY: 0,
              style: {
                color: '#fff',
                background: '#FF4560',
              },
            },
          },
        ],
      },
      dataLabels: {
        enabled: true,
        style: {
          colors: ['rgb(254, 176, 25)']
        }
      },
      stroke: {
        curve: 'straight',
        // curve: "smooth",
        colors: ['rgb(254, 176, 25)'],
        // width: 3,
      },
      grid: {
        padding: {
          right: 30,
          left: 30,
        },
      },
      title: {
        // text: 'Notification anomalies',
        align: 'left',
      },
      labels: months,
      xaxis: {
        labels: {
          style: {
            colors: ['black'],
            fontWeight: 500,
            fontSize: '14px',
          },
        },
        // type: 'datetime',
        // min: 1,
        // max: 31,
      },
      yaxis: {
        max: 5,
        min: 0,
        tickAmount: 5,
        labels: {
          style: {
            colors: ['black'],
            fontWeight: 500,
            fontSize: '14px',
          },
        },
        }
    };
  }
  

  private _prepareChartDataHemoglobin(months, data): void {

    

    this.chartOptionsHG = {
      series: [
        {
          data: data,
        },
      ],
      chart: {
        // type: 'line',
        type:"area",
        height: 350,
        toolbar: {
          show: false, 
        },
      },
      annotations: {
        points: [
          {
            x: new Date().getTime(),
            y: 8900,
            marker: {
              size: 2,
              fillColor: '#fff',
              strokeColor: 'red',
              radius: 2,
            },
            label: {
              text: 'Data feature',
              borderColor: '#FF4560',
              offsetY: 0,
              style: {
                color: '#fff',
                background: '#FF4560',
              },
            },
          },
        ],
      },
      dataLabels: {
        enabled: true,
      },
      stroke: {
        // curve: 'straight',
        // width: 3,
        curve: "smooth"
      },
      grid: {
        padding: {
          right: 30,
          left: 30,
        },
      },
      title: {
        // text: 'Notification anomalies',
        align: 'left',
      },
      labels: months,
      xaxis: {
        labels: {
          style: {
            colors: ['black'],
            fontWeight: 500,
            fontSize: '14px',
          },
        },
        // type: 'datetime',
        // min: 1,
        // max: 31,
      },
      yaxis: {
        max: 18,
        min: 7,
        tickAmount: 11,
        labels: {
          style: {
            colors: ['black'],
            fontWeight: 500,
            fontSize: '14px',
          },
        },
        }
    };
  }
 

  private _prepareChartDataSA(months, data): void {

 

    this.chartOptionsSA = {
      series: [
        {
          data: data,
        },
      ],
      chart: {
        // type: 'line',
        type: "line",
        height: 320,
        toolbar: {
          show: false, 
        },
      },
      annotations: {
        points: [
          {
            x: new Date().getTime(),
            y: 8900,
            marker: {
              size: 2,
              fillColor: '#fff',
              strokeColor: 'red',
              radius: 2,
            },
            label: {
              text: 'Data feature',
              borderColor: '#FF4560',
              offsetY: 0,
              style: {
                color: '#fff',
                background: '#FF4560',
              },
            },
          },
        ],
      },
      dataLabels: {
        enabled: true,
        style: {
          colors: ['rgb(255, 69, 96)']
        }
      },
      stroke: {
        curve: 'straight',
        // width: 3,
        // curve: "smooth",
        colors: ['rgb(255, 69, 96)']
      },
      grid: {
        padding: {
          right: 30,
          left: 30,
        },
      },
      title: {
        // text: 'Notification anomalies',
        align: 'left',
      },
      labels: months,
      xaxis: {
        // labels: months,
        labels: {
          style: {
            colors: ['black'],
            fontWeight: 500,
            fontSize: '14px',
          },
        },
        // type: 'datetime',
        // min: 1,
        // max: 31,
      },
      yaxis: {
        max: 10,
        min: 2,
        tickAmount: 8,
        labels: {
          style: {
            colors: ['black'],
            fontWeight: 500,
            fontSize: '14px',
          },
        },
        }
    };
  }
 

  addSerumCreatinine() {
    this.dialog
    .open(AddSerumCreatinineComponent, {
      width: "50rem",
      height: "100%",
      panelClass: "patient-reg-form",
      position: { right: "0" },
    })
  }

  onBackdropClicked(): void
  {
      // Go back to the list
      this._router.navigate(['./'], {relativeTo: this.route});

      // Mark for check
      this._changeDetectorRef.markForCheck();
  }

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any
  {
      return item.id || index;
  }
  disableUpload:boolean=false;
  tempArray:any;
  searchpatients(value) {
      const url = `api/Doctor/SearchPatients?searchText=${value}&userid=${this.userInfo.user_id}`;
      this.httpService.getAll(url).subscribe(
        (res: any) => {
            if(res.data && res.data.length > 0){
              this.filteredOptions$.next(res.data);
            }
            else {
              this.filteredOptions$.next([]);
              this.patientData = {
                  patientid : 0,
                  details : ''
              }
              this.selectedPatient$.next('');
              this.disableUpload=true;
            }
        },
        (error: any) => {
          console.log("error", error);
        }
      );
    }
    selectedPatId:any;
    onSelectionChange(event, value) {
        
      this.pageNumber=1;
      this.reportsPageNumber=1;
  
      if(event !== null && event?.option?.value !== undefined) {
        this.selectedPatient$.next(event.option.value);
        this.disableUpload=true;
        this.selectedPatientId=event?.option.id;
      }
      this.selectedPatientId = event?.option?.id !== undefined ? event?.option?.id : value;
      this.GetPatientReportsCount(this.selectedPatientId);
      this.GetAllInvestigationReports(null, this.selectedPatientId);
     // this.GetAllPrescriptionReports(this.selectedPatientId);
      if (this.toggleGroupType == 57) {
        this.isPrescription = false;
        this.isLabReport = true;
        this.isInvestigation = false;
      } else if(this.toggleGroupType == 55){
        this.isPrescription = true;
        this.isLabReport = false;
        this.isInvestigation = false;
      }
     
      if(this.selectedPatientId) {
        localStorage.setItem('selectedPatientId', this.selectedPatientId);
      }
    }
  
    clearReports() {
      this.disableUpload=true;
      this.selectedPatientId = undefined;
      this.selectedPatient$.next(null);
      this.patientReport$.next(null);
      this.investigationReport$.next([]);
      this.labReport$.next([]);
      this.radiologyReport$.next(null);
      localStorage.removeItem('selectedPatientId');
    }
    onSearchTerm(event) {
     
  
      if(event.target.value){
        this.searchpatients(event.target.value);
        this.disableUpload=false
      }else{
        this.disableUpload=true;
      }
         
    }

    switchToReportsTab() {
      this.selectedTabIndex = 1;
      console.log("selectedTabIndex", this.selectedTabIndex)
    }

    switchToAnalysisTab() {
      this.selectedTabIndex = 0;
      console.log("selectedTabIndex", this.selectedTabIndex)
    }


  GetPatientReportsCount(selectedPatientId) {
      const url = `api/Doctor/GetPatientReportsCount?patientid=${selectedPatientId}`;
      this.httpService.getAll(url).subscribe(
        (res: any) => {
            if(res.data){
              this.patientReport$.next(res.data);
            }
        },
        (error: any) => {
          console.log("error", error);
        }
      );
  }

  GetAllInvestigationReports(event?:any, selectedPatientId?:any) {
    console.log(this.toggleGroupType);
  
    selectedPatientId = selectedPatientId ? selectedPatientId : this.id;
    const url =`api/Investigations/GetAllPatientReportss?patientId=${selectedPatientId}&pagesize=${this.pageSize}&pageno=${this.reportsPageNumber}&reporttypeid=${this.toggleGroupType}`;    this.httpService.getAll(url).subscribe(
      (res: any) => {
        if (res.data) {                    
          this.investigationReports =  res.data.map(function(file:any){
            
            if (file.listOfFiles && file.listOfFiles.length !== 0) {
              file.src = `https://hellokidneydata.s3.ap-south-1.amazonaws.com/${file.listOfFiles[0].folder_path}/${file.listOfFiles[0].file_name}`;
            }
            return file;
          });;

          if (this.reportsPageNumber == 1) {
            
            this.labReport$.next(
              this.investigationReports.filter((f) => f.reporttype_id === 57)
            );
            this.investigationReport$.next(
              this.investigationReports.filter((f) => f.reporttype_id === 55)
            );
          } else{
            
            const prescriptionCurrent = this.investigationReport$.value;

            let prescription = this.investigationReports.filter((f) => f.reporttype_id === 55)

            const updatedValue = [...prescriptionCurrent, prescription];


            let labReportCurrent = this.labReport$.value;

            let labReport = this.investigationReports.filter((f) => f.reporttype_id === 57)

            const updatedValueLab = labReportCurrent.concat(labReport);
            this.labReport$.next(
              updatedValueLab.filter(
                (v, i, a) => a.findIndex((v2) => v2.id === v.id) === i
              )
            );
            this.investigationReport$.next(
              updatedValue.filter(
                (v, i, a) => a.findIndex((v2) => v2.id === v.id) === i
              )
            );

          }
        
        } else {
          if (this.reportsPageNumber == 1) {
            this.labReport$.next(null);
            this.investigationReport$.next(null);
          }
          
        }
          this.reportsPageNumber = this.reportsPageNumber+1;
      },
      (error: any) => {
        console.log("error", error);
      }
    );

  }


  GetAllPrescriptionReports(selectedPatientId) {
    const url =`api/Prescription/GetAllPrescriptionReports?patientid=` + selectedPatientId;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        if (res.data) {
          this.investigationReport$.next(res.data);
        } else {
          this.investigationReport$.next([]);
        }
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }

  GetLabpreports() {
    this.isPrescription = false;
    this.isLabReport = true;
    this.isInvestigation = false;
    this.onSelectionChange(null, this.selectedPatientId);
  }
  GetRadiologypreports() {
    this.isPrescription = false;
    this.isLabReport = false;
    this.isInvestigation = true;
    this.onSelectionChange(null, this.selectedPatientId);
  }
  GetPrescriptionpreports() {
    this.isPrescription = true;
    this.isLabReport = false;
    this.isInvestigation = false;
    this.onSelectionChange(null, this.selectedPatientId);

    //this.GetAllPrescriptionReports(this.selectedPatientId);
  }

  downloadFile(report) {
    console.log(report);
    this._matDialog
        .open(FileManagerReportViewComponent, { 
          width: "65rem",
          height: "100%",
          panelClass: "no-padding-popup",
          position: { right: "0" },
          data: { patientid: this.selectedPatientId, report},
        })
        .afterClosed()
        .subscribe((data) => {
          if (data) {
            this.getPatientInfo();
            this.getvalues();
          }
        });

    // window.open(
    //   "https://hellokidneydata.s3.ap-south-1.amazonaws.com/" + path + "/" + fileName
    // );
  }

  onScrollDown(ev: any) {
    this.GetAllInvestigationReports(ev, this.selectedPatientId);
  }

  getPatientInfo() {
    const url = `api/User/GetUsersById?userId=` + this.selectedPatientId;

    this.httpService.getAll(url).subscribe(
      (res: any) => {
        this.patient = res.data;
        this.selectedPatient$.next(this.patient?.first_name + ' ' + this.patient?.last_name + ' - ' + this.patient?.age+'yrs'+ ' - ' +this.patient?.gender + ' - ' +this.patient?.mobile_no);
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }

  deleteInvestigationReport(report: any) {
    const url = `api/Investigations/DeleteInvestigationRecord?id=` + report.id;
    const confirmation = this._fuseConfirmationService.open({
      title: "Delete Report?",
      message:
        "Are you sure you want to delete this report? This action cannot be undo!",
      actions: {
        confirm: {
          label: "Delete",
        },
        
      },
      
    });
    confirmation.afterClosed().subscribe((result) => {
      if (result === "confirmed") {
        this.httpService.create(url, null).subscribe(
          (res: any) => {
            if (res?.isSuccess && res.data) {
              this.reportsPageNumber = 1;
              this.GetPatientReportsCount(this.selectedPatientId);
              this.GetAllInvestigationReports(null, this.selectedPatientId);
            }
            this.GetPrescriptionpreports();
          },
          (error: any) => {
            console.log("error", error);
          }
        );
      }
    });
    this.report()
  }

  openUpload() {
    this._matDialog
        .open(ReportUploadComponent, { 
          width: "25rem",
          height: "100%",
          panelClass: "no-padding-popup",
          position: { right: "0" },
          data: { patientid: this.selectedPatientId},
        })
        .afterClosed()
        .subscribe((data) => {
          if (data) {
            this.reportsPageNumber = 1;
            this.GetAllInvestigationReports();
            // this.getPatientInfo();
            // this.getvalues();
          }
        });
  }
  getvalues() {
    this.onSelectionChange(null, this.selectedPatientId);
  }

  deletePrescriptionReport(report:any) {

    const url = `api/Prescription/DeletePrescription?prescriptionid=${report.prescription_id}`;
    const confirmation = this._fuseConfirmationService.open({
      title: "Delete Report?",
      message:
        "Are you sure you want to delete this report? This action cannot be undo!",
      actions: {
        confirm: {
          label: "Delete",
        },
      },
    });
    confirmation.afterClosed().subscribe((result) => {
      if (result === "confirmed") {
        this.httpService.getAll(url).subscribe(
          (res: any) => {
            if (res?.isSuccess && res.data) {
              this.GetPatientReportsCount(this.selectedPatientId);
              this.GetPrescriptionpreports();
            }
          },
          (error: any) => {
            console.log("error", error);
          }
        );
      }
    });

  }
  onScroll(ev) {
    this.GetAllInvestigationReports(ev, this.selectedPatientId);
  }
  report(type?) {
    this.reportsPageNumber = 1;
    if (type === 55) {
      this.isPrescription = true;
      this.isLabReport = false;
      this.isInvestigation = false;
      this.GetAllInvestigationReports();
    } else if (type === 57) {
      this.isPrescription = false;
      this.isLabReport = true;
      this.isInvestigation = false;
      this.GetAllInvestigationReports();
    } else if (type === "all") {
      this.GetAllInvestigationReports();
      // this._router.navigateByUrl('/reports?id='+ this.id);
    }
    this.GetAllInvestigationReports();
  }  
 
base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const binaryLen = binaryString.length;
  const bytes = new Uint8Array(binaryLen);
  for (let i = 0; i < binaryLen; i++) {
  bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

downloadPdfFile(report) {
const fileUrl =`https://hellokidneydata.s3.ap-south-1.amazonaws.com/${report.listOfFiles[0].folder_path}/${report.listOfFiles[0].file_name}`//const fileUrl = 'https://example.com/file.pdf'; // Replace with your file URL
const url = `${environment.apiURL}api/Patient/ImageToBase64?imageUrl=${fileUrl}`;

const image_fileName = this.toggleGroupType == 57 ? `Lab-report-${moment(report.created_on).format("DD-MMM-YYYY")}`: `Prescription-report-${moment().format("DD-MMM-YYYY")}`; // Replace with desired file name
const fileName = report.listOfFiles[0].file_name; // Replace with desired file name

const extension = fileName.split('.').pop();


if(extension == 'pdf') {
  this.http.get(fileUrl, { responseType: 'blob' })
  .subscribe((blob: Blob) => {
    saveAs(blob, `${image_fileName}.pdf`);
  });
} else  {
  this.http.get(url, { responseType: 'text' })
  .subscribe((base64ResString: any) => {
    
    // Base64 string of the file
    const base64String = base64ResString;
    

    // Determine the file type based on the base64 string
    const fileType = base64String.startsWith('data:image') ? 'image' : 'pdf';
    const fileExtension = fileType === 'image' ? 'jpg' : 'pdf';
    const mimeType = fileType === 'image' ? 'image' : 'application'

    const replaceImage = base64ResString.replace(/^data:image\/[a-z]+;base64,/, "");

    // Create a Blob object from the base64 string
    const blob = new Blob([this.base64ToArrayBuffer(replaceImage)], { type: `${mimeType}/${fileExtension}` });

    // Use the saveAs function to download the file
    saveAs(blob, `${image_fileName}.${fileExtension}`);


  });
}}

}
// enum Tabs {
//   Reports = 0,
//   Analysis = 1,
// }

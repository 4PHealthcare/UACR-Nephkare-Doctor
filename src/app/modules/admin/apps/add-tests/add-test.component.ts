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
import { MatTableDataSource } from "@angular/material/table";


import { SelectionModel } from "@angular/cdk/collections";
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
import { FuseConfirmationService } from "@fuse/services/confirmation";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";

import { HttpClient, HttpHeaders } from "@angular/common/http";

import { TestRangeModalComponent } from "../test-range-modal/test-range-modal.component";
import { AddTestFormComponent } from "../add-test-form/add-test-form.component";

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
  selector: "add-test",
  templateUrl: "./add-test.component.html",
  styleUrls: ["./add-test.component.scss"],
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
export class AddTestComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) private _paginator: MatPaginator;
  @ViewChild(MatSort) private _sort: MatSort;
  // Patien List Variablea
  userInfo: any;
  public myMath = Math;
  patients$ = new BehaviorSubject<any>([]);
  pageSize = 20;
  currentPage = 1;
  filterVal = "";
  filterSubject = new Subject();
  totalRecords$ = new BehaviorSubject<any>(null);
  fromDate: Date;
  dateForm: FormGroup;
  sortDirection = "";
  sortBy = "";
  fileName = "Appointments List.xlsx";
  masterSearch:any;
  uploadData: any = [];
  appointmentType = 0;
  statusType = 0;
  doctorId: any = 0;
  isLoading: boolean = false;
  loadingAction:boolean = false;
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
  selectedStatus: number = 0;

  bookingConfirmationTypes: any[] = [];
  appointmentData: any;
  doctors: any = [];
  // pagesize = 1000;
  hospitalid = 0;
  //pazeno = 1;
  searchkey = "";
  testServiceList: any[] = [];
  selectedTestServiceList: any[] = [];
  scrollContainer: HTMLElement;
  constructor(
    private _matDialog: MatDialog,
    private auth: AuthService,
    private httpService: APIService,
    private fb: FormBuilder,
    private _fuseConfirmationService: FuseConfirmationService,
    private snackBar: MatSnackBar,
    private _router: Router,
    private http: HttpClient,
    private cd: ChangeDetectorRef,
  ) {
    this.userInfo = JSON.parse(this.auth.user);
  }

  ngOnInit(): void {
    this.getAllTestServices();
    this.getSelectedTestServices();
    console.log(this.userInfo);
  }

  /**
   * After view init
   */
  ngAfterViewInit(): void {
    // this.getStatusMasterDataInfo();
    this.dataSource.paginator = this.paginator;
    this.checkedDataSource.paginator = this.checkedpaginator;
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

  initForm() {}

  // Mat table development
  displayedColumns = [ "name", "unit", "rangetext", "symbol"];
  seconddisplayedColumns =["select", "hname", "unit", "rangetext", "action"]
  data = Object.assign(this.testServiceList);

  dataSource = new MatTableDataSource<Element>(this.data);
  selection = new SelectionModel<Element>(true, []);

  checkedData = [];
  uncheckedData = this.data;
  checkedDataSource = new MatTableDataSource<Element>(this.checkedData);
  checkedSelection = new SelectionModel<Element>(true, []);

  selectedRows = [];
  selectedRowsChecked = [];

  @ViewChild("paginator") paginator: MatPaginator;
  @ViewChild("checkedpaginator") checkedpaginator: MatPaginator;

  openReangeTest(data) {
    console.log(data);
    console.log("range");
    this._matDialog
      .open(TestRangeModalComponent, {
        width: "50rem",
        height: "100%",
        panelClass: "no-padding-popup",
        position: { right: "0" },
        data: {
          data: data,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.getSelectedTestServices();
        }
      });
  }
  addNewTest(testData?:any) {
    console.log("range");
    this._matDialog
      .open(AddTestFormComponent, { 
        width: "25rem",
        height: "100%",
        panelClass: "no-padding-popup",
        position: { right: "0" },
        data:{ editTestData: testData }
      })
      .afterClosed()
      .subscribe((data) => {
        console.log(data)
        if (data) {
          // this.dataSource.filter=''
          this.getAllTestServices(this.masterSearch);
        }
      });
  }

  getAllTestServices(searchkey?:any) {
    
    this.isLoading=true;
    const url = `api/Lab/GetLabTestLabMasterTable?pagesize=${this.pageSize}&pageno=${this.currentPage}&searchkey=${searchkey ?searchkey : ''}&hospitalid=${this.userInfo.admin_account}`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        if (res.data) {
          this.isLoading=false;
          this.testServiceList = res.data;
          this.dataSource.data = res.data;
          console.log(this.testServiceList);
        }else{
          this.isLoading=false;
          this.testServiceList=[];
          this.dataSource.data =[];
        }
      },
      (error: any) => {
        this.isLoading=false;
        console.log("error", error);
      }
    ); 
  }
  getSelectedTestServices(searchkey?:any) {
    const url = `api/Lab/GetHospitalTestLabServices?pagesize=${this.pageSize}&pageno=${this.currentPage}&searchkey=${searchkey ? searchkey : ''}&hospitaladminid=${this.userInfo.admin_account}`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        if (res.data) {
          this.selectedTestServiceList = res.data;
          this.checkedDataSource.data = res.data;
          console.log(this.selectedTestServiceList);
        }else{
          this.selectedTestServiceList = [];
          this.checkedDataSource.data = [];
          this.checkedSelection.clear()
        }
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.getAllTestServices(this.dataSource.filter)
    // console.log(this.dataSource.filter);
    // if (this.dataSource.paginator) {
    //   this.dataSource.paginator.firstPage();
    // }
  }
  filterOrganizationMasterTestList(filterValue: string){
    this.checkedDataSource.filter = filterValue.trim().toLowerCase();
    this.getSelectedTestServices(this.checkedDataSource.filter)
    // console.log(this.checkedDataSource.filter);
    // if (this.checkedDataSource.paginator) {
    //   this.checkedDataSource.paginator.firstPage();
    // }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  isAllCheckedSelected() {
    const numSelected = this.checkedSelection.selected.length;
    const numRows = this.checkedDataSource.data.length;
    return numSelected === numRows;
  }

  transferSelectedRows(data) {

    data.loadingAction = true;

    const addLabTestHospital = [];
      // this.selection.selected.forEach((data: any) => { 
     
        addLabTestHospital.push({
          hospitallabid: 0,
          hospitaladminid: this.userInfo.admin_account,
          hospitaltestname: data.test_name,
          hospitalmastername: data.master_name,
          testunit: data.unit,
          // testdiff: '',
          testrange: data.range,
          // mdorder: 0,
          department: data.department,
          sampletype:data.sample_type,
          actionby: this.userInfo.user_id,
        // });
      });
      this.httpService.create("api/Lab/AddLabTestsHospital", addLabTestHospital).subscribe(
        (res: any) => {
          data.loadingAction = false;
          if (res?.isSuccess) {
            this.getAllTestServices(this.dataSource.filter);

            let dataObj = {
              department: data.department,
              hospital_labid: res.data,
              hospital_master_name: data.master_name,
              hospital_test_name: data.test_name,
              hospitaladmin_id: this.userInfo.admin_account,
              sample_type: data.sample_type,
              unit: data.unit,
              range:data.range,

            }
            this.openReangeTest(dataObj);

            this.getSelectedTestServices(this.checkedDataSource.filter);
            //this.dialogRef.close(true);
            // this.snackBar.open("Test moved to Organization Master Test List successfully.", "close", {
            //   panelClass: "snackBarSuccess",
            //   duration: 2000,
            // });
           
//            
          } 
          // else {
          //   this.snackBar.open("Please select atleast one record", "close", {
          //     panelClass: "snackBarWarning",
          //     duration: 2000,
          //   });
          // }
        },
        (error: any) => {
          data.loadingAction = false;
          console.warn("error", error);
        }
      );

    // if(data.speciman == undefined || data.speciman == null || data.speciman == ''){
    //   this.snackBar.open("Test has no specimantype. Please add specimantype and transfer", "close", {
    //     panelClass: "snackBarSuccess",
    //     duration: 1000,
    //   });
    //   setTimeout(() => {
    //     this.openReangeTest(data);
    // }, 1001);
      
    // }else{
    //   console.log(data);
      
    //   // this.selection.selected.forEach(item => {
  
    //   //   let index: number = this.uncheckedData.findIndex(d => d === item);
    //   //   this.checkedData.push(this.uncheckedData[index]);
    //   //   this.uncheckedData.splice(index,1);
  
    //   // });
     
    //   // this.selection = new SelectionModel<Element>(true, []);
    //   // this.dataSource = new MatTableDataSource<Element>(this.uncheckedData);
    //   // this.checkedDataSource = new MatTableDataSource<Element>(this.checkedData);
    //   // this.dataSource.paginator = this.paginator;
    //   // this.checkedDataSource.paginator = this.checkedpaginator;
    // }
   
  }

  removeSelectedRows(element) {
    console.log(this.checkedSelection.selected)
    const moveLabTesttoMasterHospital = [];
    moveLabTesttoMasterHospital.push({
      hospitallabid: element.hospital_labid,
    });

    this.httpService.create("api/Lab/DeleteHospitalTestLabService", moveLabTesttoMasterHospital).subscribe(
      (res: any) => {
        if (res?.isSuccess) {
          this.snackBar.open("Test moved to Master Test List successfully.", "close", {
            panelClass: "snackBarSuccess",
            duration: 2000,
          });
          this.getAllTestServices(this.dataSource.filter);
          this.getSelectedTestServices()
          this.checkedSelection.clear()
        } else {
          this.snackBar.open('Please select atleast one test', "close", {
            panelClass: "snackBarWarning",
            duration: 2000,
          });
        }
      },
      (error: any) => {
        console.warn("error", error);
      }
    );
    // this.checkedSelection.selected.forEach((item) => {
    //   let index: number = this.checkedData.findIndex((d) => d === item);

    //   this.uncheckedData.push(this.checkedData[index]);
    //   this.checkedData.splice(index, 1);
    // });
    // this.checkedSelection = new SelectionModel<Element>(true, []);
    // this.dataSource = new MatTableDataSource<Element>(this.uncheckedData);
    // this.checkedDataSource = new MatTableDataSource<Element>(this.checkedData);
    // this.dataSource.paginator = this.paginator;
    // this.checkedDataSource.paginator = this.checkedpaginator;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
    console.log(this.data);
  }

  masterCheckedToggle() {
    this.isAllCheckedSelected()
      ? this.checkedSelection.clear()
      : this.checkedDataSource.data.forEach((row) =>
          this.checkedSelection.select(row)
        );
  }
  onScrollDown(ev: any) {
    console.log("scrolled down!!", ev);
    this.pageSize += 20;
    this.getAllTestServices(this.dataSource.filter);  
   // this.direction = "scroll down";
  }

  onOrganizedScrollDown(ev: any) {
    console.log("scrolled up!", ev);
    this.pageSize += 20;
    this.getSelectedTestServices(this.checkedDataSource.filter);
    //this.direction = "scroll up";
  }
  
}

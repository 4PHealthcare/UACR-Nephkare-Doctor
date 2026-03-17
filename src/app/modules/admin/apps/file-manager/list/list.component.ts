import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/file-manager.service';
import { Item, Items } from 'app/modules/admin/apps/file-manager/file-manager.types';
import { APIService } from 'app/core/api/api';
import { ReportUploadComponent } from '../report-upload/report-upload.component';
import { MatDialog } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AuthService } from 'app/core/auth/auth.service';
import { FileManagerReportViewComponent } from '../report-view/report-view.component';
import { saveAs } from 'file-saver';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "environments/environment";
import moment from "moment";




export type PatientData = {
    patientid: number,
    details: string
}
@Component({
    selector       : 'file-manager-list',
    templateUrl    : './list.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileManagerListComponent implements OnInit, OnDestroy
{
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
    patient$ = new BehaviorSubject<any>(null);

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
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _fileManagerService: FileManagerService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private httpService: APIService,
        private _matDialog: MatDialog,
        private auth: AuthService, 
        private http: HttpClient,
        private _fuseConfirmationService: FuseConfirmationService,
    ) {}

    ngOnInit(): void
    {
      this._activatedRoute.queryParams.subscribe((params) => {
        this.id = params["id"];
      });

      this.userInfo = JSON.parse(this.auth.user);
      console.log(this.userInfo)
      console.log(history)


      if(this.id) {
        this.selectedPatientId = this.id;
        this.selectedPatId = this.id;
        this.getPatientInfo();
        this.onSelectionChange(null, this.id);
      }else if(history && history.state.from == "Dash-board"){
        this.selectedPatientId = history.state.patientId;
        this.selectedPatId = history.state.patientId;
        this.getPatientInfo();
        this.toggleGroupType = 57;
        this.onSelectionChange(null, history.state.patientId);
        
      }
        else  {
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

    onBackdropClicked(): void
    {
        // Go back to the list
        this._router.navigate(['./'], {relativeTo: this._activatedRoute});

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

    GetAllInvestigationReports(event:any, selectedPatientId:any) {
      const url =`api/Investigations/GetAllPatientReportss?patientId=${selectedPatientId}&pagesize=${this.pageSize}&pageno=${this.pageNumber}&reporttypeid=${this.toggleGroupType}`;
      this.httpService.getAll(url).subscribe(
        (res: any) => {
          if (res.data) {
            this.investigationReports =  res.data.map(function(file:any){
              
              if (file.listOfFiles && file.listOfFiles.length !== 0) {
                file.src = `https://hellokidneydata.s3.ap-south-1.amazonaws.com/${file.listOfFiles[0].folder_path}/${file.listOfFiles[0].file_name}`;
              }
              return file;
            });;

            if (this.pageNumber == 1) {
              
              this.labReport$.next(
                this.investigationReports.filter((f) => f.reporttype_id === 57)
              );
              this.investigationReport$.next(
                this.investigationReports.filter((f) => f.reporttype_id === 55)
              );
            } else{
              
              const prescriptionCurrent = this.investigationReport$.value;

              let prescription = this.investigationReports.filter((f) => f.reporttype_id === 57)

              const updatedValue = [...prescriptionCurrent, prescription];


              let labReportCurrent = this.labReport$.value;

              let labReport = this.investigationReports.filter((f) => f.reporttype_id === 57)

              const updatedValueLab = labReportCurrent.concat(labReport);

              this.labReport$.next(updatedValueLab.filter(
                (v, i, a) => a.findIndex((v2) => v2.id === v.id) === i
              )
);
              this.investigationReport$.next(
                updatedValue.filter(
                  (v, i, a) => a.findIndex((v2) => v2.id === v.id) === i
                )
              );

            }
            this.pageNumber = this.pageNumber+1;
          } else {
            if (this.pageNumber == 1) {
              this.labReport$.next([]);
              this.investigationReport$.next([]);
            }
            
          }
           

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
      

      setTimeout(() => {
              this.isPrescription = false;
              this.isLabReport = true;
              this.isInvestigation = false;
              this.onSelectionChange(null, this.selectedPatientId);
      }, 500);

    }
    GetRadiologypreports() {
      this.isPrescription = false;
      this.isLabReport = false;
      this.isInvestigation = true;
      this.onSelectionChange(null, this.selectedPatientId);
    }
    GetPrescriptionpreports() {

      setTimeout(() => {
        this.isPrescription = true;
        this.isLabReport = false;
        this.isInvestigation = false;
        this.onSelectionChange(null, this.selectedPatientId);
      }, 500);

      

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
          this.selectedPatient$.next(this.patient?.first_name + ' ' + this.patient?.last_name + ' - ' + this.patient?.age+'yrs'+ ' - ' + (this.patient?.gender).charAt(0).toUpperCase().concat((this.patient?.gender).slice(1)) + ' - ' +this.patient?.mobile_no);
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
          "Are you sure you want to delete this report? This action cannot be undone!",
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
              this.getPatientInfo();
              this.getvalues();
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
          "Are you sure you want to delete this report? This action cannot be undone!",
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
              }
              this.GetPrescriptionpreports();
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
    // Helper function to convert a base64 string to an ArrayBuffer
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
      }
     
    }
    displayPrescription(patientid, appointment_id, appointment_date) {
      const url = `${environment.apiURL}api/Doctor/DownloadPatientPrescriptions?patientid=${patientid}&appointmentid=${appointment_id}`;
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
          iframe.contentWindow.document.title = `${this.patient$.value.first_name?.trim()}-${moment(
            appointment_date
          ).format("DD-MMM-YYYY")}.pdf`;
  
          iframe.contentWindow.document.write(data);
  
          var tempTitle = document.title;
          document.title = `${this.patient$.value.first_name?.trim()}-${moment(
            appointment_date
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
    
}


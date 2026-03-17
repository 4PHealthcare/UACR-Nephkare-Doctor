import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { APIService } from 'app/core/api/api';
import { AuthService } from 'app/core/auth/auth.service';
import { NotificationsService } from 'app/layout/common/notifications/notifications.service';
import { HistoriesComponent } from 'app/modules/admin/apps/history-popups/histories.component';
import { BehaviorSubject } from 'rxjs';
import moment from "moment";
import { MedicationModalComponent } from 'app/modules/admin/apps/patient-prescription/medication-modal/medication-modal.component';
import { AllergiesComponent } from 'app/modules/admin/apps/allergy-popups/allergies.component';
import { environment } from "environments/environment";
import { SymptomsComponent } from "../symptoms/symptoms.component";
import { ReportUploadComponent } from 'app/modules/admin/apps/file-manager/report-upload/report-upload.component';

@Component({
  selector: 'app-primary-consultation',
  templateUrl: './primary-consultation.component.html',
  styleUrls: ['./primary-consultation.component.scss']
})
export class PrimaryConsultationComponent implements OnInit {
  user:any;
  isSecondOpinionTab:any; 
  panelOpenState: boolean = true;
  id:any;
  appointmentId:any;
  noIssuesId:number;
  noMedicalHistory = false;
  isSmokingData:boolean=false;
  isAlcoholData:boolean=false;
  photo:any;
  printTitle:string;
  isMedicationData:boolean=false;
  isFoodAllergy = false;
  isDrugAllergy = false;
  prescriptionStatusData:any = {};

  reportsPageNumber = 1;
  reportsPageSize = 10;
  isPrescription = true;
  isLabReport = false;
  isInvestigation = false;
  isEnvironmentAllergy = false;
  isAppointmentRunning:boolean = false;
  isPrimaryAppointmentCompleted:boolean = false;
  appointments: any;
  pageNumber: number = 1;
  appointments$ = new BehaviorSubject<any>([]);
  investigationReport$ = new BehaviorSubject<any>([]);
  allComplaints$ = new BehaviorSubject<any>(null);
  labReport$ = new BehaviorSubject<any>([]);
  htmlContent: any;

  allMedicalHistories$ = new BehaviorSubject<any>(null);
  allFamilyHistories$ = new BehaviorSubject<any>(null);
  allSurgicalHistories$ = new BehaviorSubject<any>(null);
  allMenstrualHistories$ = new BehaviorSubject<any>(null);
  allSmokingHistories$ = new BehaviorSubject<any>(null);
  allAlcholHistories$ = new BehaviorSubject<any>(null);
  allFoodAllergies$ = new BehaviorSubject<any>(null);
  allDrugAllergies$ = new BehaviorSubject<any>(null);
  allEnvAllergies$ = new BehaviorSubject<any>(null);
  patient$ = new BehaviorSubject<any>(null);
  allMedications$ = new BehaviorSubject<any>(null);
  currentDate = new Date();
  investigationReports: any;
  toggleGroupType:number = 57;

  constructor(private _activatedRoute: ActivatedRoute,
    private httpService: APIService,
    public dialog: MatDialog,
    private auth: AuthService,
    private _fuseConfirmationService: FuseConfirmationService,
    private snackBar: MatSnackBar,private _router: Router,
    private http: HttpClient,
    private cd: ChangeDetectorRef,
    private _matDialog: MatDialog,
    private _notificationsService: NotificationsService ) { }

  ngOnInit(): void {
    this.user = JSON.parse(this.auth.user);
    console.log(this.user);
    console.log(history.state)
    if(history.state && history.state.isSecondOpinionTab){
      this.isSecondOpinionTab =history.state.isSecondOpinionTab;
    }
    console.log(this.isSecondOpinionTab)
    this._activatedRoute.queryParams.subscribe((params) => {

      this.id = params["id"];
      this.appointmentId = params["appointment"];
      if(this.id && this.appointmentId) {
        
      }
      
    });
    this.getMedicalHistory();
    this.getFamilyHistory();
    this.getFoodAllergies();
    this.getDrugAllergies();
    this.getEnvAllergies();
    this.getMedications();
    this.getAlcholHistory();
    this.getSmokingHistory();
    this.getSurgicalHistory();
    this.getMenstrualHistory();
    this.getPatientAppointments(true);
    this.GetAllInvestigationReports();
    // this.getPatientAppointments(true);
    this.getAllComplaintByUserId();
    this.getPrimaryConsultationStatus();
  }

  getPatientAppointments(initialize) {
    const url = `api/Patient/GetPatientAllApointments?patientid=${this.id}&pagesize=10&pageno=${this.pageNumber}`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        if(res.data){
         
          if(initialize && res.data && res.data.length !== 0) {
            if(res.data[0].status=="Start" || res.data[0].status=="Running" || res.data[0].status=="Pending") {
              this.isAppointmentRunning = true;
              this.appointments = res.data[0];
              this.appointmentId = this.appointments.calender_id;
            }
          }

          res.data.forEach(function (element) {
            let actual = moment(element.appointment_date).format('YYYY-MM-DD');
            let currentDate = moment().format('YYYY-MM-DD');

            if(moment(actual).isAfter(currentDate, 'day')) {
              element.isGreaterDate = true;
            }else {
              element.isGreaterDate = false;
            }
          });

          
          if(this.pageNumber == 1) {
            
            this.appointments$.next(res.data);

          }else if(this.pageNumber > 1){
            const currentValue = this.appointments$.value;
            const updatedValue = [...currentValue, ...res.data];
            console.log(updatedValue);
            this.appointments$.next(updatedValue);

          }
          this.pageNumber = this.pageNumber+1;

          
      
          
        
        }
        
      },
      (error: any) => {
        console.log("error", error);
      }
    );

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
        this.htmlContent = data;

        
        const iframe = document.createElement("iframe");
        document.body.appendChild(iframe); // 👈 still required
        iframe.contentWindow.document.open();
        iframe.style.width = '1px';
        iframe.style.height = '1px';
        iframe.style.opacity = '0.01';
        iframe.contentWindow.document.write(data);


        const url2 = `api/User/GetUsersById?userId=` + this.id;


        this.httpService.getAll(url2).subscribe(
          (res: any) => {
            if(res.data) {
      
              var tempTitle = document.title;
              document.title = `${res.data.first_name?.trim()}-${moment(appointment_date).format("DD-MMM-YYYY")}.pdf`;
      
              
              try {
                iframe.contentWindow.document.execCommand('print', false, null);
              } catch (e) {
                iframe.contentWindow.print();
              }
          
              iframe.contentWindow.document.close();
      
              document.title = tempTitle;
              

              setTimeout(() => {
                window.close();
            }, 1000);


              // 

              // window.close();
              // html2canvas(iframe.contentWindow.document.body).then(canvas => {
                 
              //   const contentDataURL = canvas.toDataURL('image/png')
              //   let pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
              //   var width = pdf.internal.pageSize.getWidth();
              //   var height = canvas.height * width / canvas.width;
              //   pdf.addImage(contentDataURL, 'PNG', 0, 0, width, height)
              //   pdf.save(`${res.data.first_name?.trim()}-${moment(this.prescriptionStatusData.appointment_date).format("DD-MMM-YYYY")}.pdf`); // Generated PDF
              //   iframe.style.display = 'none';

              //   });
            }
          },
          (error: any) => {
            console.log("error", error);
          }
        );

        
       

        // if (localStorage.getItem("displayPrescription") === "patients") {
        //   this.displayPrescriptionContent = true;
        // }
      });
  }

  getAllComplaintByUserId() {
    const url = `api/PatientIllnessAndCompliants/GetAllCheifComplaint?patientId=${this.id}&appointmentId=0`;

    this.httpService.getAll(url).subscribe(
      (res: any) => {
        console.log(res);
        if(res.data){
          this.allComplaints$.next(res.data);
        } else{
          this.allComplaints$.next([]);
        }
       
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }
  getPrimaryConsultationStatus(){ 
    const url = `api/Doctor/GetPatientLatest_PrimaryConsultationdetails?patientid=${this.id}`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        if(res && res.data){
          if(res.data.status_id == 10){
            this.isPrimaryAppointmentCompleted = true
          }
        }
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }
  report(type) {
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
      this._router.navigateByUrl('/reports?id='+ this.id);
    }
  }

   GetAllInvestigationReports() {
    const url =
      `api/Investigations/GetAllPatientReportss?patientId=${this.id}&pagesize=${this.reportsPageSize}&pageno=${this.reportsPageNumber}&reporttypeid=${this.toggleGroupType}`;
    this.httpService.getAll(url).subscribe(
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

            let prescription = this.investigationReports.filter((f) => f.reporttype_id === 57)

            const updatedValue = [...prescriptionCurrent, prescription];


            let labReportCurrent = this.labReport$.value;

            let labReport = this.investigationReports.filter((f) => f.reporttype_id === 57)

            const updatedValueLab = labReportCurrent.concat(labReport);

            this.labReport$.next(updatedValueLab);
            this.investigationReport$.next(
              updatedValue
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

  onScrollDown(ev: any) {
    this.getPatientAppointments(false);
  }

  // Add medical histories data with modals
  addHistoriesModel() {
    this.dialog
      .open(HistoriesComponent, {
        width: "50rem",
        height: "100%",
        panelClass:"no-padding-popup",
        position: { right: "0" },
         data: { 
          userId: this.id,  
          appointmentId:this.appointmentId,
          noIssuesId:this.noIssuesId, 
          patient:this.patient$.value,
          smoking: this.allSmokingHistories$.value,
          alchol: this.allAlcholHistories$.value
        }
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.panelOpenState=true;
          this.getMedicalHistory();
          this.getAlcholHistory();
          this.getSmokingHistory();
          this.getSurgicalHistory();
          this.getMenstrualHistory();
          this.getFamilyHistory();
          this.getFoodAllergies();
          this.getDrugAllergies();
          this.getEnvAllergies();
          this.getMedications();
        }
      });
  }

  getPatientInfo() {
    const url = `api/User/GetUsersById?userId=` + this.id;

    this.httpService.getAll(url).subscribe(
      (res: any) => {
        this.patient$.next(res.data);
        this.photo = `https://hellokidneydata.s3.ap-south-1.amazonaws.com/${res.data.photo_folderpath}/${res.data.photo_filename}`;
        this.printTitle = `${res.data.first_name}_bill_${moment(this.currentDate).format("DD-MMM-YYYY")}`
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }

  getMedicalHistory() {
    this.noIssuesId = 0;
    const url = `api/PatientHistory/GetMedicalHistories?patientId=${this.id}&appointmentId=0`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        this.allMedicalHistories$.next(res.data);

        let obj = res.data && res.data.find(o => o.history_name == 'No Issues');

        if (obj) {
          this.noIssuesId = obj.medicalhistory_id;
        }
        
        if (res?.data?.length > 0) {
          this.noMedicalHistory = false;
        }
        else {
          this.noMedicalHistory = true;
        }
      },
      (error: any) => {
        this.noMedicalHistory = true;
        console.log("error", error);
      }
    );
  }
 

  getFamilyHistory() {
    const url = `api/PatientHistory/GetFamilyHistories?patientId=${this.id}&appointmentId=0`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        this.allFamilyHistories$.next(res.data);
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }

  getSurgicalHistory() {
    const url = `api/SocialAndSurgicalHistory/GetPatientSurgicalHistory?patientId=${this.id}&appointmentId=0`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        console.log(res.data);
        this.allSurgicalHistories$.next(res.data);
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }

  getMenstrualHistory() {
    const url = `api/SocialAndSurgicalHistory/GetPatientMenstralHistory?patientId=${this.id}&appointmentId=0`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        this.allMenstrualHistories$.next(res.data);
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }
  
  getSmokingHistory() {
    const url = `api/SocialAndSurgicalHistory/GetPatientSmokingHistory?patientId=${this.id}&appointmentId=0`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        if(res.data){
          this.isSmokingData=true;
          this.allSmokingHistories$.next(res.data);
        } else {
          this.isSmokingData = false;
          this.allSmokingHistories$.next(res.data);

        }
        
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }
  
  getAlcholHistory() {
    const url = `api/SocialAndSurgicalHistory/GetPatientAlchohalHistory?patientId=${this.id}&appointmentId=0`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        if (res.data){
          this.isAlcoholData=true;
          this.allAlcholHistories$.next(res.data);
        } else{
          this.isAlcoholData=false;
          this.allAlcholHistories$.next(null);
        }
        
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }

  addMedication() {
    this.dialog
      .open(MedicationModalComponent, {
        maxWidth: "90vw",
        width: "90rem",
        panelClass:"no-padding-popup",
        height: "100%",
        position: { right: "0" },
        data: { userId: this.id, appointmentId:this.appointmentId },
      })
      .afterClosed()
      .subscribe((data) => {
        console.log(data)
        if (data) {
          this.getMedications();
        }
        this.getMedications();
      });
  }
  updateMedication(medications) {
    this.dialog
      .open(MedicationModalComponent, {
        maxWidth: "90vw",
        width: "90rem",
        height: "100%",
        position: { right: "0" },
        data: { userId: this.id, medications, appointmentId:this.appointmentId },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.getMedications();
        }
      });
  }
  getMedications() {
    const url = `api/Doctor/GetAllCurrentMedications?patientid=${this.id}&appointmentid=0`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        if(res.data){
          this.allMedications$.next(res.data);
          this.isMedicationData=true;
        }else{
          this.isMedicationData=false;
          this.allMedications$.next([]);
        }
        
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }

  // Allergies
  addAllergiesModel() {
    this.dialog
      .open(AllergiesComponent, {
        width: "50rem",
        height: "100%",
        panelClass:"no-padding-popup",
        position: { right: "0" },
        data: { userId: this.id },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.getFoodAllergies();
          this.getDrugAllergies();
          this.getEnvAllergies();
        }
      });
  }

  updateFoodAllergy(foodAllergy) {
    this.dialog
      .open(AllergiesComponent, {
        width: "50rem",
        height: "100%",
        panelClass:"no-padding-popup",
        position: { right: "0" },
        data: { userId: this.id, foodAllergy, index: 0 },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.getFoodAllergies();
          this.getDrugAllergies();
          this.getEnvAllergies();
        }
      });
  }
  updateDrugAllergy(drugAllergy) {
    this.dialog
      .open(AllergiesComponent, {
        width: "50rem",
        height: "100%",
        panelClass:"no-padding-popup",
        position: { right: "0" },
        data: { userId: this.id, drugAllergy, index: 1 },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.getFoodAllergies();
          this.getDrugAllergies();
          this.getEnvAllergies();
        }
      });
  }

  updateEnvAllergy(envAllergy) {
    this.dialog
      .open(AllergiesComponent, {
        width: "50rem",
        height: "100%",
        panelClass:"no-padding-popup",
        position: { right: "0" },
        data: { userId: this.id, envAllergy, index: 2 },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.getFoodAllergies();
          this.getDrugAllergies();
          this.getEnvAllergies();
        }
      });
  }

  deleteFoodAllergyById(id: number) {
    const confirmation = this._fuseConfirmationService.open({
      title: "Delete Food Allergy",
      message:
        "Are you sure you want to delete this Food allergy? This action cannot be undone!",
      actions: {
        confirm: {
          label: "Delete",
        },
      },
    });
    confirmation.afterClosed().subscribe((result) => {
      if (result === "confirmed") {
        const url = `api/PatientRegistration/DeletePatientFoodAllergy?allergyid=` + id;
        this.httpService.getAll(url).subscribe(
          (res: any) => {
            if (res?.isSuccess) {
              this.getFoodAllergies();
              this.getDrugAllergies();
              this.getEnvAllergies();
              this.snackBar.open(
                "Food allergy deleted successfully. ",
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

  deleteDrugAllergyById(id: number) {
    const confirmation = this._fuseConfirmationService.open({
      title: "Delete Drug Allergy",
      message:
        "Are you sure you want to delete this Drug allergy? This action cannot be undone!",
      actions: {
        confirm: {
          label: "Delete",
        },
      },
    });
    confirmation.afterClosed().subscribe((result) => {
      if (result === "confirmed") {
        const url = `api/PatientRegistration/DeletePatientDrugAllergy?allergyid=` + id;
        this.httpService.getAll(url).subscribe(
          (res: any) => {
            if (res?.isSuccess) {
              this.getFoodAllergies();
              this.getDrugAllergies();
              this.getEnvAllergies();
              this.snackBar.open(
                "Drug allergy deleted successfully. ",
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

  deleteEnvAllergyById(id: number) {
    const confirmation = this._fuseConfirmationService.open({
      title: "Delete Environmental Allergy",
      message:
        "Are you sure you want to delete this Environmental allergy? This action cannot be undone!",
      actions: {
        confirm: {
          label: "Delete",
        },
      },
    });
    confirmation.afterClosed().subscribe((result) => {
      if (result === "confirmed") {
        const url = `api/PatientRegistration/DeletePatientEnvironmentAllergy?allergyid=` + id;
        this.httpService.getAll(url).subscribe(
          (res: any) => {
            if (res?.isSuccess) {
              this.getFoodAllergies();
              this.getDrugAllergies();
              this.getEnvAllergies();
              this.snackBar.open(
                "Environmental allergy deleted successfully. ",
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
  
  getFoodAllergies() {
    const url = `api/PatientRegistration/GetPatientFoodAllergies?patientid=${this.id}&appointmentId=0`;
    this.httpService.getAll(url).subscribe(
      (res: any) => { 
        if (res.data) {
        this.isFoodAllergy = true;
        this.allFoodAllergies$.next(res.data);
        } else {
          this.allFoodAllergies$.next([]);
          this.isFoodAllergy = false;
        }
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }
  
  getDrugAllergies() {
    const url = `api/PatientRegistration/GetPatientDrugAllergies?patientid=${this.id}&appointmentId=0`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        if(res.data) {
        this.allDrugAllergies$.next(res.data);
        this.isDrugAllergy = true;
        } else {
          this.allDrugAllergies$.next([]);
          this.isDrugAllergy = false;
        }
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }
 
  openUpload() {
    this._matDialog
        .open(ReportUploadComponent, { 
          width: "25rem",
          height: "100%",
          panelClass: "no-padding-popup",
          position: { right: "0" },
          data: { patientid: this.id},
        })
        .afterClosed()
        .subscribe((data) => {
          if (data) {
            this.GetAllInvestigationReports();
            // this.getvalues();
          }
        });
  }

  getEnvAllergies() {
    const url = `api/PatientRegistration/GetPatientEnvironmentAllergies?patientid=${this.id}&appointmentId=0`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        if(res.data) {
        this.allEnvAllergies$.next(res.data);
        this.isEnvironmentAllergy = true;
        } else {
          this.allEnvAllergies$.next([]);
          this.isEnvironmentAllergy = false;
        }
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }

  gotNewTabPrescription() {


    if (this.appointments && this.appointments.status=='Start' || this.appointments?.status === 'Pending') {
    
      const url = `api/Doctor/UpdateAppointmentStatus?appointmentid=${
        this.appointments.calender_id
      }&statusid=${9}&actionby=${this.user.user_id}&patientid=${this.id}`;
      this.httpService.create(url, null).subscribe(
        (res: any) => {
          if (res?.isSuccess) {
             // Converts the route into a string that can be used 
              // with the window.open() function
              const url = this._router.serializeUrl(
                this._router.createUrlTree([`/calr/prescription`], { queryParams: { id: this.id, appointment:this.appointments.calender_id }})
              );
            
              window.open(url, '_blank');
          }
        },
        (error: any) => {
          console.log("error", error);
        }
      );

    } else {
        // Converts the route into a string that can be used 
            // with the window.open() function
            const url = this._router.serializeUrl(
              this._router.createUrlTree([`/calr/prescription`], { queryParams: { id: this.id, appointment: this.appointments.calender_id}})
            );
          
            window.open(url, '_blank');
    }
    


    
  }

  addChiefComplaints() {
    this.dialog
      .open(SymptomsComponent, {
        width: "50rem",
        panelClass:"no-padding-popup",
        height: "100%",
        position: { right: "0" },
        data: { patId: this.id, doctorId:this.user.user_id, appointmentId:this.appointmentId, complaints: this.allComplaints$},
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.panelOpenState=true;
          this.getAllComplaintByUserId();
          
        }
      });
  }

}

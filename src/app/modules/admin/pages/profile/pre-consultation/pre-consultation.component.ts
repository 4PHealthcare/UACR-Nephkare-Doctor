import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
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
import { AddClinicalDataModalComponent } from '../add-clinical-data-modal/add-clinical-data-modal.component';
import { FileManagerReportViewComponent } from 'app/modules/admin/apps/file-manager/report-view/report-view.component';
import { ReportUploadComponent } from 'app/modules/admin/apps/file-manager/report-upload/report-upload.component';
import { ChiefComplaintModalComponent } from "app/modules/admin/apps/patient-prescription/chief-complaint-modal/chief-complaint-modal.component";
import { SymptomsComponent } from "../symptoms/symptoms.component";
import { environment } from "environments/environment";

@Component({
  selector: 'app-pre-consultation',
  templateUrl: './pre-consultation.component.html',
  styleUrls: ['./pre-consultation.component.scss']
})
export class PreConsultationComponent implements OnInit {
  user:any;
  @Input() isSecondOpinionTab: boolean;
  appointments: any;

  aboutQuillModules: any = {
    toolbar: [
      [{ font: [] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"], // toggled buttons
      ["clean"], // remove formatting button
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }], // superscript/subscript
      [{ color: [] }, { background: [] }], // dropdown with defaults from theme

      [{ align: [] }],

      ["link"], // link and image, video 
    ],
  };
  remarks:any;
  panelOpenState: boolean = true;
  id:any;
  appointmentId:any;
  noIssuesId:number;
  noMedicalHistory = false;
  isSmokingData:boolean=false;
  isAlcoholData:boolean=false;
  photo:any;
  audioFile:any = {};

  secondOpinionOverviewDetails:any;
  appointments$ = new BehaviorSubject<any>([]);

  printTitle:string;
  isMedicationData:boolean=false;
  isFoodAllergy = false;
  isDrugAllergy = false;
  isEnvironmentAllergy = false;
  toggleGroupType:number = 57;
  pageNumber: number = 1;
  reportsPageNumber = 1;
  reportsPageSize = 10;
  isPrescription = true;
  isLabReport = false;
  isInvestigation = false;
  investigationReports: any;
  notes:any;
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
  investigationReport$ = new BehaviorSubject<any>([]);
  labReport$ = new BehaviorSubject<any>([]);
  radiologyReport$ = new BehaviorSubject<any>([]);
  currentDate = new Date();
  isAppointmentRunning:boolean = false;
  allComplaints$ = new BehaviorSubject<any>(null);
  opinion_id:number;
  host:string = 'https://hellokidneydata.s3.ap-south-1.amazonaws.com/';

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
    this.toggleGroupType= 57;
    this.user = JSON.parse(this.auth.user);
    console.log(this.toggleGroupType);

    if(history.state && history.state.isSecondOpinionTab){
      this.isSecondOpinionTab =history.state.isSecondOpinionTab;
    }
    console.log(this.appointments);
    this._activatedRoute.queryParams.subscribe((params) => {

      this.id = params["id"];
      this.appointmentId = params["appointment"];
      this.opinion_id = params["opinion_id"] ? parseInt(params["opinion_id"]) : 0;
      this.GetAllInvestigationReports();
      // if(this.id && this.appointmentId) {
        
      // }
      
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
    this.GetAllInvestigationReports();
    this.getSecondOpinionOverview();
    this.getPatientAppointments(true);
    this.getAllComplaintByUserId();
    this.getAllNotes();
    this.getPatientInfo();

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
         
        }
      });
  }
  getAllNotes() {
    const payload =
    {
      "pageSize": 100,
      "pageNo": 1,
      "patientid": parseInt(this.id)
    }
    const url = `api/Notes/GetUserNotes_byPagination`;
    this.httpService.create(url, payload).subscribe((res: any) => {
      if(res.isSuccess && res.data) {   
        // this.notes = res.data;
        if(res.data.notes_data && res.data.notes_data[0].notes && res.data.notes_data[0].notes.length !==0)  {
          this.notes = res.data.notes_data[0].notes[0];
          this.remarks = res.data.notes_data[0].notes[0].description;
        }


      }
    },(error: any) => {
      console.warn("error", error);
    })
  }

  onBlurMethod($event:any) {
    console.log(this.remarks);
    this.saveNotes(this.remarks);
  }

  saveNotes(notes:any) {
    const obj = {
      "notesid": this.notes ? this.notes.notes_id : 0,
      // "titlename": "string",
      "createdon":moment().format('YYYY-MM-DDTHH:mm:ss'),
      "notesdescription": notes ? notes : this.remarks,
      "doctor_id": parseInt(this.user.user_id),
      "patient_id": parseInt(this.id),
      "opinion_id": this.opinion_id ? this.opinion_id : 0
    }
    const url = `api/Notes/ManageUserNotes`;
      this.httpService.create(url, obj).subscribe(
        (res: any) => {
          if(!this.notes) {
            this.getAllNotes();
          }

        },
        (error: any) => {

          console.log("error", error);
        }
      );
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
        if(res.data){
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

  // Report
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
      this.GetAllInvestigationReports();
      // this._router.navigateByUrl('/reports?id='+ this.id);
    }
  }
  GetAllInvestigationReports() {
    console.log(this.toggleGroupType);
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
  addSecondOpinionReview() {

  }
  symtoms:any;
  getSecondOpinionOverview(){
    this.httpService
    .getAll(`api/PatientRegistration/GetPatient_SecondOpinion_Overview?patientid=${this.id}`)
    .subscribe(
      (res: any) => {
      if(res.data) {
        this.secondOpinionOverviewDetails = res.data?.medical_info ;
       
        if (res.data && res.data.medical_info && res.data.medical_info.info_id) {
          this.audioFile = res.data.medical_info.reports.find(element => element.mime_type === 'audio/aac');
        }

        if(this.secondOpinionOverviewDetails && this.secondOpinionOverviewDetails.symptoms) {
          this.secondOpinionOverviewDetails.symptoms = this.secondOpinionOverviewDetails.symptoms.replace(/,/g, ', ');
        }
        if(this.secondOpinionOverviewDetails && this.secondOpinionOverviewDetails.risk_factors){
          this.secondOpinionOverviewDetails.risk_factors =this.secondOpinionOverviewDetails.risk_factors.replace(/,/g, ', ');
        }
        
        // this.symtoms =this.secondOpinionOverviewDetails?.symptoms?.split(', ').join("\n");
        this.cd.detectChanges();
        
      } 
      },
      (error: any) => {
        console.warn("error", error);
      }
    );
  }
  open_clinical_data_modal(SoaData?:any){ 
    this.dialog.open(AddClinicalDataModalComponent, {
      width: "50rem",
      height: "100%",
      panelClass:"no-padding-popup",
      position: { right: "0" },
      data: { data:this.id, secondOpinionData:this.secondOpinionOverviewDetails},
    })
    .afterClosed()
    .subscribe((data) => {
      if (data) {
         this.getSecondOpinionOverview();
      }
    });
  }
  openDocuments(reports) {
    console.log(reports);
    this.dialog
        .open(FileManagerReportViewComponent, { 
          width: "65rem",
          height: "100%",
          panelClass: "no-padding-popup",
          position: { right: "0" },
          data: { patientid: this.id, reports},
        })
        .afterClosed()
        .subscribe((data) => {
          if (data) {
            // this.getPatientInfo();
            // this.getvalues();
          }
        });

    
  }
  downloadFile(report) {
    console.log(report);
    this._matDialog
        .open(FileManagerReportViewComponent, { 
          width: "65rem",
          height: "100%",
          panelClass: "no-padding-popup",
          position: { right: "0" },
          data: { patientid: this.id, report},
        })
        .afterClosed()
        .subscribe((data) => {
          if (data) {
            // this.getPatientInfo();
          }
        });

    // window.open(
    //   "https://hellokidneydata.s3.ap-south-1.amazonaws.com/" + path + "/" + fileName
    // );
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

  onScrollDown(ev: any) {
    this.getPatientAppointments(false);
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

  displayPrescription(patientid, appointment_id, appointment_date) {
    const url = `${environment.apiURL}api/Doctor/DownloadPatientPrescriptions?patientid=${patientid}&appointmentid=${appointment_id}`;
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
        iframe.contentWindow.document.title=`${this.patient$.value.first_name?.trim()}-${moment(appointment_date).format("DD-MMM-YYYY")}.pdf`;

        iframe.contentWindow.document.write(data);

        var tempTitle = document.title;
        document.title = `${this.patient$.value.first_name?.trim()}-${moment(appointment_date).format("DD-MMM-YYYY")}.pdf`;

        
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

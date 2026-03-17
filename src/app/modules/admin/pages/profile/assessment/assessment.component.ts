import { ChangeDetectorRef, Component, OnInit,Input } from '@angular/core';
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
import { SymptomsComponent } from "../symptoms/symptoms.component";
import { ReportUploadComponent } from 'app/modules/admin/apps/file-manager/report-upload/report-upload.component';
import { AssessmentResultsComponent } from "../assessment-results/assessment-results.component";

@Component({
  selector: 'app-assessment',
  templateUrl: './assessment.component.html',
  styleUrls: ['./assessment.component.scss']
})
export class AssessmentComponent implements OnInit {
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
  isEnvironmentAllergy = false;
  allComplaints$ = new BehaviorSubject<any>(null);
  investigationReports: any;
  reportsPageNumber = 1;
  reportsPageSize = 10;
  toggleGroupType:number = 57;
  isPrescription = true;
  isLabReport = false;
  isInvestigation = false;

  investigationReport$ = new BehaviorSubject<any>([]);
  labReport$ = new BehaviorSubject<any>([]);
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
  @Input() isSecondOpinion: boolean;
  nutritionQuestion:boolean = false;
  nutritionAssessment:boolean = false;
  habitQuestion:boolean = false;

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
    console.log(this.isSecondOpinion);
    this.isSecondOpinionTab =this.isSecondOpinion;
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
    this.GetAllInvestigationReports();
    this.getAllComplaintByUserId();
    this.getAllAssessment();
    this.getCompletedAssemment();
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
      this._router.navigateByUrl('/reports?id='+ this.id);
    }
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

  questionStatus:any = {};
  getCompletedAssemment() {
    const url = `api/Patient/GetPatientAssessment_IsTrueOrFalse?patientid=${this.id}`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        if (res.data) {
          this.questionStatus = res.data;
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

  getAllAssessment() {
    const url = `api/Patient/GetPatientQuestionarySettings?patientid=${this.id}`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        if(res.data) {

          let nutritionObj = res.data.find(o => o.question_type === 'Nutrition');

          if(nutritionObj) {
            this.nutritionQuestion = true;
          }

          let nutritionAssessmentObj = res.data.find(o => o.question_type === 'NutritionAssessment');

          if(nutritionAssessmentObj) {
            this.nutritionAssessment = true;
          }

          let habitQuestion = res.data.find(o => o.question_type === 'PatientHabits');

          if(habitQuestion) {
            this.habitQuestion = true;
          }
          
        }
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }

  sendPatient(type:string) {

    const url = `api/Patient/SavePatientQuestionarySettings`;

    const obj = {
      "q_setting_id": 0,
      "patient_id": parseInt(this.id),
      "question_type": type,
      "is_enabled": true,
      "created_by": parseInt(this.user.user_id)
    }
    this.httpService.create(url, obj).subscribe(
      (res: any) => {

        if (type == 'Nutrition') {
          this.nutritionQuestion = true;
        } else if(type == 'NutritionAssessment') {
          this.nutritionAssessment = true;
        } else if(type == 'PatientHabits')  {
          this.habitQuestion = true;
        }
        this.cd.detectChanges();
      },
      (error: any) => {

      }
    );

  }

  viewReports(status:boolean, type:string) {
    if(status) {
      this.dialog
      .open(AssessmentResultsComponent, {
        width: "50rem",
        height: "100%",
        panelClass:"no-padding-popup",
        position: { right: "0" },
         data: { patientId:this.id, type}
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
        }
      })
    }
   

  }

}

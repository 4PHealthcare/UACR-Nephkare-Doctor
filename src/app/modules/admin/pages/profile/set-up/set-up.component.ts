import {
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
  ViewChild,
  ChangeDetectorRef,
  Output,
  EventEmitter,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BehaviorSubject } from "rxjs";
import * as moment from "moment";

import { MatStepper } from "@angular/material/stepper";
import { ActivatedRoute } from "@angular/router";
import { APIService } from "app/core/api/api";
import { MatStepperModule } from "@angular/material/stepper";
import { ExpertOpinionReportComponent } from "../expert-opinion-report/expert-opinion-report.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "app/core/auth/auth.service";
import { TreatmentComponent } from "../treatment/treatment.component";

@Component({
  selector: "app-set-up",
  templateUrl: "./set-up.component.html",
  styleUrls: ["./set-up.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class SetUpComponent implements OnInit {
  horizontalStepperForm: FormGroup;
  verticalStepperForm: FormGroup;
  selectedIndex: number = 0;
  tmpStepIndex:number = 0;
  backButtonDisabled:boolean = false;
  @Input() isSecondOpinion: boolean;
  @Input() steps: any;
  @Output() onDatePicked = new EventEmitter<any>();
  @Input() is_form_in_edit:boolean;
step:any = {};
  @Input() user: any;
  @ViewChild("expertOpinionForm")
  expertOpinionForm: ExpertOpinionReportComponent;
  @ViewChild("empForm") empForm: ExpertOpinionReportComponent;
  isEditForm: boolean = false;

  @ViewChild("treatmentForm") treatmentForm: TreatmentComponent;

  stepNames: any[] = [
    {
      name: "pre_consultation_step",
      value: 0,
    },
    {
      name: "subscription_step",
      value: 1,
    },
    {
      name: "primary_consultation_step",
      value: 2,
    },
    {
      name: "assesment_step",
      value: 3,
    },
    {
      name: "treatment_step",
      value: 4,
    },
  ];
  patientId: any;
  auth_user: any;
  opinion_id: any;
  isSubscribedPatient: boolean = false;
  @ViewChild(MatStepper) stepper: MatStepper;
  isNextButtonDisabled: boolean = false;
  /**
   * Constructor
   */
  constructor(
    private _formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private httpService: APIService,
    private cd: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    console.log('Assesment edit ---'+this.is_form_in_edit)
    // Horizontal stepper form
    // this.horizontalStepperForm = this._formBuilder.group({
    //     step1: this._formBuilder.group({}),
    //     step2: this._formBuilder.group({}),
    //     step3: this._formBuilder.group({}),
    //     step4: this._formBuilder.group({})
    // });

    this.auth_user = JSON.parse(this.auth.user);

    this.patientId = this.route.snapshot.queryParamMap.get("id");
    this.opinion_id = this.route.snapshot.queryParamMap.get("opinion_id");

    let subscriptionId = this.isSecondOpinion ? 7 : 1469;

    const url = `api/patient/GetVerifiedSecondOpinionPatient?patientid=${this.patientId}&subscriptiontype=${subscriptionId}`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        if (res.data) {
          console.log(res.data);
          this.isSubscribedPatient = res.data; 

        }

        this.getSteps();

        
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }
  // getCompletedStep(step_name:any, index:number) {
  //   let matched = false;
  //   if (this.stepper?.selectedIndex == index) {
  //     matched = false;
  //   } else {
  //     if(this.step[step_name]) {
  //       matched =  true;
  //     } 
  //     if (this.selectedIndex >  index) {
  //       matched =  true;
  //     }
  //     return matched;
  //   }
    
   
  // }
  getSteps() {
    const url1 = `api/Patient/GetPatient_Kidneywizard_status?patientid=${this.patientId}`;
    this.httpService.getAll(url1).subscribe(
      (res: any) => {
        if (res.isSuccess && res.data) {

          let step = res.data[0];
          this.step = res.data[0];
                    // if(this.isSubscribedPatient && (res.data[0].primary_consultation_step)) {
          //   this.backButtonDisabled = true;
          // }

          // this.backButtonDisabled = res.data.length !==0 ? res.data[0].primary_consultation_step : false; 
          
          let values = [];

          if(history.state.hasOwnProperty('tabNavigation')) {
            setTimeout(() => {
  
              if(history.state.tabNavigation == -1) {
                
                this.tmpStepIndex = 2;
                this.selectedIndex = 2;
                this.stepper.selectedIndex = 2;
                this.backButtonDisabled = true;
              } else {
               
                this.tmpStepIndex = history.state.tabNavigation;
                this.selectedIndex = history.state.tabNavigation;
                this.stepper.selectedIndex = history.state.tabNavigation;
  
                // this.isNextButtonDisabled = !this.stepper._steps.get(
                //   this.stepper.selectedIndex + 1
                // ).editable;
  
              }
              
  
            });
          } else {
            if (step) {
              // iterating step object
              for (let [key, value] of Object.entries(step)) {
                //if response step object properties true find index value of stepnames
                if (value) {
                  let stepObj = this.stepNames.find((item) => item.name === key);
                  if (stepObj) {
                    values.push(stepObj.value);
                  }
                }
              }
  
              // find maximum value from array to navigate steps
              let stepIndex = Math.max.apply(null, values);
              if (
                values.length !== 0 &&
                stepIndex == this.stepper._steps.length - 1
              ) {
                setTimeout(() => {
                  this.selectedIndex = stepIndex;
                  this.tmpStepIndex = stepIndex;
                  this.stepper.selectedIndex = stepIndex ? stepIndex : 0;
                  this.isNextButtonDisabled = !this.stepper._steps.get(
                    this.stepper.selectedIndex + 1
                  ).editable;
                 
                });
                this.backButtonDisabled = true;
              } else if (values.length !== 0) {
                if (!this.isSubscribedPatient && stepIndex == 1) {
                  stepIndex = stepIndex;
                } else if(this.isSubscribedPatient && stepIndex == 1) {
                  stepIndex = stepIndex + 1;
                } else if(!this.isSecondOpinion && this.isSubscribedPatient && stepIndex == 0) {
                  stepIndex = stepIndex + 2;
                }
                else if (
                  this.isSubscribedPatient && this.stepper._steps.get(stepIndex + 1)
                ) {
                  stepIndex = stepIndex + 1;
                } else {
                  stepIndex = stepIndex;
                }
  
                setTimeout(() => {
  
                  if (this.isSecondOpinion && stepIndex >= 3) {
                    stepIndex = 2;
                  }
  
                  this.tmpStepIndex = stepIndex;
                  this.selectedIndex = stepIndex;
                  this.stepper.selectedIndex = stepIndex;
  
                  //todo commit
                  // this.isNextButtonDisabled =
                  //   this.stepper._steps.get(stepIndex + 1).ariaLabelledby ==
                  //   "disabled_af";
                });
              }
            } else {
              if(this.opinion_id != 0 && this.opinion_id !== null) {
                setTimeout(() => {
  
                  this.tmpStepIndex = 2;
                  this.selectedIndex = 2;
                  this.stepper.selectedIndex = 2;
  
                });
              }
            }
          }

          
         
        }
      },
      (error: any) => {
        console.warn("error", error);
      }
    );
  }

  ngAfterViewInit() {
    console.log(this.steps);
    this.stepper._getIndicatorType = () => "number";
  }

  goBack(stepper: MatStepper) {
    this.isNextButtonDisabled = false;

    stepper.previous();
  }

  goForward(stepper: MatStepper) {
 
    let stepObj = this.stepNames.find(
      (item) => item.value === this.stepper.selectedIndex
    );
    if (!this.isSubscribedPatient) {

      this.snackBar.open("Pre Consultation saved successufully. ", "close", {
        panelClass: "snackBarSuccess",
        duration: 2000,
      });

      return;
    }

    if(stepObj.name == 'pre_consultation_step'){
      let patient_current_wizard_status="Pre Consultation";

      const url2 = `api/Patient/UpdatePatientWizardStatus?opinionid=${this.opinion_id }&patientid=${this.patientId}&patient_current_wizard_status=${patient_current_wizard_status}`;
      this.httpService.create(url2, {}).subscribe(
        (res: any) => {
          // stepper.selected.completed = true;
          this.goToStepIndex(stepper);
          if(!this.step[stepObj.name]) {
            this.step[stepObj.name] = true;
          }
        },
        (error: any) => {
          console.warn("error", error);
        }
      );
    }
    if(stepObj.name == 'subscription_step'){
      let patient_current_wizard_status="Subscription";

      const url2 = `api/Patient/UpdatePatientWizardStatus?opinionid=${this.opinion_id }&patientid=${this.patientId}&patient_current_wizard_status=${patient_current_wizard_status}`;
      this.httpService.create(url2, {}).subscribe(
        (res: any) => {
          // stepper.selected.completed = true;
           this.goToStepIndex(stepper);
        },
        (error: any) => {
          console.warn("error", error);
        }
      );
    }
    if(stepObj.name == 'primary_consultation_step'){
      let patient_current_wizard_status="Primary Consultation";

      const url2 = `api/Patient/UpdatePatientWizardStatus?opinionid=${this.opinion_id }&patientid=${this.patientId}&patient_current_wizard_status=${patient_current_wizard_status}`;
      this.httpService.create(url2, {}).subscribe(
        (res: any) => {
          // stepper.selected.completed = true;
           this.goToStepIndex(stepper);
        },
        (error: any) => {
          console.warn("error", error);
        }
      );
    }
    if(stepObj.name == 'assesment_step'){
      let patient_current_wizard_status="Assesment";

      const url2 = `api/Patient/UpdatePatientWizardStatus?opinionid=${this.opinion_id }&patientid=${this.patientId}&patient_current_wizard_status=${patient_current_wizard_status}`;
      this.httpService.create(url2, {}).subscribe(
        (res: any) => {
          // stepper.selected.completed = true;
           this.goToStepIndex(stepper);
        },
        (error: any) => {
          console.warn("error", error);
        }
      );
    }
    

    const url = `api/Patient/UpdatePatient_Kidneycare_wizard_status?patientid=${this.patientId}&stepname=${stepObj.name}&created_by=${this.user?.user_id}`;
    this.httpService.create(url, {}).subscribe(
      (res: any) => {
        // stepper.selected.completed = true;
        // this.goToStepIndex(stepper);
      },
      (error: any) => {
        console.warn("error", error);
      }
    );
  }

  goToStepIndex(stepper: MatStepper) {
    this.stepper.selected.completed = true;
    // this.stepper.selected.editable = false;

    stepper.next();

    this.isNextButtonDisabled = !this.stepper._steps.get(
      this.stepper.selectedIndex + 1
    ).editable;
  }
  getMedicineType(medicine) {
    let medicine_type: any;
    if (medicine.match("CAP")) {
      return "Capsule";
    } else if (medicine.match("INJ")) {
      return "Injection";
    } else if (medicine.match("TAB")) {
      return "Tablet";
    } else {
      return "";
    }
  }
  // saveExpertOpionionReport(stepper: MatStepper) {
  //   let stepObj = this.stepNames.find(
  //     (item) => item.value === this.stepper.selectedIndex
  //   );

  //   console.log(this.expertOpinionForm);
  //   const addedMedications = [];
  //   const medicationInfo = this.empForm.empForm.value;

  //   medicationInfo.employees.forEach((data: any) => {
  //     if (data.medicine) {
  //       const obj = {
  //         medicationid: 0,
  //         appointmentid: 0,
  //         patientid: parseInt(this.patientId),
  //         drugname: data.medicine ? data.medicine : undefined,
  //         dose_type: data.dose ? data.dose : undefined,
  //         food_type: data.food ? data.food : undefined,
  //         duration_type: data.duration ? data.duration : undefined,
  //         notes_info: data.note ? data.note : undefined,
  //         createdby: this.auth_user.user_id,
  //         is_active: data.is_active,
  //         medicine_from: moment(new Date()),
  //         medicine_to: moment().add(data.duration, "days"),
  //         dose_description:
  //           data.dose == "1 - 1 - 1"
  //             ? "Morning, Afternoon, Night"
  //             : data.dose == "1 - 1 - 0"
  //             ? "Morning, Afternoon"
  //             : data.dose == "1 - 0 - 0"
  //             ? "Morning"
  //             : data.dose == "0 - 1 - 1"
  //             ? "Afternoon, Night"
  //             : data.dose == "0 - 0 - 1"
  //             ? "Night"
  //             : data.dose == "1 - 0 - 1"
  //             ? "Morning, Night"
  //             : data.dose == "0 - 1 - 0"
  //             ? "Afternoon"
  //             : "",
  //         medicine_type: this.getMedicineType(data.medicine),
  //       };
  //       addedMedications.push(obj);
  //     }
  //   });

  //   const addedDiagnosis = [];
  //   this.expertOpinionForm.patientDiagnosisData.forEach((data: any) => {
  //     console.log(data);
  //     if (data.problem_name) {
  //       const diagnosisObj = {
  //         diagonsisid: data.diagonsis_id,
  //         appointmentid: 0,
  //         patientid: parseInt(this.patientId),
  //         problem_name: data.problem_name,
  //         otherproblem: "",
  //         code_name: "",
  //         description_name: "",
  //         clinicalstatusid: data.clinical_status_id
  //           ? data.clinical_status_id
  //           : undefined,
  //         onsetdate: data.onset_date ? data.onset_date : undefined,
  //         resolveddate: data.resolved_date ? data.resolved_date : undefined,
  //         stage_name: data.stage ? data.stage : undefined,
  //         kdigoid: 0,
  //         note_name: "",
  //         createdby: this.auth_user.user_id,
  //         is_active: data.hasOwnProperty("is_active")
  //           ? data.is_active
  //           : data.hasOwnProperty("isactive")
  //           ? data.isactive
  //           : true,
  //       };
  //       addedDiagnosis.push(diagnosisObj);
  //     }
  //   });
  //   // if (this.expertOpinionForm.expertOpinionForm.valid) {
  //     let payload = {
  //       expert_opinion_id: 0,
  //       doctor_id: this.auth_user.user_id,
  //       patient_id: parseInt(this.patientId),
  //       opinion_id: parseInt(this.opinion_id),
  //       selected_publications: this.expertOpinionForm.expertOpinionForm.value.about_publications,
  //       about_patient: this.expertOpinionForm.expertOpinionForm.value.about_patients,
  //       question_answers: this.expertOpinionForm.expertOpinionForm.value.questions_answers,
  //       recommendations: this.expertOpinionForm.expertOpinionForm.value.patient_recommendations,
  //       patient_references: this.expertOpinionForm.expertOpinionForm.value.patient_references,
  //       created_by: this.auth_user.user_id,
  //       about_doctor:this.expertOpinionForm.expertOpinionForm.value.about_doctor,
  //       photo_url: "string",
  //       photo: {
  //         patientreportid: 0,
  //         filename: this.expertOpinionForm.filename?this.expertOpinionForm.filename:null,
  //         mimetype: this.expertOpinionForm.mimetype ? this.expertOpinionForm.mimetype : null,
  //         fileBase64: this.expertOpinionForm.fileBase64 ? this.expertOpinionForm.fileBase64 : null
  //       },
  //       currentMedicationEntryList: addedMedications,
  //       saveDiagnosis:addedDiagnosis
  //     };
  //     const url = 'api/PatientRegistration/CreateUpdateExpertOpinion';
  //     this.httpService.create(url, payload).subscribe((res: any) => {

  //     const url = `api/Patient/UpdatePatient_Kidneycare_wizard_status?patientid=${this.patientId}&stepname=primary_consultation_step&created_by=${this.user?.user_id}`;
  //     this.httpService.create(url, {}).subscribe(
  //       (res: any) => {
  //       },
  //       (error: any) => {
  //         console.warn("error", error);
  //       }
  //     );

  //     this.downloadExpertOpinion()
  //     this.snackBar.open(  'Expert Opinion saved successufully. ', 'close', {
  //       panelClass: "snackBarSuccess",
  //       duration: 2000,
  //     });
  //     this.onDatePicked.emit(true);

  //     // this.goToStepIndex(stepper);
  //   },
  //   (error: any) => {
  //       console.log('error', error);
  //   });
  //   // }
  // }
  editExpertOpionionReport() {
    this.isEditForm = true; 
  }
  saveAndNext() {
         const url = `api/Patient/UpdatePatient_Kidneycare_wizard_status?patientid=${this.patientId}&stepname=primary_consultation_step&created_by=${this.user?.user_id}`;
      this.httpService.create(url, {}).subscribe(
        (res: any) => {
        },
        (error: any) => {
          console.warn("error", error);
        }
      );
            this.onDatePicked.emit(true);

  }
  downloadExpertOpinion() {
    const url = `api/PatientRegistration/DownloadExpertOpinion?patientid=${parseInt(
      this.patientId
    )}&opinionid=${parseInt(this.opinion_id)}`;
    this.httpService.create(url, {}).subscribe(
      (res: any) => {
        // stepper.selected.completed = true;
      },
      (error: any) => {
        console.warn("error", error);
      }
    );
  }
  saveTreatment() {
    console.log(this.treatmentForm.treatmentForm.value);
    let treatmentForm = this.treatmentForm.treatmentForm.value;

    let payload = {
      preference_id: 0,
      patient_id: parseInt(this.patientId),
      patient_daily_activity: undefined,
      symptoms_activation: treatmentForm.symptomActivity ? treatmentForm.symptomActivity : undefined,
      education_category: undefined,
      nutrician_followup: treatmentForm.preferences.nutritionFollowUp ? treatmentForm.preferences.nutritionFollowUp : undefined,
      nutrician_followup_timings: treatmentForm.preferences.nutritionFollowUpTimings  ? treatmentForm.preferences.nutritionFollowUpTimings : undefined,
      followup_lang_preferences: treatmentForm.preferences.language ? treatmentForm.preferences.language : undefined,

      created_by: this.auth_user.user_id,
      no_of_consultations: treatmentForm.doctorConsultation ? parseInt(treatmentForm.doctorConsultation) : undefined,
      diagnostic_report: treatmentForm.diagnosticReportPlan ? treatmentForm.diagnosticReportPlan : undefined,
      is_bloodsugar: treatmentForm.vitals.bloodSugar ? treatmentForm.vitals.bloodSugar : undefined,
      bloodsugar_options: treatmentForm.vitals.bloodSugarOptions ? treatmentForm.vitals.bloodSugarOptions : undefined,
      is_bloodpressure: treatmentForm.vitals.bloodPressure ? treatmentForm.vitals.bloodPressure : undefined,
      bloodpressure_options: treatmentForm.vitals.bloodPressureOptions ? treatmentForm.vitals.bloodPressureOptions : undefined,
      is_temp: treatmentForm.vitals.temperature ? treatmentForm.vitals.temperature : undefined,
      temp_options: treatmentForm.vitals.temperatureOptions ? treatmentForm.vitals.temperatureOptions : undefined,
      is_spo2: treatmentForm.vitals.spo2 ? treatmentForm.vitals.spo2 : undefined,
      spo2_options: treatmentForm.vitals.spo2Options ? treatmentForm.vitals.spo2Options : undefined,
      is_heartrate: treatmentForm.vitals.heartRate ? treatmentForm.vitals.heartRate : undefined,
      heartrate_options: treatmentForm.vitals.heartRateOptions ? treatmentForm.vitals.heartRateOptions : undefined,
      is_respiratory: treatmentForm.vitals.respirateRate ?treatmentForm.vitals.respirateRate : undefined,
      respiratory_options: treatmentForm.vitals.respirateRateOptions ? treatmentForm.vitals.respirateRateOptions : undefined,
      is_weight: treatmentForm.vitals.weight ? treatmentForm.vitals.weight : undefined,
      weight_options: treatmentForm.vitals.weightOptions ? treatmentForm.vitals.weightOptions : undefined,
      is_water: treatmentForm.activities.water ? treatmentForm.activities.water : undefined,
      daily_water: treatmentForm.activities.dailyWater ? treatmentForm.activities.dailyWater : undefined,
      is_sleep: treatmentForm.activities.sleep ? treatmentForm.activities.sleep : undefined,
      sleep_routine: treatmentForm.activities.sleepOptions ? treatmentForm.activities.sleepOptions : undefined,
      is_steps: treatmentForm.activities.activity ? treatmentForm.activities.activity : undefined,
      steps_count: treatmentForm.activities.activityOptions ? treatmentForm.activities.activityOptions : undefined,
      is_medicine: treatmentForm.activities.medicine ?treatmentForm.activities.medicine : undefined,
      dietplan_recommendation: treatmentForm.nutritionLogs.dietPlan ? treatmentForm.nutritionLogs.dietPlan : undefined,
      daily_micros: treatmentForm.nutritionLogs.dailyMicros ? treatmentForm.nutritionLogs.dailyMicros : undefined, 
      daily_macros: treatmentForm.nutritionLogs.dailyMacros ? treatmentForm.nutritionLogs.dailyMacros : undefined,
      opinion_id:parseInt(this.opinion_id)
    };
    const url = "api/Patient/SavePatientActivityPreferences_setup";
    this.httpService.create(url, payload).subscribe(
      (res: any) => {
        
        this.snackBar.open("Treatment plan saved successufully. ", "close", {
          panelClass: "snackBarSuccess",
          duration: 2000,
        });

      const url2 = `api/Patient/UpdatePatient_Kidneycare_wizard_status?patientid=${this.patientId}&stepname=treatment_step&created_by=${this.user?.user_id}`;
      this.httpService.create(url2, {}).subscribe(
        (res: any) => {
          let patient_current_wizard_status="Treatment";

          const url2 = `api/Patient/UpdatePatientWizardStatus?opinionid=${this.opinion_id }&patientid=${this.patientId}&patient_current_wizard_status=${patient_current_wizard_status}`;
          this.httpService.create(url2, {}).subscribe(
            (res: any) => {
              // stepper.selected.completed = true;
              
            },
            (error: any) => {
              console.warn("error", error);
            }
          );
        },
        (error: any) => {
          console.warn("error", error);
        }
      );
      this.onDatePicked.emit(true);
        // this.onDatePicked.emit(true);

        // this.goToStepIndex(stepper);
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }
}

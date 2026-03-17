import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { APIService } from 'app/core/api/api';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-treatment',
  templateUrl: './treatment.component.html',
  styleUrls: ['./treatment.component.scss']
})
export class TreatmentComponent implements OnInit {

  treatmentForm = this.fb.group({
    doctorConsultation: [''],
    diagnosticReportPlan: [''],
    vitals: this.fb.group({
      bloodSugar: false,
     bloodSugarOptions: [''],
      bloodPressure: false,
      bloodPressureOptions: [''],
      temperature: false,
      temperatureOptions: [''],
      spo2: false,
      spo2Options: [''],
      heartRate: false,
      heartRateOptions: [''],
      respirateRate: false,
      respirateRateOptions: [''],
      weight: false,
      weightOptions: ['']
    }),
    activities: this.fb.group({
      water: false,
      sleep: false,
      activity: false,
      medicine: false,
      dailyWater: [{value:null, disabled:true}],
      sleepOptions: [''],
      activityOptions:['']
    }),
    nutritionLogs: this.fb.group({
      dietPlan: [''],
      dailyMicros: [''],
      dailyMacros: [''],
    }),
    symptomActivity: [''],
    preferences: this.fb.group({
      nutritionFollowUpTimings: [''],
      nutritionFollowUp: [''],
      language: [''],
    }),
  });
  languages:any  = [
    {
      value:'English'
    },
    {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
      value:'Telugu'
    },
    {
      value:'Tamil'
    },
    {
      value:'Malayalam'
    },
    {
      value:'Hindi'
    },
    {
      value:'Marathi'
    }
  ]

  // languages:any = ['English', 'Telugu', 'Tamil', 'Malayalam', 'Hindi', 'Marathi'];

  nutritionFollowUp:any[]  = [];
  nutritionFollowUpTimings:any[]  = [];
  diagnosticReportPlan:any[] = [];
  bloodSugarOptions:any[]  = [];
  bpOptions:any[]  = [];
  tmpOptions:any[] = [];
  spo2Options:any[] = [];
  heartRateptions:any[] = [];
  respiratoryOptions:any[]= []; 
  weightOptions:any[] = [];
  stepsOptions:any[] = [];
  dietPlanOptions:any[] = [];
  symptoms:any[] = [];
  patientId:any;
  subscriptionObj:any={};
   public is_form_in_edit:boolean;
   is_water_checked:boolean=false;
  constructor(
    private httpService: APIService,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.patientId = this.route.snapshot.queryParamMap.get("id");
    // "", [Validators.required]

    // this.treatmentForm = new FormGroup({
    //   doctorConsultation: new FormControl(''),
    //   diagnosticReportPlan: new FormControl(''),
    //   bloodSugar : new FormControl(''),
    // });
    this.get_subsription_data(this.patientId)
    // this.getPatientActivity();
    this.getAllMasterData();
    
  }

  getAllMasterData() {

    let observableArray = [];

    for(let i=80;i<=91;i++) {
      observableArray.push(this.httpService.getAll(`api/User/GetMasterData?mastercategoryid=${i}`).pipe(
        catchError(error => of(error))
        ))
    }

    observableArray.push(this.httpService.getAll(`api/User/GetMasterData?mastercategoryid=78`).pipe(
      
      catchError(error => of(error))
      ))

      observableArray.push(this.httpService.getAll(`api/Patient/GetPatientActivityPreferences_setup?patientid=${this.patientId}`).pipe(catchError(error => of(error))))

    forkJoin(observableArray)
    .subscribe(([nutritionFollowUp, nutritionFollowUpTimings, diagnosticReportPlan, bloodSugarOptions, bpOptions, tmpOptions, spo2Options, heartRateptions, respiratoryOptions, weightOptions, stepsOptions, dietPlanOptions, symptoms, res])=> {
      this.nutritionFollowUp = nutritionFollowUp['data'] ? nutritionFollowUp['data'] : [];
      this.nutritionFollowUpTimings = nutritionFollowUpTimings['data'] ? nutritionFollowUpTimings['data'] : [];
      this.diagnosticReportPlan = diagnosticReportPlan['data'] ? diagnosticReportPlan['data'] : [];
      this.bloodSugarOptions = bloodSugarOptions['data'] ? bloodSugarOptions['data'] : [];
      this.bpOptions = bpOptions['data'] ? bpOptions['data'] : [];
      this.tmpOptions = tmpOptions['data'] ? tmpOptions['data'] : [];
      this.spo2Options = spo2Options['data'] ? spo2Options['data'] : [];
      this.heartRateptions = heartRateptions['data'] ? heartRateptions['data'] : [];
      this.respiratoryOptions = respiratoryOptions['data'] ? respiratoryOptions['data'] : [];
      this.weightOptions = weightOptions['data'] ? weightOptions['data'] : [];
      this.stepsOptions = stepsOptions['data'] ? stepsOptions['data'] : [];
      this.dietPlanOptions = dietPlanOptions['data'] ? dietPlanOptions['data'] : [];
      this.symptoms = symptoms['data'] ? symptoms['data'] : [];
      this.is_form_in_edit =true;
      this.data_load_if_value_exists(res['data'])
      this.cd.detectChanges();

    },
  
    (error: any) => { 
      console.log(error);
      // this.loading = false;
    }
  );

  
  }

  getMasterData(masterDataId:number) : Promise<any>{
    return new Promise((resolve, reject) => {

      const url = `api/User/GetMasterData?mastercategoryid=` + masterDataId;

      this.httpService.getAll(url).subscribe((res: any) => {

        resolve(res.data ? res.data: []);

      },(error: any) => {
        resolve([]);
        // console.warn("error", error);
      })

    })
  }
  setLanguages() {
    
    const control = this.treatmentForm.get(['preferences','language']);
    if (control)
      control.setValue(this.languages.filter(x=>x.active).map(x=>x.value))
  }
  setBloodSugar(){
    const control = this.treatmentForm.get(['vitals','bloodSugarOptions']);
    if (control)
      control.setValue(this.bloodSugarOptions.filter(x=>x.active).map(x=>x.data_name))
  }
  // getPatientActivity(){
  //   const url1 = `api/Patient/GetPatientActivityPreferences_setup?patientid=${this.patientId}`;
  //   this.httpService.getAll(url1).subscribe(
  //     (res: any) => {
  //       if (res.isSuccess && res.data) {
  //         if(res.data.preference_id) {
  //           this.is_form_in_edit =true;
  //           this.data_load_if_value_exists(res.data)
  //         }

  //       }
  //     },
  //     (error: any) => {
  //       console.warn("error", error);
  //     }
  //   );
  // }
  data_load_if_value_exists(data){
    console.log(data)
 
    this.getSelectedBloodSugarOptions(data.bloodsugar_options);
    this.getSelectedLanguages(data.followup_lang_preferences)
    this.treatmentForm.patchValue( 
      {
        doctorConsultation: data.no_of_consultations,
        diagnosticReportPlan: data.diagnostic_report,
        vitals:{
          bloodSugar: data.is_bloodsugar ? true : false,
          bloodSugarOptions: data.bloodsugar_options,
          bloodPressure: data.is_bloodpressure ? true : false,
          bloodPressureOptions: data.bloodpressure_options,
          temperature: data.is_temp ? true : false,
          temperatureOptions: data.temp_options,
          spo2: data.is_spo2 ? true : false,
          spo2Options: data.spo2_options,
          heartRate: data.is_heartrate ? true : false,
          heartRateOptions: data.heartrate_options,
          respirateRate: data.is_respiratory ? true : false,
          respirateRateOptions: data.respiratory_options,
          weight: data.is_weight ? true : false,
          weightOptions: data.weight_options
        },
        activities:{
          water: data.is_water ? true : false,
          sleep: data.is_sleep ? true : false,
          activity: data.is_steps ? true : false,
          medicine: data.is_medicine ? true : false,
          dailyWater: data.daily_water,
          sleepOptions: data.sleep_routine,
          activityOptions:data.steps_count
        },
        nutritionLogs:{
          dietPlan: data.dietplan_recommendation,
          dailyMicros: data.daily_micros,
          dailyMacros: data.daily_macros,
        },
        symptomActivity:data.symptoms_activation,
        preferences:{
          nutritionFollowUpTimings: data.nutrician_followup_timings,
          nutritionFollowUp: data.nutrician_followup,
          language: data.followup_lang_preferences,
        }
      }
    ) 
  }
  getSelectedLanguages(languages){

    //  this.selectedItemsList = this.checkboxesDataList.filter((value, index) => {
    //   return value.isChecked
    // });
    this.languages = this.languages.filter(function(e:any){
      if(languages && languages.indexOf(e.value) !== -1) {
        e.active = true;
      }
      return e;
    })
    // console.log(this.symptoms);
  }

  getSelectedBloodSugarOptions(bloodSugarOptions){
    console.log(this.bloodSugarOptions);
this.bloodSugarOptions = this.bloodSugarOptions.filter(function(e:any){
      if(bloodSugarOptions && bloodSugarOptions.indexOf(e.data_name) !== -1) {
        e.active = true;
      }
      return e;
    })
  }
  CheckedOrNot(){
    
    const dailyWatercontrol = this.treatmentForm.get(['activities','dailyWater']);
    const watercontrol = this.treatmentForm.get(['activities','water']);

   if(watercontrol.value){
    dailyWatercontrol.enable();
   }else{
    dailyWatercontrol.disable();
   }
 
    
  }
  get_subsription_data(id){
    const url1 = `api/Patient/GetPatientLatest_OpinionPlan?patientid=${id}`;
    this.httpService.getAll(url1).subscribe(
      (res: any) => {
        if (res.isSuccess && res.data) {
         console.log(res.data);
         this.subscriptionObj = res.data;
        }
      },
      (error: any) => {
        console.warn("error", error);
      }
    );
  }
}

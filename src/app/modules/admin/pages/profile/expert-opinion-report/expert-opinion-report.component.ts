import { Component, ElementRef, Input, OnInit, ViewChild, HostListener } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { APIService } from 'app/core/api/api';
import { AuthService } from 'app/core/auth/auth.service';
import {MatChipInputEvent} from '@angular/material/chips';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from "@angular/material/autocomplete";
import { BehaviorSubject } from 'rxjs';
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { MatSnackBar } from "@angular/material/snack-bar";
import * as moment from "moment";
import { environment } from "environments/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';


@Component({
  selector: 'app-expert-opinion-report',
  templateUrl: './expert-opinion-report.component.html',
  styleUrls: ['./expert-opinion-report.component.scss']
})
export class ExpertOpinionReportComponent implements OnInit {
  expertOpinionForm: FormGroup;
  isSecondOpinionTab:any;
  accountInfo: any;
  photo:any;
  uploaded = false;
  user:any;
  name:any;
  speciality:any;
  education:any;
  filename:any;
  mimetype:any;
  expert_opinion_id:any;
  disable_btn=true;
  fileBase64:any;
  htmlContent: any;
  isVideoLoading:boolean = false;
  isDataChange: boolean = true;
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
  publicationQuillModules: any = {
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
  aboutPatientQuillModules: any = {
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
  questionAnswerQuillModules: any = {
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
  patientRecommendationQuillModules: any = {
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
  patientReferancesQuillModules: any = {
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
  patientId:any;
  opinion_id:any;
  expert_opinion_status:string;
  @Input() isEditForm: Boolean;
  roomURL:SafeResourceUrl;
  constructor(public httpService: APIService, public auth: AuthService, public _formBuilder: FormBuilder, private route: ActivatedRoute,private snackBar: MatSnackBar, private http: HttpClient,private domSanitizer: DomSanitizer) { }

  ngOnInit(): void {
    console.log(this.isEditForm)
    this.isVideoLoading = true;
    this.user = JSON.parse(this.auth.user);

    this.patientId = this.route.snapshot.queryParamMap.get("id");
    this.opinion_id =this.route.snapshot.queryParamMap.get("opinion_id");
    this.expert_opinion_status = this.route.snapshot.queryParamMap.get("status");
    console.log(this.expert_opinion_status)

    this.getMasterDataInfo(38);
    this.getMasterDataInfo(39);
    console.log(this.opinion_id);
    
      this.getPatientExperOpinionRport(this.patientId, this.opinion_id);
      this.startSession(this.opinion_id);
   
      console.log('Data form profile');
      this.getUserInfo(this.user.user_id,'');
  
    this.expertOpinionForm = new FormGroup({
      about_doctor: new FormControl("", [Validators.required]),
      about_publications: new FormControl("", [Validators.required]),
      about_patients: new FormControl("", [Validators.required]),
      questions_answers: new FormControl("", [Validators.required]),
      patient_recommendations: new FormControl("", [Validators.required]),
      patient_references: new FormControl("", [Validators.required]),
      diagnosisCtrl:new FormControl("", [Validators.required])
      
    });
   
    if(history.state && history.state.isSecondOpinionTab){
      this.isSecondOpinionTab =history.state.isSecondOpinionTab;
    }
    this.empForm = this._formBuilder.group({
      employees: this._formBuilder.array([]),
    });
  }
  @HostListener('window:beforeunload', ['$event'])
    onBeforeUnload() {
      if (this.isDataChange) {
        return window.confirm('There is the unsaved message....');
      } else {
        return true;
      }
    }
  startSession(opinion_id) {
    if(opinion_id) {
      let payload = {
        "videoopinionid": 0,
        "patientid":  parseInt(this.patientId),
        "opinionid": parseInt(opinion_id),
        "doctorid": this.user.user_id,
        "startdate": moment().format(),
        "enddate": moment().add(15, 'minutes'),
        "createdby": this.user.user_id,
        "roomurl": "",
        "meetingid": "", 
      }
      const url = `api/Doctor/GetVideoDetails_ByOpinionId`;
      this.httpService.create(url, payload).subscribe(
        (res: any) => {
          console.log(res);
          if(res && res.data && res.data.roomUrl) {
             this.roomURL = this.domSanitizer.bypassSecurityTrustResourceUrl(res.data.roomUrl);
             console.log(this.roomURL);
          }
          this.isVideoLoading = false;
        },
        (error: any) => {
          console.log("error", error);
          this.isVideoLoading = false;
        }
      );
    }
    

  }
  ngOnChanges(){
    
  }
  onMouseEnter() {
    this.uploaded = false;
  }
  onSelectFile(event) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      
      let file = event.target.files[0];
     
      reader.onload = function (event: any) {
        this.photo = event.target.result;
        this.disable_btn=false;
        const base64Content = this.photo;
        let base64ContentArray = base64Content.split(",");
        let mimeType = base64ContentArray[0].match(
          /[^:\s*]\w+\/[\w-+\d.]+(?=[;| ])/
        )[0];
        let base64Data = base64ContentArray[1];
        this.fileBase64=base64Data;
        this.mimetype=mimeType;
        this.filename=file.name;
        this.expertOpinionForm.filename= this.filename;
        this.expertOpinionForm.mimetype= this.mimetype;
        this.expertOpinionForm.fileBase64= this.fileBase64;

        this.uploaded = false;
        this.accountForm.get('isPhotoUpdated').setValue(true);
        this.accountForm.controls.isPhotoUpdated.markAsDirty()
        this.accountForm.updateValueAndValidity({emitEvent: false, onlySelf: true});
        this.cd.detectChanges();
       
        
      }.bind(this);
      
      reader.readAsDataURL(file); 
      
    }
  }
  getUserInfo(userId: number, photo_url: any) {
    console.log(photo_url);
    this.httpService.get("api/User/GetUsersById?userId=", userId).subscribe(
      (res: any) => {
        this.accountInfo = res.data;
      
        if(this.accountInfo.photo_folderpath && this.accountInfo.photo_filename) {
          if(photo_url){
            this.photo= `https://hellokidneydata.s3.ap-south-1.amazonaws.com/${photo_url}`;
          }
          else{
            this.photo = `https://hellokidneydata.s3.ap-south-1.amazonaws.com/${this.accountInfo.photo_folderpath}/${this.accountInfo.photo_filename}`;
          }
          
         
         this.expertOpinionForm.patchValue({about_doctor:this.accountInfo.profile_description})
          this.disable_btn = false;
        }
        this.name = this.accountInfo.full_name ? this.accountInfo.full_name : (this.accountInfo.first_name + ' ' + this.accountInfo.last_name);
         this.speciality=this.accountInfo.speciality;
         this.education =this.accountInfo.education;
        // this.patchForm(this.accountInfo);
      },
      (error: any) => {
        console.warn("error", error);
      }
    );
    console.log(this.name);
    console.log(this.speciality);
    console.log(this.education);
  }
  getPatientExperOpinionRport(patId,OpinionId) {
   
    const url = `api/PatientRegistration/GetExpertOpinion?patientid=${patId}&opinionid=${OpinionId}`;
    this.httpService.getAll(url).subscribe((res: any) => {
    
      if(res.isSuccess && res.data) {
        console.log(res.data);
        this.expert_opinion_id = res.data.expert_opinion_id
          this.patchData(res.data)
      
          
       }
    },(error: any) => {
      console.warn("error", error);
    })

  }
  patchData(data ){
    this.expertOpinionForm.patchValue( 
      {
        expert_opinion_id:data.expert_opinion_id,
        about_publications: data.selected_publications,
        about_patients: data.about_patient,
        questions_answers: data.question_answers,
        patient_recommendations: data.recommendations,
        patient_references: data.patient_references,
        
       
      })
      console.log(data);

      // Patching medication list into the form
      if (data?.currentMedicationEntryList?.length > 0) { 
        data?.currentMedicationEntryList.forEach((data: any) => {
          this.addEmployee();
        });
        this.updateMedicationFormData(data?.currentMedicationEntryList);
      } else if(data?.currentMedicationEntryList?.length == 0){
       this.addEmployee();
      }

      // Patching diagnosis list into the form
      if (data?.diagnosis?.length > 0) {
        this.patientDiagnosisData = data?.diagnosis?.map(function(test:any){
          return {
            "diagonsisid": test.diagonsis_id,
            "patientid": test.patient_id,
            "appointmentid": test.appointment_id,
            "createdby": test.created_by,
            "is_active": true,
            "problem_name": test.problem
          }
        })
      }
      // Patching if any photo updated
      if(data?.photo_url){
        this.getUserInfo(this.user.user_id,data?.photo_url );
      }
  }



  patientDiagnosisData: any = [];
  formChange:boolean = true;
  filteredDiagnosisOptions$ = new BehaviorSubject<any[]>(null);
  filteredOptions$ = new BehaviorSubject<any[]>(null);
  doseMedication$ = new BehaviorSubject<any>(null);
  foodMedication$ = new BehaviorSubject<any>(null);
  @ViewChild("diagnosisInput") diagnosisInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto3') matAutocomplete1: MatAutocomplete;
  diagnosisCtrl = new FormControl();
  separatorKeysCodes: number[] = [ENTER];
  drugData: any;
  addOnDiagnosisBlur(event: FocusEvent) {
    const target: HTMLElement = event.relatedTarget as HTMLElement;
    console.log(this.diagnosisInput.nativeElement);
    if (!target || target.tagName !== 'MAT-OPTION') {
      const matChipEvent: MatChipInputEvent = {input: this.diagnosisInput.nativeElement, value : this.diagnosisInput.nativeElement.value};
      this.addDiagnosis(matChipEvent);
    }
  }
  addDiagnosis(event: MatChipInputEvent): void {

    const input = event.input;
    const value = (event.value || '').trim();

    // Add our fruit
    if ((value || '').trim()) {
      const isOptionSelected = this.matAutocomplete1.options.some(option => option.selected);
      if (!isOptionSelected) {
      this.patientDiagnosisData.push({
        "diagonsisid": 0,
        "patientid": this.patientId,
         "appointmentid": 0,
        "createdby": this.user.user_id,
        "is_active": true,
        "problem_name": value
      });
      }
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.diagnosisCtrl.setValue(null);

  }
  removeDiagnosis(lab: any): void {
    if (lab.diagonsisid) {
      lab.is_active = false;
    } else {
      this.patientDiagnosisData = this.patientDiagnosisData.filter(obj => obj.problem_name !== lab.problem_name);
    }
    this.enableFormChanges();
  }
  enableFormChanges() { 
    this.formChange = true;
  }
  searchDiagnosisTerm(event) {

    const value = event.target.value;
    if (value.length > 2)  {
      const url = `api/Patient/SearchICDCodes?searchtext=${value}`;
      this.httpService.getAll(url).subscribe(
        (res: any) => {
          if (res.data && res.data.length > 0) {
            this.filteredDiagnosisOptions$.next(res.data);
          } else {
            this.filteredDiagnosisOptions$.next([]);
          }
        },
        (error: any) => {
          console.log("error", error);
        }
      );
    } else {
      this.filteredDiagnosisOptions$.next([]);
    }
  
  }
  duplicateDiagnosisFound(testName) {
    let obj = this.patientDiagnosisData.find(o => o.problem_name === testName); 
    if (obj) {
      return true;
    } else{
      return false;
    }

  }
  selectedDiagnosis(event: MatAutocompleteSelectedEvent): void {
    console.log(event)
    if (!this.duplicateDiagnosisFound(event.option.value)) {
      this.patientDiagnosisData.push({
        "diagonsisid": 0,
        "patientid": this.patientId,
        "appointmentid": 0,
        "createdby": this.user.user_id,
        "is_active": true,
        "problem_name": event.option.value
      });
    }
    

    this.diagnosisInput.nativeElement.value = "";
    this.diagnosisCtrl.setValue(null);
    this.enableFormChanges();
  }

  newEmployee(): FormGroup {
    return this._formBuilder.group({
      medicine: "",  dose: "", food: "", duration: "", note: "", id: "", is_active: true,
    });
  }

  empForm: FormGroup;
  employees(): FormArray {
    return this.empForm.get("employees") as FormArray;
  }
  addEmployee(isLoading?:boolean) {
    this.employees().push(this.newEmployee());
  }
  removeEmployee(empIndex: number) {
    this.employees().removeAt(empIndex);
    this.enableFormChanges();
  }
  searchDrugsTerm(event) {
    const value = event.target.value;
    const url = `api/Doctor/SearchDrugs?searchText=${value}`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        if (res.data && res.data.length > 0) {
          this.filteredOptions$.next(res.data);
        } else {
          this.filteredOptions$.next([]);
          this.drugData = {
            drugId: 0,
            description: "",
          };
        }
        this.enableFormChanges();
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }
  getMasterDataInfo(type) {
    const url = `api/User/GetMasterData?mastercategoryid=` + type;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        switch (type) {
          case 38:
            this.doseMedication$.next(res.data);
            break;
          case 39:
            this.foodMedication$.next(res.data);
            break;
          default:
        }
      },
      (error: any) => {
        console.log("error", error);
      }
    );
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
   saveExpertOpionionReport() {
   

    console.log(this.expertOpinionForm);
    const addedMedications = [];
    const medicationInfo = this.empForm.value;

    medicationInfo.employees.forEach((data: any) => {
      if (data.medicine) {
        const obj = {
          medicationid: 0,
          appointmentid: 0,
          patientid: parseInt(this.patientId),
          drugname: data.medicine ? data.medicine : undefined,
          dose_type: data.dose ? data.dose : undefined,
          food_type: data.food ? data.food : undefined,
          duration_type: data.duration ? data.duration : undefined,
          notes_info: data.note ? data.note : undefined,
          createdby: this.user.user_id,
          is_active: data.is_active,
          medicine_from: moment(new Date()),
          medicine_to: moment().add(data.duration, "days"),
          dose_description:
            data.dose == "1 - 1 - 1"
              ? "Morning, Afternoon, Night"
              : data.dose == "1 - 1 - 0"
              ? "Morning, Afternoon"
              : data.dose == "1 - 0 - 0"
              ? "Morning"
              : data.dose == "0 - 1 - 1"
              ? "Afternoon, Night"
              : data.dose == "0 - 0 - 1"
              ? "Night"
              : data.dose == "1 - 0 - 1"
              ? "Morning, Night"
              : data.dose == "0 - 1 - 0"
              ? "Afternoon"
              : "",
          medicine_type: this.getMedicineType(data.medicine),
        };
        addedMedications.push(obj);
      }
    });

    const addedDiagnosis = [];
    this.patientDiagnosisData.forEach((data: any) => {
      console.log(data);
      if (data.problem_name) {
        const diagnosisObj = {
          diagonsisid: data.diagonsis_id,
          appointmentid: 0,
          patientid: parseInt(this.patientId),
          problem_name: data.problem_name,
          otherproblem: "",
          code_name: "",
          description_name: "",
          clinicalstatusid: data.clinical_status_id
            ? data.clinical_status_id
            : undefined,
          onsetdate: data.onset_date ? data.onset_date : undefined,
          resolveddate: data.resolved_date ? data.resolved_date : undefined,
          stage_name: data.stage ? data.stage : undefined,
          kdigoid: 0,
          note_name: "",
          createdby: this.user.user_id,
          is_active: data.hasOwnProperty("is_active")
            ? data.is_active
            : data.hasOwnProperty("isactive")
            ? data.isactive
            : true,
        };
        addedDiagnosis.push(diagnosisObj);
      }
    });
    // if (this.expertOpinionForm.expertOpinionForm.valid) {
      let payload = {
        expert_opinion_id: this.expert_opinion_id ? this.expert_opinion_id : 0,
        doctor_id: this.user.user_id,
        patient_id: parseInt(this.patientId),
        opinion_id: parseInt(this.opinion_id),
        selected_publications: this.expertOpinionForm.value.about_publications,
        about_patient: this.expertOpinionForm.value.about_patients,
        question_answers: this.expertOpinionForm.value.questions_answers,
        recommendations: this.expertOpinionForm.value.patient_recommendations,
        patient_references: this.expertOpinionForm.value.patient_references,
        created_by: this.user.user_id,
        about_doctor:this.expertOpinionForm.value.about_doctor,
        photo_url: "string",
        photo: {
          patientreportid: 0,
          filename: this.filename?this.filename:null,
          mimetype: this.mimetype ? this.mimetype : null,
          fileBase64: this.fileBase64 ? this.fileBase64 : null
        },
        currentMedicationEntryList: addedMedications,
        saveDiagnosis:addedDiagnosis
      };
      const url = 'api/PatientRegistration/CreateUpdateExpertOpinion';
      this.httpService.create(url, payload).subscribe((res: any) => {

      const url = `api/Patient/UpdatePatient_Kidneycare_wizard_status?patientid=${this.patientId}&stepname=primary_consultation_step&created_by=${this.user?.user_id}`;
      this.httpService.create(url, {}).subscribe(
        (res: any) => {
        },
        (error: any) => {
          console.warn("error", error);
        }
      );

      this.downloadExpertOpinion()
      this.snackBar.open(  'Expert Opinion saved successufully. ', 'close', {
        panelClass: "snackBarSuccess",
        duration: 2000,
      });
      // this.onDatePicked.emit(true);

      // this.goToStepIndex(stepper);
    },
    (error: any) => {
        console.log('error', error);
    });
    // }
  }
  downloadExpertOpinion() {
    const url = `${environment.apiURL}api/PatientRegistration/DownloadExpertOpinion?patientid=${parseInt(this.patientId)}&opinionid=${parseInt(this.opinion_id)}`;
    // this.httpService.create(url, {}).subscribe((res: any) => {},
    //   (error: any) => {
    //     console.warn("error", error);
    //   }
    // );
    const headers = new HttpHeaders().set(
      "Content-Type",
      "text/plain; charset=utf-8"
    );
    this.http.post(url, {}, { headers, responseType: "text" })
      .subscribe((data: any) => {
        this.htmlContent = data;

        
        const iframe = document.createElement("iframe");
        document.body.appendChild(iframe); // 👈 still required
        iframe.contentWindow.document.open();
        iframe.style.width = '1px';
        iframe.style.height = '1px';
        iframe.style.opacity = '0.01';
        iframe.contentWindow.document.write(data);

        try {
          iframe.contentWindow.document.execCommand('print', false, null);
        } catch (e) {
          iframe.contentWindow.print();
        }
    
        iframe.contentWindow.document.close();

      });

  }
  updateMedicationFormData(data: any) {
    let medicationData = [];
    data.map((info: any) => {
      const obj = {
        medicine: info.drug_name,
        dose: info.dose,
        food: info.food,
        duration: info.duration,
        note: info.notes,
        id: info.medication_id,
      };
      medicationData.push(obj);
    });
    console.log("obj", medicationData);

    const medObj = {
      employees: medicationData,
    };
    this.empForm.patchValue(medObj);
  }
}

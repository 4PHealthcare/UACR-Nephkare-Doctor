import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
  ChangeDetectorRef,
  TemplateRef,
} from "@angular/core";
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormBuilder,
  FormGroup,
} from "@angular/forms";
import { BehaviorSubject, forkJoin, of } from "rxjs";
import { TableData, VaccinData, VitalData } from "./table-data.model";
import { MatSnackBar } from "@angular/material/snack-bar";
import { APIService } from "app/core/api/api";
import { AuthService } from "app/core/auth/auth.service";
import { DiagnosisModalComponent } from "./diagnosis-modal/diagnosis-modal.component";
import { MatDialog } from "@angular/material/dialog";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import {
  MatAutocompleteSelectedEvent,
  MatAutocomplete,
} from "@angular/material/autocomplete";
import { MedicalHistoryComponent } from "./medical-history/medical-history.component";
import { ActivatedRoute, Router } from "@angular/router";
import { environment } from "environments/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from "@angular/material-moment-adapter";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import { MatRadioGroup } from "@angular/material/radio";
import { FuseConfirmationService } from "@fuse/services/confirmation";
import * as moment from "moment";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { MedicalConditionComponent } from "./medical-condition/medical-condition.component";
import { MatChipInputEvent } from "@angular/material/chips";
import _ from "lodash";

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { MedicationModalComponent } from "./medication-modal/medication-modal.component";
import { ViewLastPrescriptionMedicationComponent } from "./view-last-prescription-medication/view-last-prescription-medication.component";
import { catchError } from "rxjs/operators";
import { ViewPrescriptionComponent } from "./view-prescription/view-prescription.component";
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

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
  selector: "app-patient-prescription",
  templateUrl: "./patient-prescription.component.html",
  styleUrls: ["./patient-prescription.component.scss"],
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
})
export class PatientPrescriptionComponent implements OnInit {
  // @ViewChild('signInNgForm') signInNgForm: NgForm;
  // signInForm: FormGroup;
  advice: string = "";
  nextVisitDate: any;
  diet: string = "";
  isVideoLoading: boolean = false;
  selectedCategory: number;
  downloadAction: boolean = false;
  enableAfterEdit: boolean = true;
  pat_email: any;
  today = moment();
  data: TableData[] = [
    {
      medicine: "",
      dose: "",
      food: "",
      duration: "",
      note: "",
    },
  ];
  vaccineData: any[] = [];
  vitalData: VitalData[] = [
    {
      systolicBp: "",
      dystolicBp: "",
      heartRate: "",
      temperature: "",
      respiratoryRate: "",
      spo2: "",
      weight: "",
      weightid: 0,
      tempid: 0,
      sp02id: 0,
      respiratoryid: 0,
      heartid: 0,
      bpid: 0,
    },
  ];

  dataSource = new BehaviorSubject<AbstractControl[]>([]);
  vaccineDataSource = new BehaviorSubject<AbstractControl[]>([]);
  vitalDataSource = new BehaviorSubject<AbstractControl[]>([]);
  rows: FormArray;
  isDataChange: boolean = true;
  VaccineRows: FormArray;
  VitalRows: FormArray;
  appointmentId: number = 0;
  formFieldHelpers: string[] = [""];
  plans: any[];
  diagnosisList: any[];
  meidicalHistoryList: any = [];
  medicalConditions: any[] = [];

  isWhatsppSent:boolean = false;
  isEmailSent:boolean = false;
  isWhatsappActionLoading:boolean = false;

  recentDiagnosis: any[] = [];
  recentObervations: any[] = [];
  recentMedications: any[] = [];
  recentMedicationList: any[] = [];


  userInfo: any;
  patientId: any;
  pid: any;
  calendarId: number = 0;
  appointmentDate = new BehaviorSubject<any>(null);
  dietId: any;
  prescriptionStatusData: any = {};
  patientPrescriptionRunning: boolean = false;
  adviceId: any;
  labId: any;
  radiologyId: any;
  formChange: boolean = true;
  proceduresId: any;
  htmlContent: any;
  selectedVisitName: string;
  displayPrescriptionContent = false;
  isBrowserbackEventDetected = false
  frequency_list = [
    { id: 1, name: "Days" },
    { id: 2, name: "Weeks" },
    { id: 3, name: "Months" },
  ];

  next_visist_after: any;
  frequency_value: any;
  pick_date: string;

  roomURL: SafeResourceUrl;
  @ViewChild("planRadioGroup", { static: false }) planRadioGroup: MatRadioGroup;
  @ViewChild("auto2") matAutocomplete: MatAutocomplete;
  @ViewChild("auto3") matAutocomplete1: MatAutocomplete;
  @ViewChild("secondDialog", { static: true }) secondDialog: TemplateRef<any>;
  isPrescriptionCinformLoading: boolean;
  hwrId: number;
  @HostListener('window:popstate', ['$event'])
  onPopState(event: any): void {
    // Handle the browser back event here
    console.log('Browser back detected');
    // Add your custom logic or navigation handling as needed
  }

  doseMedication$ = new BehaviorSubject<any>(null);
  foodMedication$ = new BehaviorSubject<any>(null);
  frequencyMedication$ = new BehaviorSubject<any>(null);
  filteredOptions$ = new BehaviorSubject<any[]>(null);
  filteredTestsOptions$ = new BehaviorSubject<any[]>(null);
  filteredObervationsOptions$ = new BehaviorSubject<any[]>(null);
  filteredDiagnosisOptions$ = new BehaviorSubject<any[]>(null);
  selectedMedicationToFill: any;
  patient: any;
  isPatientEmailPresent: boolean = true;

  constructor(
    private _formBuilder: FormBuilder,
    private httpService: APIService,
    private auth: AuthService,
    private cd: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private _activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private _router: Router,
    private _fuseConfirmationService: FuseConfirmationService,
    private domSanitizer: DomSanitizer
  ) {
    this.rows = this._formBuilder.array([]);
    this.VaccineRows = this._formBuilder.array([]);
    this.VitalRows = this._formBuilder.array([]);
    this.userInfo = JSON.parse(this.auth.user);
    console.log(this.userInfo);
  }

  enableFormChanges() {
    this.formChange = true;
  }

  ngOnInit(): void {
    this.frequency_value = "Days"; 
    this.isVideoLoading = true;
    this.patientId = this._activatedRoute.queryParams.subscribe((params) => {
      this.pid = parseInt(params["id"]);
      this.hwrId =parseInt(params["hwrId"]);
      this.getPatientInfo(this.pid);
      this.appointmentId = params["appointment"]
        ? Number(params["appointment"])
        : 0;

      this.checkPrescriptionStatus();
    });
    // this.appointmentDate.next(new Date());
    this.data.forEach((d: TableData) => this.addRow(d, false));
    this.updateView();
    this.vaccineData.forEach((d: VaccinData) => this.addVaccineRow(d, false));
    this.updateVaccinationView();
    this.vitalData.forEach((d: VitalData) => this.addVitalRow(d, false));
    this.updateVitalRow();
    this.plans = [
      {
        value: "one-week",
        label: "After 1 Week",
      },
      {
        value: "fifteen-days",
        label: "After 15 Days",
      },
      {
        value: "one-month",
        label: "After 1 month",
      },
      {
        value: "three-months",
        label: "After 3 month",
      },
    ];
    // Medication Form init
    this.empForm = this._formBuilder.group({
      employees: this._formBuilder.array([]),
    });
    // this.employees().push(this.newEmployee());

    // Medication Form end

    // Vaccine Form init
    this.vaccineForm = this._formBuilder.group({
      vaccines: this._formBuilder.array([]),
    });
    this.vaccines().push(this.newVaccine());

    // Vaccine Form end

    this.getMasterDataInfo(38);
    this.getMasterDataInfo(39);
    this.getMasterDataInfo(40);
    this.getMasterDataInfo(48);
    this.getMasterDataInfo(49);
    this.getMasterDataInfo(44);

    this.getRecentSearches();
  }

  getPatientInfo(patId) {
    const url = `api/User/GetUsersById?userId=` + patId;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        this.patient = res.data;
        console.log(this.patient);
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }

  // get Recent diagnosis, symptoms and medications
  getRecentSearches() {
    const obser1$ = this.httpService
      .getAll(
        `api/Doctor/GetPatientDiagnosisBySearch?doctorid=${this.userInfo.user_id}`
      )
      .pipe(catchError((error) => of(error)));
    const obser2$ = this.httpService
      .getAll(
        `api/Doctor/GetPatientChiefComplaintsBySearch?doctorid=${this.userInfo.user_id}`
      )
      .pipe(catchError((error) => of(error)));
    const obser3$ = this.httpService
      .getAll(
        `api/Doctor/GetPatientCurrentMedicationBySearch?doctorid=${this.userInfo.user_id}`
      )
      .pipe(catchError((error) => of(error)));

    forkJoin([obser1$, obser2$, obser3$]).subscribe(
      ([diagnosis, observations, medications]) => {
        if (diagnosis.data && diagnosis.data.length !== 0) {
          this.recentDiagnosis = diagnosis.data.map((value) => ({
            description: value.problem,
          }));

          this.filteredDiagnosisOptions$.next(this.recentDiagnosis);
        }

        if (observations.data && observations.data.length !== 0) {
          this.recentObervations = observations.data.map((value) => ({
            name: value.complaint,
          }));

          this.filteredObervationsOptions$.next(this.recentObervations);
        }

        if (medications.data && medications.data.length !== 0) {
          this.recentMedicationList = medications.data;
          this.recentMedications = medications.data.map((value) => ({
            description: value.drug_name,
          }));

          this.filteredOptions$.next(this.recentMedications);
        }

        // this.recentMedications = medications.data ? medications.data: [];

        // this.filteredObervationsOptions$.next(this.recentObervations);
        // this.filteredOptions$.next(this.recentMedications);
      },

      (error: any) => {
        console.log(error);
        // this.loading = false;
      }
    );
  }

  @HostListener("window:beforeunload", ["$event"])
  onBeforeUnload() {
    if (this.isDataChange) {
      return window.confirm("There is the unsaved message....");
    } else {
      return true;
    }
  }

  onBlurMethod($event, isApiCall?: boolean) {
    console.log($event);
    if ($event.target.value) {
      if (isApiCall) {
        // this.savePrescription(true);
      } else {
        //this.savePrescription();
      }
    }
  }

  getFormFieldHelpersAsString(): string {
    return this.formFieldHelpers.join(" ");
  }

  addOnBlur(event: FocusEvent) {
    const target: HTMLElement = event.relatedTarget as HTMLElement;
    if (!target || target.tagName !== "MAT-OPTION") {
      const matChipEvent: MatChipInputEvent = {
        input: this.observationsInput.nativeElement,
        value: this.observationsInput.nativeElement.value,
      };
      this.addObservation(matChipEvent);
    }
  }

  addOnDiagnosisBlur(event: FocusEvent) {
    const target: HTMLElement = event.relatedTarget as HTMLElement;
    if (!target || target.tagName !== "MAT-OPTION") {
      const matChipEvent: MatChipInputEvent = {
        input: this.diagnosisInput.nativeElement,
        value: this.diagnosisInput.nativeElement.value,
      };
      this.addDiagnosis(matChipEvent);
    }
  }

  duplicateLabelFound(testName) {
    let obj = this.labs.find((o) => o.testname === testName);
    if (obj) {
      return true;
    } else {
      return false;
    }
  }

  addDiagnosis(event: MatChipInputEvent): void {
    const input = event.input;
    const value = (event.value || "").trim();

    // Add our fruit
    if ((value || "").trim()) {
      const isOptionSelected = this.matAutocomplete1.options.some(
        (option) => option.selected
      );
      if (!isOptionSelected) {
        this.patientDiagnosisData.push({
          diagonsisid: 0,
          patientid: this.pid,
          appointmentid: this.appointmentId,
          createdby: this.userInfo.user_id,
          is_active: true,
          problem_name: value,
        });
      }
    }

    // Reset the input value
    if (input) {
      input.value = "";
    }

    this.diagnosisCtrl.setValue(null);
  }

  addObservation(event: MatChipInputEvent): void {
    const input = event.input;
    const value = (event.value || "").trim();

    // Add our fruit
    if ((value || "").trim()) {
      const isOptionSelected = this.matAutocomplete.options.some(
        (option) => option.selected
      );
      if (!isOptionSelected) {
        this.observations.push({
          complaintid: 0,
          patientid: this.pid,
          appointmentid: this.appointmentId,
          createdby: this.userInfo.user_id,
          is_active: true,
          complaint_name: value,
        });
      }
    }

    // Reset the input value
    if (input) {
      input.value = "";
    }

    this.observationCtrl.setValue(null);
  }

  addRow(d?: TableData, noUpdate?: boolean) {
    const row = this._formBuilder.group({
      medicine: [d && d.medicine ? d.medicine : null, []],
      dose: [d && d.dose ? d.dose : null, []],
      // time: [d && d.time ? d.time : null, []],
      food: [d && d.food ? d.food : null, []],
      // frequency: [d && d.frequency ? d.frequency : null, []],
      duration: [d && d.duration ? d.duration : null, []],
      note: [d && d.note ? d.note : null, []],
    });
    this.rows.push(row);
    console.log(this.rows);
    if (!noUpdate) {
      this.updateView();
    }
  }
  addVaccineRow(d?: VaccinData, noUpdate?: boolean) {
    const row = this._formBuilder.group({
      vaccination: [d && d.vaccination ? d.vaccination : null, []],
      date: [d && d.date ? d.date : null, []],
      name: [d && d.name ? d.name : null, []],
      roa: [d && d.roa ? d.roa : null, []],
      values: [d && d.values ? d.values : null, []],
      dose: [d && d.dose ? d.dose : null, []],
    });
    this.VaccineRows.push(row);
    console.log(this.rows);
    if (!noUpdate) {
      this.updateVaccinationView();
    }
  }
  addVitalRow(d?: VitalData, noUpdate?: boolean) {
    const row = this._formBuilder.group({
      systolicBp: [d && d.systolicBp ? d.systolicBp : null, []],
      dystolicBp: [d && d.dystolicBp ? d.dystolicBp : null, []],
      heartRate: [d && d.heartRate ? d.heartRate : null, []],
      temperature: [d && d.temperature ? d.temperature : null, []],
      spo2: [d && d.spo2 ? d.spo2 : null, []],
      weight: [d && d.weight ? d.weight : null, []],
      respiratoryRate: [d && d.respiratoryRate ? d.respiratoryRate : null, []],
      tempid: [d && d.spo2 ? d.spo2 : null, []],
      weightid: [d && d.weight ? d.weight : null, []],
      sp02id: [d && d.spo2 ? d.spo2 : null, []],
      respiratoryid: [d && d.spo2 ? d.spo2 : null, []],
      heartid: [d && d.spo2 ? d.spo2 : null, []],
      bpid: [d && d.spo2 ? d.spo2 : null, []],
    });
    this.VitalRows.push(row);
    console.log(this.rows);
    if (!noUpdate) {
      this.updateVaccinationView();
    }
  }

  updateView() {
    this.dataSource.next(this.rows.controls);
  }
  updateVaccinationView() {
    this.vaccineDataSource.next(this.VaccineRows.controls);
  }
  updateVitalRow() {
    this.vitalDataSource.next(this.VitalRows.controls);
  }
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  patientDiagnosisData: any = [];

  checkPrescriptionStatus() {
    const url = `api/Doctor/GetPatientPrescriptionStatus?doctorid=${this.userInfo.user_id}&patientid=${this.pid}&appointmentid=${this.appointmentId}`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        console.log(res);
        if (res.isSuccess && res.data) {
          this.prescriptionStatusData = res.data;
          // this.patientPrescriptionRunning = false;

          if (this.appointmentId !== 0) {
            this.getPatientPrescription(this.appointmentId, true);
          }

          if (this.appointmentId === 0) {
            this.appointmentId = Number(res.data.appointment_id);
          }

          // if (this.appointmentId !== 0 && res.data.status === "Completed") {
          //   this.displayPrescription(this.appointmentId);
          // }

          if (
            res.data.schedule_typeid == 73 &&
            !this.patientPrescriptionRunning &&
            this.appointmentId &&
            !this.displayPrescriptionContent
          ) {
            this.startSession();
          } else {
            this.isVideoLoading = false;
          }
        }
      },
      (error: any) => {
        console.warn("error", error);
      }
    );
  }

  startSession() {
    if (this.appointmentId) {
      let payload = {
        videoid: 0,
        patientid: this.hwrId,
        appointmentid: this.appointmentId,
        doctorid: this.userInfo.user_id,
        startdate: moment().format(),
        enddate: moment().add(15, "minutes"),
        createdby: this.userInfo.user_id,
      };
      const url = `api/Doctor/GetVideoDetails`;
      this.httpService.create(url, payload).subscribe(
        (res: any) => {
          console.log(res);
          if (res && res.data && res.data.roomUrl) {
            this.roomURL = this.domSanitizer.bypassSecurityTrustResourceUrl(
              res.data.roomUrl
            );
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

  openDiagnosis() {
    this.dialog
      .open(DiagnosisModalComponent, {
        width: "50rem",
        height: "100%",
        panelClass: "no-padding-popup",
        position: { right: "0" },
        data: { prescription: true },
      })
      .afterClosed()
      .subscribe((data) => {
        console.log(data);
        if (data) {
          let dataObj = { ...JSON.parse(data), showDeleteIcon: true };
          this.patientDiagnosisData.push(dataObj);
          this.enableFormChanges();
          // this.savePrescription();
        }
      });
  }

  editDiagnosis(info: any, ind: any) {
    this.dialog
      .open(DiagnosisModalComponent, {
        width: "50rem",
        height: "100%",
        panelClass: "no-padding-popup",
        position: { right: "0" },
        data: { prescription: true, info: info },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.patientDiagnosisData[ind] = JSON.parse(data);
        }
      });
  }

  deleteDiagnosis(data: any, ind: any) {
    let hasKey_is_active = data.hasOwnProperty("is_active");
    if (hasKey_is_active) {
      this.patientDiagnosisData[ind].is_active = false;
      this.patientDiagnosisData[ind]["hideRow"] = true;
    } else {
      this.patientDiagnosisData[ind]["is_active"] = false;
      this.patientDiagnosisData[ind]["hideRow"] = true;
    }
  }

  openMedicalHistory() {
    this.dialog
      .open(MedicalHistoryComponent, {
        width: "50rem",
        height: "100%",
        panelClass: "no-padding-popup",
        position: { right: "0" },
        data: { prescription: true },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          let dataObj = { ...JSON.parse(data), showDeleteIcon: true };
          // this.medicalConditions = dataObj.toString();
          this.enableFormChanges();
        }
      });
  }
  openPreviousMedicalHistry() {
    this.dialog
      .open(ViewLastPrescriptionMedicationComponent, {
        width: "75rem",
        height: "100%",
        panelClass: "no-padding-popup",
        position: { right: "0" },
        data: { patientId: this.pid, AppointmentId: this.appointmentId },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          if (data?.length > 0) {
            // data?.forEach((data: any) => {
            //   this.addEmployee();
            // });
          
            let ids = new Set(this.empForm.value.employees.map(({ medicine }) => medicine));
            
            let uniqueRows = data.filter(({ drug_name }) => !ids.has(drug_name));


            if(uniqueRows.length !== 0) {
              this.updatelastMedicationFormData(uniqueRows);
            } else  {
              this.snackBar.open(
                "Selected Medication is already exist. Please select other medicine.",
                "close",
                {
                  panelClass: "snackBarWarning",
                  duration: 2000,
                }
              );
        
            }
            
            
            
          } else if (data?.length == 0) {
            this.addEmployee();
          }
        }
      });
  }
  updatelastMedicationFormData(data: any) {


    let control = this.employees();

    if(control.length == 1) {
      let dose = control
        .at(0)
        .get("medicine").value;
        console.log(dose);
        if(!dose) {
          this.removeEmployee(0);
        }
    }
    data.map((info: any) => {
      const obj = {
        medicine: info.drug_name,
        dose: info.dose,
        // time: info.timing,
        food: info.food,
        // frequency: info.frequency,
        duration: info.duration,
        note: info.notes,
        id: info.medication_id,
      };
   //   medicationData.push(obj);
     // control.push(obj);
      
     console.log(control.length);

     control.push(
      this._formBuilder.group({
        medicine: info.drug_name,
        dose: info.dose,
        // time: info.timing,
        food: info.food,
        // frequency: info.frequency,
        duration: info.duration,
        note: info.notes,
        id: info.medication_id,
      })
    );
    
    });

    // const medObj = {
    //   employees: medicationData,
    // };
 //   this.empForm.patchValue(medObj);
  }
  updateInMedicationForm(MedicineList) {}
  openMedicalCondition() {
    this.dialog
      .open(MedicalConditionComponent, {
        width: "50rem",
        height: "100%",
        panelClass: "no-padding-popup",
        position: { right: "0" },
        data: { prescription: true },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          let dataObj = { ...JSON.parse(data), showDeleteIcon: true };

          if (this.medicalConditions && this.medicalConditions.length == 0) {
            this.medicalConditions = [
              {
                medical_status: dataObj.condition.join(", "),
              },
            ];
          } else {
            this.medicalConditions.push({
              medical_status: dataObj.condition.join(", "),
            });
          }

          this.enableFormChanges();
        }
      });
  }

  editMedicalHistory(item: any, ind: any) {
    this.dialog
      .open(MedicalHistoryComponent, {
        width: "50rem",
        height: "100%",
        panelClass: "no-padding-popup",
        position: { right: "0" },
        data: { prescription: true, item },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          console.log("dta", data);
          this.meidicalHistoryList[ind] = JSON.parse(data);
        }
      });
  }

  deleteMedicalHistory(data: any, ind: any) {
    console.log("hello", data.hasOwnProperty("is_active"));
    let hasKey_is_active = data.hasOwnProperty("is_active");
    if (hasKey_is_active) {
      this.meidicalHistoryList[ind].is_active = false;
      this.meidicalHistoryList[ind]["hideRow"] = true;
    } else {
      this.meidicalHistoryList[ind]["is_active"] = false;
      this.meidicalHistoryList[ind]["hideRow"] = true;
    }
  }

  empForm: FormGroup;
  employees(): FormArray {
    return this.empForm.get("employees") as FormArray;
  }

  newEmployee(): FormGroup {
    return this._formBuilder.group({
      medicine: "",
      dose: "",
      // time: "",
      food: "",
      // frequency: "",
      duration: "",
      note: "",
      id: "",
      is_active: true,
      // skills: this._formBuilder.array([])
    });
  }

  addEmployee(isLoading?: boolean) {
    this.employees().push(this.newEmployee());

    // if (isLoading) {
    //   this.savePrescription(true)
    // }
  }

  removeEmployee(empIndex: number) {
    this.employees().removeAt(empIndex);
    this.enableFormChanges();
  }

  vaccineForm: FormGroup;
  vaccines(): FormArray {
    return this.vaccineForm.get("vaccines") as FormArray;
  }

  newVaccine(): FormGroup {
    return this._formBuilder.group({
      vaccination: "",
      vaccineDate: "",
      vaccineName: "",
      roa: "",
      vaccineValues: "",
      vaiicineDose: "",

      // skills: this._formBuilder.array([])
    });
  }

  addVaccines() {
    //  this.vaccines().push(this.newVaccine());
    this.vaccineData.push({
      vaccination: "",
      date: "",
      name: "",
      roa: "",
      values: "",
      dose: "",
      vaccineValues: [],
      doseValues: [],
      id: null,
    });
  }

  removeVaccine(vaccineIndex: number) {
    this.vaccineData.splice(vaccineIndex, 1);
  }
  onSubmit() {
    console.log(this.empForm.value);
  }

  drugData: any;

  getMasterDataInfo(type) {
    const url = `api/User/GetMasterData?mastercategoryid=` + type;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        switch (type) {
          case 38:
            this.doseMedication$.next(res.data);
            console.log(this.doseMedication$);
            break;
          case 39:
            this.foodMedication$.next(res.data);
            console.log(this.foodMedication$);
            break;

          case 48:
            this.allLabs = res.data;
            break;
          case 49:
            this.allRadiologies = res.data;
            break;
          case 44:
            this.allProcedures = res.data;
            break;
          default:
        }
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }

  searchDrugsTerm(event) {
    const value = event.target.value;
    if (value) {
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
    } else {
      this.filteredOptions$.next(this.recentMedications);
    }
  }

  searchTestsTerm(event) {
    const value = event.target.value;
    const url = `api/user/GetSearchPatientstestsList?searchText=${value}`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        if (res.data && res.data.length > 0) {
          this.filteredTestsOptions$.next(res.data);
        } else {
          this.filteredTestsOptions$.next([]);
        }
        this.enableFormChanges();
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }

  searchObservationsTerm(event) {
    const value = event.target.value;
    if (value) {
      const url = `api/User/GetSearchMasterData?mastercategoryid=70&searchtext=${value}`;
      this.httpService.getAll(url).subscribe(
        (res: any) => {
          if (res.data && res.data.length > 0) {
            this.filteredObervationsOptions$.next(res.data);
          } else {
            this.filteredObervationsOptions$.next([]);
          }
        },
        (error: any) => {
          console.log("error", error);
        }
      );
    } else {
      this.filteredObervationsOptions$.next(this.recentObervations);
    }
  }

  searchDiagnosisTerm(event) {
    const value = event.target.value;
    if (value.length > 2) {
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
      let data = [];

      if (value.length == 1) {
        data = this.recentDiagnosis.filter((item) =>
          item.description.toLowerCase().includes(value.toLowerCase())
        );
      } else {
        data = this.recentDiagnosis;
      }

      this.filteredDiagnosisOptions$.next(data);
      // this.filteredDiagnosisOptions$.next([]);
    }
  }

  @ViewChild("labInput") labInput: ElementRef<HTMLInputElement>;
  @ViewChild("observationsInput")
  observationsInput: ElementRef<HTMLInputElement>;
  @ViewChild("diagnosisInput") diagnosisInput: ElementRef<HTMLInputElement>;

  separatorKeysCodes: number[] = [ENTER];
  labCtrl = new FormControl();
  observationCtrl = new FormControl();
  diagnosisCtrl = new FormControl();
  filteredLabs: any = [];
  labs: any[] = [];
  allLabs: any[] = [];
  observations: any[] = [];

  removeLab(lab: string): void {
    // const index = this.labs.indexOf(lab);
    // if (index >= 0) {
    //   this.labs.splice(index, 1);
    // }
    this.labs = this.labs.filter((obj) => obj.testname !== lab);
    this.enableFormChanges();
  }

  removeObservation(lab: string): void {
    // const index = this.labs.indexOf(lab);
    // if (index >= 0) {
    //   this.labs.splice(index, 1);
    // }
    this.observations = this.observations.filter(
      (obj) => obj.complaint_name !== lab
    );

    if (this.observations.length == 0) {
      this.filteredObervationsOptions$.next(this.recentObervations);
    }

    this.enableFormChanges();
  }

  removeDiagnosis(lab: any): void {
    // const index = this.labs.indexOf(lab);
    // if (index >= 0) {
    //   this.labs.splice(index, 1);
    // }
    console.log(lab);
    if (lab.diagonsisid) {
      lab.is_active = false;
    } else {
      this.patientDiagnosisData = this.patientDiagnosisData.filter(
        (obj) => obj.problem_name !== lab.problem_name
      );
    }

    let data = this.patientDiagnosisData.filter((obj) => obj.is_active);
    if (data.length === 0) {
      this.filteredDiagnosisOptions$.next(this.recentDiagnosis);
    }

    this.enableFormChanges();
  }

  selectedLab(event: MatAutocompleteSelectedEvent): void {
    if (!this.duplicateLabelFound(event.option.value)) {
      this.labs.push({
        patientid: this.pid,
        appointmentid: this.appointmentId,
        createdby: this.userInfo.user_id,
        is_active: true,
        testid: 0,
        testname: event.option.value,
      });
    }

    this.labInput.nativeElement.value = "";
    this.labCtrl.setValue(null);
    this.enableFormChanges();
    // this.savePrescription(true);
  }

  duplicateObservationsFound(testName) {
    let obj = this.observations.find((o) => o.complaint_name === testName);
    if (obj) {
      return true;
    } else {
      return false;
    }
  }

  selectedObervation(event: MatAutocompleteSelectedEvent): void {
    if (!this.duplicateObservationsFound(event.option.value)) {
      this.observations.push({
        complaintid: 0,
        patientid: this.pid,
        appointmentid: this.appointmentId,
        createdby: this.userInfo.user_id,
        is_active: true,
        complaint_name: event.option.value,
      });
    }

    this.observationsInput.nativeElement.value = "";
    this.observationCtrl.setValue(null);
    this.enableFormChanges();
    // this.savePrescription(true);
  }

  duplicateDiagnosisFound(testName) {
    let obj = this.patientDiagnosisData.find(
      (o) => o.problem_name === testName
    );
    if (obj) {
      return true;
    } else {
      return false;
    }
  }

  selectedDiagnosis(event: MatAutocompleteSelectedEvent): void {
    console.log(event);
    if (!this.duplicateDiagnosisFound(event.option.value)) {
      this.patientDiagnosisData.push({
        diagonsisid: 0,
        patientid: this.pid,
        appointmentid: this.appointmentId,
        createdby: this.userInfo.user_id,
        is_active: true,
        problem_name: event.option.value,
      });
    }

    this.diagnosisInput.nativeElement.value = "";
    this.diagnosisCtrl.setValue(null);
    this.enableFormChanges();
    // this.savePrescription(true);
  }
  selectedMedication(event: MatAutocompleteSelectedEvent, index: number): void {
    // console.log(event.option.value);
    // console.log(this.recentMedicationList); 
    
    let value = event.option.value;
    this.selectedMedicationToFill = this.recentMedicationList.filter(
      (Medication: any) => Medication.drug_name == value
    );
   
    
    let medicationData = [];
    this.selectedMedicationToFill.map((info: any) => {
      const obj = {
        medicine: info.drug_name,
        dose: info.dose,
        // time: info.timing,
        food: info.food,
        // frequency: info.frequency,
        duration: info.duration,
        note: info.notes,
        id: info.medication_id,
      };
      medicationData.push(obj);
    });
   
    let duplicatesExist:Boolean;
   
    
    let duplicateMedication = this.empForm.value.employees.filter((obj) => obj.medicine == value);

    if (duplicateMedication && duplicateMedication.length > 1) {
      duplicatesExist = true;
    } else {
      duplicatesExist =false;
    }
    
    // for (let i =0;i<this.empForm.value.employees.length ; i++){
    //   if( this.empForm.value.employees[i].medicine === value){
    //     duplicatesExist =true;
    //     break;
    //   }else{
    //     duplicatesExist =false;
    //   }
      
    // }
    if(duplicatesExist){
      this.snackBar.open(
        "Selected Medication is already exist. Please select other medicine.",
        "close",
        {
          panelClass: "snackBarWarning",
          duration: 2000,
        }
      );
      this.employees().at(index).get("medicine").setValue(undefined);
      this.employees().at(index).get("dose").setValue(undefined);
      this.employees().at(index).get("food").setValue(undefined);
      this.employees().at(index).get("duration").setValue(undefined);
     

    }else{
      if (
        this.selectedMedicationToFill &&
        this.selectedMedicationToFill.length !== 0
      ) {
        this.employees()
          .at(index)
          .get("dose")
          .setValue(this.selectedMedicationToFill[0].dose);
        this.employees()
          .at(index)
          .get("food")
          .setValue(this.selectedMedicationToFill[0].food);
        this.employees()
          .at(index)
          .get("duration")
          .setValue(this.selectedMedicationToFill[0].duration);
        this.employees()
          .at(index)
          .get("note")
          .setValue(this.selectedMedicationToFill[0].notes);
      }
    }
   
  }
  searchLabs(event: any) {
    let value = event.target.value;
    this.filteredLabs = this.allLabs.filter((fruit: any) =>
      fruit.data_name.toLowerCase().includes(value)
    );
  }

  @ViewChild("radiologyInput") radiologyInput: ElementRef<HTMLInputElement>;
  radiologyCtrl = new FormControl();
  filteredRadiologies: any = [];
  radiologies: any[] = [];
  allRadiologies: any[] = [];

  removeRadiology(lab: string): void {
    // const index = this.radiologies.indexOf(lab);
    // if (index >= 0) {
    //   this.radiologies.splice(index, 1);
    // }
    this.radiologies = this.radiologies.filter((obj) => obj.testname !== lab);
    this.enableFormChanges();
  }

  selectedRadiology(event: MatAutocompleteSelectedEvent): void {
    this.radiologies.push({
      patientid: this.pid,
      appointmentid: this.appointmentId,
      createdby: this.userInfo.user_id,
      is_active: true,
      radiologyid: 0,
      testname: event.option.value,
    });
    this.enableFormChanges();
    this.radiologyInput.nativeElement.value = "";
    this.radiologyCtrl.setValue(null);
  }

  searchRadiologies(event: any) {
    let value = event.target.value;
    console.log(event);
    this.filteredRadiologies = this.allRadiologies.filter((fruit: any) =>
      fruit.data_name.toLowerCase().includes(value)
    );
  }

  @ViewChild("proceduresInput") proceduresInput: ElementRef<HTMLInputElement>;
  proceduresCtrl = new FormControl();
  filteredProcedures: any = [];
  procedures: any[] = [];
  allProcedures: any[] = [];

  removeProcedure(lab: string): void {
    // const index = this.procedures.indexOf(lab);
    // if (index >= 0) {
    //   this.procedures.splice(index, 1);
    // }
    this.procedures = this.procedures.filter(
      (obj) => obj.procedurename !== lab
    );
    this.enableFormChanges();
  }

  selectedProcedure(event: MatAutocompleteSelectedEvent): void {
    this.procedures.push({
      patientid: this.pid,
      appointmentid: this.appointmentId,
      createdby: this.userInfo.user_id,
      is_active: true,
      procedureid: 0,
      procedurename: event.option.value,
    });
    this.enableFormChanges();
    this.proceduresInput.nativeElement.value = "";
    this.proceduresCtrl.setValue(null);
  }

  searchpProcedures(event: any) {
    let value = event.target.value;
    this.filteredProcedures = this.allProcedures.filter((data: any) =>
      data.data_name.toLowerCase().includes(value)
    );
  }

  selectVaccination(type: string, ind: any) {
    // this.vaccineData[ind].vaccineValues = ['23323', '23233iii'];
    switch (type) {
      case "Hepatitis B":
        this.getVaccineValues(45, ind);
        this.vaccineData[ind].doseValues = ["20 mcg", "40 mcg"];
        break;
      case "Pneumococcal":
        this.getVaccineValues(46, ind);
        this.vaccineData[ind].doseValues = ["Done", "Not Done"];
        break;
      case "Influenza":
        this.getVaccineValues(47, ind);
        this.vaccineData[ind].doseValues = ["0", "1", "2", "3"];
        break;
      case "DT":
        this.getVaccineValues(47, ind);
        this.vaccineData[ind].doseValues = ["0", "1", "2", "3"];
        break;
      case "M.M.R":
        this.getVaccineValues(47, ind);
        this.vaccineData[ind].doseValues = ["0", "1", "2", "3"];
        break;
      case "Chickenpox":
        this.getVaccineValues(47, ind);
        this.vaccineData[ind].doseValues = ["0", "1", "2", "3"];
        break;
      default:
    }
  }

  getVaccineValues(id: any, index) {
    const url = `api/User/GetMasterData?mastercategoryid=` + id;
    this.httpService.getAll(url).subscribe((res: any) => {
      console.log("res", res.data);
      this.vaccineData[index].vaccineValues = res.data;
    });
  }

  selectApptDate(days: any) {
    this.selectedVisitName = days;
    console.log(this.planRadioGroup);
    let currentDate = new Date();
    if (days === "one-week") {
      currentDate.setDate(currentDate.getDate() + 7);
      this.appointmentDate.next(currentDate.toISOString());
    } else if (days === "fifteen-days") {
      currentDate.setDate(currentDate.getDate() + 15);
      this.appointmentDate.next(currentDate.toISOString());
    } else if (days === "one-month") {
      currentDate.setDate(currentDate.getDate() + 30);
      this.appointmentDate.next(currentDate.toISOString());
    } else if (days === "three-months") {
      currentDate.setDate(currentDate.getDate() + 90);
      this.appointmentDate.next(currentDate.toISOString());
    }
    this.enableFormChanges();

    //this.savePrescription(true)
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
  isMailActionLoading : boolean =false;
  sendEmail() {
    this.isMailActionLoading =true;
    console.log(this.patient.email_address);
    if (
      this.patient.email_address == null ||
      this.patient.email_address == undefined ||
      this.patient.email_address == "undefined" ||
      this.patient.email_address == ""
    ) {
      this.isPatientEmailPresent = false;
      this.isMailActionLoading = false;
      this.openDialogWithoutRef();
    } else {
      const url = `api/Investigations/SendPatientPrescriptionToEmail?patientid=${this.pid}&patient_emailid=${this.patient.email_address}&appointmentid=${this.appointmentId}`;
      this.httpService.create(url, {}).subscribe(
        (res: any) => {
          // console.log(res)
          if (res.data > 0) {
            this.isMailActionLoading = false
            this.isPatientEmailPresent = true;
            this.snackBar.open(
              "Prescription send to your email successfully. ",
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
  }
  openDialogWithoutRef() {
    this.dialog.open(this.secondDialog);
  }
  addEmail() {
    console.log(this.pat_email);
    // this.dialog.open(this.secondDialog);
    const url = `api/PatientRegistration/UpdatePatientEmailId?patientid=${this.pid}&emailid=${this.pat_email}`;
      this.httpService.create(url, {}).subscribe(
        (res: any) => {
           console.log(res)
          if (res.data !=null ) {
            this.snackBar.open(
              "Email Id added successfully. ",
              "close",
              {
                panelClass: "snackBarSuccess",
                duration: 2000,
              }
            );
          this.getPatientInfo(this.pid);
          this.isPatientEmailPresent = true;
          this.enableAfterEdit = false;
          this.formChange =false;
          this.isMailActionLoading = false;
          this.dialog.closeAll();
          this.patient.email_address = this.pat_email;
          this.sendEmail();
          }else if(res.Error && res.Error.ErrorCode){
            this.snackBar.open(`${res.Error.ErrorDescription}. Please try again later `,"close",
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
   
    // this.isPatientEmailPresent = true;
  }
  isPrescriptionLoading:boolean =false;
  prescriptionData(isPageLoading?: boolean, status?:any){
    const addedMedications = [];
    const medicationInfo = this.empForm.value;
    medicationInfo.employees.forEach((data: any) => {
      console.log(data.dose)
      if (data.medicine) {
        const obj = {
          medicationid: 0,
          appointmentid: this.appointmentId ? this.appointmentId : 0,
          patientid: this.pid,
          drugname: data.medicine ? data.medicine : undefined,
          dose_type: data.dose ? data.dose : undefined,
          // timing_type: data.time ? data.time : undefined,
          food_type: data.food ? data.food : undefined,
          // frequency_type: data.frequency ? data.frequency : undefined,
          duration_type: data.duration ? data.duration : undefined,
          notes_info: data.note ? data.note : undefined,
          createdby: this.userInfo.user_id,
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
    const addedVaccines = [];
    this.vaccineData.forEach((data: any) => {
      if (data.vaccination) {
        const vaccineObj = {
          patientid: this.pid,
          appointmentid: this.appointmentId ? this.appointmentId : 0,
          createdby: this.userInfo.user_id,
          is_active: data.is_active,
          vaccinationid: 0,
          vaccinename: data.vaccination ? data.vaccination : undefined,
          roaname: data.roa ? data.roa : undefined,
          vaccinevalue: data.values ? data.values : undefined,
          dosename: data.dose ? data.dose : undefined,
          vaccinationdate: data.date ? data.date : undefined,
          name_info: data.name ? data.name : undefined,
        };
        addedVaccines.push(vaccineObj);
      }
    });

    const addedMedicalHistories = [];
    this.meidicalHistoryList.forEach((data: any) => {
      if (data.history_name) {
        const medicalObj = {
          medicalhistoryid: data.medicalhistory_id ? data.medicalhistory_id : 0,
          patientid: this.pid,
          history: data.history_name ? data.history_name : undefined,
          status_name: data.status ? data.status : undefined,
          onsetdate: data.onset_date
            ? moment(data.onset_date).format("YYYY-MM-DD")
            : undefined,
          durationvalue: parseInt(data.duration_value)
            ? parseInt(data.duration_value)
            : undefined,

          durationid: data.duration_id ? data.duration_id : undefined,
          note: data.notes,

          is_active: data.hasOwnProperty("is_active")
            ? data.is_active
            : data.hasOwnProperty("isactive")
            ? data.isactive
            : true,
        };
        addedMedicalHistories.push(medicalObj);
      }
    });

    const addedDiagnosis = [];
    this.patientDiagnosisData.forEach((data: any) => {
      if (data.problem) {
        const diagnosisObj = {
          diagonsisid: data.diagonsis_id,
          appointmentid: this.appointmentId ? this.appointmentId : 0,
          patientid: this.pid,
          problem_name: data.problem,
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
          createdby: this.userInfo.user_id,
          is_active: data.hasOwnProperty("is_active")
            ? data.is_active
            : data.hasOwnProperty("isactive")
            ? data.isactive
            : true,
        };
        addedDiagnosis.push(diagnosisObj);
      }
    });

    let vitalobj = {};

    if (
      parseInt(this.vitalData[0].temperature) ||
      parseInt(this.vitalData[0].spo2) ||
      parseInt(this.vitalData[0].respiratoryRate) ||
      parseInt(this.vitalData[0].heartRate) ||
      parseInt(this.vitalData[0].systolicBp) ||
      parseInt(this.vitalData[0].dystolicBp) ||
      parseInt(this.vitalData[0].weight)
    ) {
      vitalobj = {
        patientid: this.pid,
        tempid: this.vitalData[0].tempid ? this.vitalData[0].tempid : 0,
        sp02id: this.vitalData[0].sp02id ? this.vitalData[0].sp02id : 0,
        weightid: this.vitalData[0].weightid ? this.vitalData[0].weightid : 0,
        respiratoryid: this.vitalData[0].respiratoryid
          ? this.vitalData[0].respiratoryid
          : 0,
        heartid: this.vitalData[0].heartid ? this.vitalData[0].heartid : 0,
        bpid: this.vitalData[0].bpid ? this.vitalData[0].bpid : 0,
        createdon: moment().format(),
        tempf: parseInt(this.vitalData[0].temperature)
          ? parseFloat(this.vitalData[0].temperature)
          : 0,
        spo_value: parseInt(this.vitalData[0].spo2)
          ? parseInt(this.vitalData[0].spo2)
          : 0,
        bmp_value: parseInt(this.vitalData[0].respiratoryRate)
          ? parseInt(this.vitalData[0].respiratoryRate)
          : 0,
        weight: this.vitalData[0].weight ? this.vitalData[0].weight : "0",
        heartrate: parseInt(this.vitalData[0].heartRate)
          ? parseInt(this.vitalData[0].heartRate)
          : 0,
        systolic: parseInt(this.vitalData[0].systolicBp)
          ? parseInt(this.vitalData[0].systolicBp)
          : 0,
        dystolic: parseInt(this.vitalData[0].dystolicBp)
          ? parseInt(this.vitalData[0].dystolicBp)
          : 0,
        createdby: this.userInfo.user_id,
        appointmentid: this.appointmentId,
      };
    }

    const addedConditions = [];
    if (this.medicalConditions && this.medicalConditions.length !== 0) {
      this.medicalConditions.forEach((data: any) => {
        addedConditions.push({
          medicalstatusid: data.medicalstatus_id,
          patientid: this.pid,
          medicalstatus: data.medical_status,
          createdby: this.userInfo.user_id,
        });
      });
    }

    const body = {
      patientid: this.pid,
      appointmentid: this.appointmentId,
      saveDiagnosis:
        this.patientDiagnosisData && this.patientDiagnosisData.length > 0
          ? this.patientDiagnosisData
          : [],
      saveMedicalHistory: addedMedicalHistories,
      vitalsInfo: vitalobj,
      medicalStatus:
        addedConditions && addedConditions.length !== 0 ? addedConditions : [],
      currentMedicationEntryList: addedMedications,
      labRadiologyTestsList: this.labs && this.labs.length > 0 ? this.labs : [],
      // radialogyTestList: this.radiologies && this.radiologies.length > 0 ? this.radiologies : [],
      proceduresList:
        this.procedures && this.procedures.length > 0 ? this.procedures : [],
      chiefcomplaints:
        this.observations && this.observations.length > 0
          ? this.observations
          : [],
      adviceList: this.advice
        ? [
            {
              patientid: this.pid,
              appointmentid: this.appointmentId ? this.appointmentId : 0,
              createdby: this.userInfo.user_id,
              is_active: true,
              adviceid: this.adviceId ? this.adviceId : 0,
              advicename: this.advice,
            },
          ]
        : [],
      dietList: this.diet
        ? [
            {
              patientid: this.pid,
              appointmentid: this.appointmentId ? this.appointmentId : 0,
              createdby: this.userInfo.user_id,
              is_active: true,
              dietid: this.dietId ? this.dietId : 0,
              dietname: this.diet,
            },
          ]
        : [],
      nextvisist:
      this.pick_date?moment(this.pick_date).format("YYYY-MM-DD"):undefined,
        // this.appointmentDate && this.appointmentDate.value
        //   ? this.appointmentDate.value
        //   : undefined,
      visit_after: this.selectedVisitName ? this.selectedVisitName : undefined,
      next_visit_after: this.next_visist_after ? parseInt(this.next_visist_after):undefined,
      frequency: this.frequency_value,
      vaccinationList: addedVaccines,
      // scheduleCalenderInfo: {
      //   calenderid: this.calendarId,
      //   patientid: this.pid,
      //   scheduledate: this.appointmentDate.value,
      //   doctorid: this.userInfo.user_id,
      //   statusid: 12,
      //   scheduletypeid: 16,
      //   scheduledby: this.userInfo.user_id,
      //   descriptionname: "",
      //   createdby: this.userInfo.user_id,
      //   appointmentid : this.appointmentId,
      //   nextvisit: this.selectedVisitName

      // },
    };
    console.log("body", body, this.vaccineData);
    setTimeout(() => {
      this.savePrescriptionCall(body, isPageLoading,status);
    }, 1000);
  }
  savePrescription(isPageLoading?: boolean) {
    this.isPrescriptionLoading =true;
   this.prescriptionData(isPageLoading)
   
  }
  finalizeConfirmPrescription(isPageLoading?: boolean, status?:string){
    this.isPrescriptionCinformLoading =true;
    status = 'complete'
    this.prescriptionData(isPageLoading,status)
  }

  savePrescriptionCall(body: any, isPageLoading?: boolean, status?:string) {
    if (this.vitalData[0].systolicBp && !this.vitalData[0].dystolicBp) {
      this.snackBar.open("Please enter both Systolic & Diastolic.", "close", {
        panelClass: "snackBarWarning",
        duration: 2000,
      });
      return;
    } else if (!this.vitalData[0].systolicBp && this.vitalData[0].dystolicBp) {
      this.snackBar.open("Please enter both Systolic & Diastolic.", "close", {
        panelClass: "snackBarWarning",
        duration: 2000,
      });
      return;
    }

    const url = `api/Doctor/SavePatientPrescription`;
    this.httpService.create(url, body).subscribe((res: any) => {
      console.log("res", res.data);
      this.isPrescriptionLoading = false;
      this.snackBar.open("Prescription added successfully. ", "close", {
        panelClass: "snackBarSuccess",
        duration: 2000,
      });
      this.formChange = false;
      this.enableAfterEdit = false;
      if (!isPageLoading) {
        this.getPatientPrescription(this.appointmentId);
      }

      // this method update prescription status and send whats apps to report
      if(status === 'complete'){
        this.finalizePrescription();
      }else{
        this.sendPrescription();
      }
      
    });
  }

  getPatientPrescription(appointment_id, init?: boolean) {
    this.labs = [];
    this.radiologies = [];
    this.procedures = [];
    let obj = this;
    // this.employees().setValue([])
    this.employees().clear();
    const url = `api/Doctor/GetPatientPrescription?patientid=${this.pid}&appointmentid=${appointment_id}`;
    this.httpService.create(url, {}).subscribe((res: any) => {
      console.log("get res", res.data);
      // this.investigation_id = res.data.investigation_id ? res.data.investigation_id: 0;
      if (res?.data?.vitalsInfo) {
        this.vitalData[0].temperature = res?.data?.vitalsInfo?.temp_f
          ? res?.data?.vitalsInfo?.temp_f
          : undefined;
        this.vitalData[0].dystolicBp = res?.data?.vitalsInfo?.dystolic_mmhg
          ? res?.data?.vitalsInfo?.dystolic_mmhg
          : undefined;
        this.vitalData[0].heartRate = res?.data?.vitalsInfo?.heart_rate
          ? res?.data?.vitalsInfo?.heart_rate
          : undefined;
        this.vitalData[0].spo2 = res?.data?.vitalsInfo?.spo_value
          ? res?.data?.vitalsInfo?.spo_value
          : undefined;
        this.vitalData[0].systolicBp = res?.data?.vitalsInfo?.systolic_mmhg
          ? res?.data?.vitalsInfo?.systolic_mmhg
          : undefined;
        this.vitalData[0].respiratoryRate = res?.data?.vitalsInfo?.bmp
          ? res?.data?.vitalsInfo?.bmp
          : undefined;
        this.vitalData[0].weight = res?.data?.vitalsInfo?.weight
          ? res?.data?.vitalsInfo?.weight
          : undefined;
        this.vitalData[0].weightid = res?.data?.vitalsInfo?.weightid
          ? res?.data?.vitalsInfo?.weightid
          : 0;
        this.vitalData[0].bpid = res?.data?.vitalsInfo?.bp_id
          ? res?.data?.vitalsInfo?.bp_id
          : 0;
        this.vitalData[0].heartid = res?.data?.vitalsInfo?.heart_id
          ? res?.data?.vitalsInfo?.heart_id
          : 0;
        this.vitalData[0].respiratoryid = res?.data?.vitalsInfo?.respiratory_id
          ? res?.data?.vitalsInfo?.respiratory_id
          : 0;
        this.vitalData[0].tempid = res?.data?.vitalsInfo?.temp_id
          ? res?.data?.vitalsInfo?.temp_id
          : 0;
        this.vitalData[0].sp02id = res?.data?.vitalsInfo?.spo2_id
          ? res?.data?.vitalsInfo?.spo2_id
          : 0;
      }
      if (res?.data?.currentMedicationEntryList?.length > 0) {
        res?.data?.currentMedicationEntryList.forEach((data: any) => {
          this.addEmployee();
        });
        this.updateMedicationFormData(res?.data?.currentMedicationEntryList);
      } else if (res?.data?.currentMedicationEntryList?.length == 0 || init) {
        this.addEmployee();
      }
      if (res?.data?.labRadialogyTestList?.length > 0) {

        let tempArr=[];
        for(let i = 0; i <res?.data?.labRadialogyTestList.length; i++){
          tempArr.push(res?.data?.labRadialogyTestList[i].labRadialogyTest)
        }
        console.log(tempArr)

        this.labs = tempArr?.map(function (
          labTest: any
        ) {
          return {
            patientid: obj.pid,
            appointmentid: labTest.appointment_id, 
            createdby: obj.userInfo.user_id,
            is_active: true,
            labid: 0,
            testname: labTest.test_name,
            isgroup: labTest.isgroup,
            groupid: labTest.group_id,
          };
        });
      }
      // if (res?.data?.labRadialogyTestList?.length > 0) {
      //   this.labs = res?.data?.labRadialogyTestList?.map(function ( 
      //     labTest: any
      //   ) {
      //     return {
      //       patientid: obj.pid,
      //       appointmentid: labTest.appointment_id,
      //       createdby: obj.userInfo.user_id,
      //       is_active: true,
      //       labid: 0,
      //       testname: labTest.test_name,
      //     };
      //   });
      // }
      // if (res?.data?.radialogyTestList?.length > 0) {

      //   this.radiologies = res?.data?.radialogyTestList?.map(function(test:any){
      //     return {
      //       "patientid": obj.pid,
      //       "appointmentid": test.appointment_id,
      //       "createdby": obj.userInfo.user_id,
      //       "is_active": true,
      //       "radiologyid": 0,
      //       "testname": test.test_name
      //     }
      //   })
      // }
      if (res?.data?.proceduresList?.length > 0) {
        this.procedures = res?.data?.proceduresList?.map(function (test: any) {
          return {
            patientid: obj.pid,
            appointmentid: test.appointment_id,
            createdby: obj.userInfo.user_id,
            is_active: true,
            procedureid: 0,
            procedurename: test.procedure_name,
          };
        });
      }
      if (res?.data?.chiefComplaint?.length > 0) {
        this.observations = res?.data?.chiefComplaint?.map(function (
          test: any
        ) {
          return {
            patientid: obj.pid,
            appointmentid: test.appointment_id,
            createdby: obj.userInfo.user_id,
            is_active: true,
            complaint_id: 0,
            complaint_name: test.complaint,
          };
        });
      }
      if (res?.data?.diagnosis?.length > 0) {
        this.patientDiagnosisData = res?.data?.diagnosis?.map(function (
          test: any
        ) {
          return {
            diagonsisid: test.diagonsis_id,
            patientid: test.patient_id,
            appointmentid: test.appointment_id,
            createdby: test.created_by,
            is_active: true,
            problem_name: test.problem,
          };
        });
      }
      if (res?.data?.medicalHistory?.length > 0) {
        this.meidicalHistoryList = res?.data?.medicalHistory;
      }
      if (res.data.medical_status) {
        this.medicalConditions = res.data.medical_status;
      }
      if (res?.data?.vaccinationList?.length > 0) {
        let vaccination = [];
        setTimeout(() => {
          res?.data?.vaccinationList.forEach((data2: any) => {
            switch (data2.vaccine_name) {
              case "Hepatitis B":
                const apilUrl1 =
                  `api/User/GetMasterData?mastercategoryid=` + 45;
                this.httpService.getAll(apilUrl1).subscribe((result1: any) => {
                  vaccination.push({
                    vaccineValues: result1.data,
                    doseValues: ["20 mcg", "40 mcg"],
                    vaccination: data2.vaccine_name,
                    roa: data2.roa,
                    values: data2.vaccine_value,
                    dose: data2.dose,
                    id: data2.vaccination_id,
                    date: data2.vaccination_date,
                    name: data2.name,
                  });
                });
                break;
              case "Pneumococcal":
                const apilUrl2 =
                  `api/User/GetMasterData?mastercategoryid=` + 46;
                this.httpService.getAll(apilUrl2).subscribe((result2: any) => {
                  vaccination.push({
                    vaccineValues: result2.data,
                    doseValues: ["Done", "Not Done"],
                    vaccination: data2.vaccine_name,
                    roa: data2.roa,
                    values: data2.vaccine_value,
                    dose: data2.dose,
                    id: data2.vaccination_id,
                    date: data2.vaccination_date,
                    name: data2.name,
                  });
                });
                break;
              case "Influenza":
                const apilUrl3 =
                  `api/User/GetMasterData?mastercategoryid=` + 46;
                this.httpService.getAll(apilUrl3).subscribe((result3: any) => {
                  vaccination.push({
                    vaccineValues: result3.data,
                    doseValues: ["0", "1", "2", "3"],
                    vaccination: data2.vaccine_name,
                    roa: data2.roa,
                    values: data2.vaccine_value,
                    dose: data2.dose,
                    id: data2.vaccination_id,
                    date: data2.vaccination_date,
                    name: data2.name,
                  });
                });
                break;
              case "DT":
                const apilUrl4 =
                  `api/User/GetMasterData?mastercategoryid=` + 47;
                this.httpService.getAll(apilUrl4).subscribe((result4: any) => {
                  vaccination.push({
                    vaccineValues: result4.data,
                    doseValues: ["0", "1", "2", "3"],
                    vaccination: data2.vaccine_name,
                    roa: data2.roa,
                    values: data2.vaccine_value,
                    dose: data2.dose,
                    id: data2.vaccination_id,
                    date: data2.vaccination_date,
                    name: data2.name,
                  });
                });
                break;
              case "M.M.R":
                const apilUrl5 =
                  `api/User/GetMasterData?mastercategoryid=` + 47;
                this.httpService.getAll(apilUrl5).subscribe((result5: any) => {
                  vaccination.push({
                    vaccineValues: result5.data,
                    doseValues: ["0", "1", "2", "3"],
                    vaccination: data2.vaccine_name,
                    roa: data2.roa,
                    values: data2.vaccine_value,
                    dose: data2.dose,
                    id: data2.vaccination_id,
                    date: data2.vaccination_date,
                    name: data2.name,
                  });
                });
                break;
              case "Chickenpox":
                const apilUrl6 =
                  `api/User/GetMasterData?mastercategoryid=` + 47;
                this.httpService.getAll(apilUrl6).subscribe((result6: any) => {
                  vaccination.push({
                    vaccineValues: result6.data,
                    doseValues: ["0", "1", "2", "3"],
                    vaccination: data2.vaccine_name,
                    roa: data2.roa,
                    values: data2.vaccine_value,
                    dose: data2.dose,
                    id: data2.vaccination_id,
                    date: data2.vaccination_date,
                    name: data2.name,
                  });
                });
                break;
              default:
            }
          });
          this.vaccineData = vaccination;
        }, 500);
      } else {
        this.vaccineData = [
          {
            vaccination: "",
            date: "",
            name: "",
            roa: "",
            values: "",
            dose: "",
            vaccineValues: [],
            doseValues: [],
            id: null,
            is_active: true,
          },
        ];
      }
      this.advice =
        res?.data?.adviceList?.length > 0
          ? res?.data?.adviceList[0].advice
          : "";
      this.adviceId =
        res?.data?.adviceList?.length > 0
          ? res?.data?.adviceList[0].advice_id
          : 0;
      this.diet =
        res?.data?.dietList?.length > 0 ? res?.data?.dietList[0].diet : "";
      this.dietId =
        res?.data?.dietList?.length > 0 ? res?.data?.dietList[0]?.diet_id : 0;
      // console.log((new Date(res?.data?.scheduleCalenderInfo?.schedule_date)).getFullYear())

      // if(res?.data?.scheduleCalenderInfo?.patient_id && res?.data?.scheduleCalenderInfo?.schedule_date && new Date(res?.data?.scheduleCalenderInfo?.schedule_date).getFullYear() != 1) {
      //   this.appointmentDate.next(
      //     res?.data?.scheduleCalenderInfo?.schedule_date
      //   );
      // }

      if (res.data.next_visit && res.data.next_visit != "01-Jan-0001") {
        this.next_visist_after = res.data.next_visit_after;
        this.frequency_value = res.data.frequency;
        this.pick_date = res.data.next_visit_after == 0 ? undefined: moment(res.data.next_visit).format("YYYY-MM-DDT00:00:00");
        this.appointmentDate.next(
          moment(res.data.next_visit).format("YYYY-MM-DD[T]HH:mm:ss[Z]")
        );
      }
      this.selectedVisitName = res.data.visit_after ? res.data.visit_after : "";
      this.calendarId = res?.data?.scheduleCalenderInfo?.calender_id
        ? res?.data?.scheduleCalenderInfo?.calender_id
        : 0;
      this.planRadioGroup.value = this.selectedVisitName
        ? this.selectedVisitName
        : undefined;
    });
  }

  updateMedicationFormData(data: any) {
    let medicationData = [];
    data.map((info: any) => {
      const obj = {
        medicine: info.drug_name,
        dose: info.dose,
        // time: info.timing,
        food: info.food,
        // frequency: info.frequency,
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

  back() {
    window.history.back();
  }

  displayPrescription() {
    this.isDownloadPrescriptionLoading = true;
    const url = `${environment.apiURL}api/Doctor/DownloadPatientPrescriptions?patientid=${this.pid}&appointmentid=${this.appointmentId}`;
    const headers = new HttpHeaders().set(
      "Content-Type",
      "text/plain; charset=utf-8"
    );
    this.http
      .post(url, {}, { headers, responseType: "text" })
      .subscribe((data: any) => {
        this.isDownloadPrescriptionLoading = false;
        this.htmlContent = data;

        const iframe = document.createElement("iframe");
        document.body.appendChild(iframe); // 👈 still required
        iframe.contentWindow.document.open();
        iframe.style.width = "1px";
        iframe.style.height = "1px";
        iframe.style.opacity = "0.01";
        iframe.contentWindow.document.write(data);

        const url2 = `api/User/GetUsersById?userId=` + this.pid;

        this.httpService.getAll(url2).subscribe(
          (res: any) => {
            if (res.data) {
              this.isDataChange = false;

              var tempTitle = document.title;
              document.title = `${res.data.first_name?.trim()}-${moment(
                this.prescriptionStatusData.appointment_date
              ).format("DD-MMM-YYYY")}.pdf`;

              try {
                iframe.contentWindow.document.execCommand("print", false, null);
              } catch (e) {
                iframe.contentWindow.print();
              }

              iframe.contentWindow.document.close();

              document.title = tempTitle;

              //   setTimeout(() => {
              //     window.close();
              // }, 1000);

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
            this.downloadAction = false;
            this.isDownloadPrescriptionLoading = false;
          }
        );

        // if (localStorage.getItem("displayPrescription") === "patients") {
        //   this.displayPrescriptionContent = true;
        // }
      });
  }

  async downloadPrescription() {
    this.downloadAction = true;

    const url = `api/User/GetUsersById?userId=` + this.pid;

    this.httpService.getAll(url).subscribe(
      (res: any) => {
        if (res.data) {
          html2canvas(document.getElementById("contentToConvert")).then(
            (canvas) => {
              // Few necessary setting options

              const contentDataURL = canvas.toDataURL("image/png");
              let pdf = new jsPDF("p", "mm", "a4"); // A4 size page of PDF
              var width = pdf.internal.pageSize.getWidth();
              var height = (canvas.height * width) / canvas.width;
              pdf.addImage(contentDataURL, "PNG", 0, 0, width, height);
              pdf.save(
                `${res.data.first_name?.trim()}-${moment(
                  this.prescriptionStatusData.appointment_date
                ).format("DD-MMM-YYYY")}.pdf`
              ); // Generated PDF
              this.downloadAction = false;
            }
          );
        }
      },
      (error: any) => {
        console.log("error", error);
        this.downloadAction = false;
      }
    );
  }

  sendPatientToReports(appointment_id: any) {
    const headers = new HttpHeaders().set(
      "Content-Type",
      "application/octet-stream"
    );

    const url = `${environment.apiURL}api/Doctor/DownloadPatientPrescriptions_aspdf_base64?patientid=${this.pid}&appointmentid=${appointment_id}`;

    this.http.post(url, {}, { responseType: "text" }).subscribe(
      (res: any) => {
        this.isDownloadPrescriptionLoading = false
        this.manageInvestigations(res);
       // this.displayPrescription(this.appointmentId);
      },
      (error: any) => {
        console.log("error", error);

       // this.displayPrescription(this.appointmentId);
        this.downloadAction = false;
      }
    );
  }

  manageInvestigations(data: any) {
    const url = `api/Investigations/ManageInvestigations?appointmentid=${this.appointmentId}&from_prescription=true`;

    const bodyInvestigation = {
      investigationid: 0,
      patientid: parseInt(this.pid),
      recorddate: moment().format("YYYY-MM-DD"),
      testname: undefined,
      docnotes: undefined,
      createdby: this.userInfo.user_id,
      reportfor: parseInt(this.pid),
      reporttypeid: 55,
      isprescription: false,
      reportcategoryid: 55,
      investigationReportList: [
        {
          patientreportid: 0,
          filename: `${moment().format("DDMMYYYYHHmmss")}.pdf`,
          mimetype: "pdf",
          fileBase64: data,
        },
      ],
    };

    this.httpService.create(url, bodyInvestigation).subscribe(
      (res: any) => {
        if (res.data) {
        }
      },
      (error: any) => {
        console.log("error", error);
        this.downloadAction = false;
      }
    );
  }
  isDownloadPrescriptionLoading :boolean = false;
  sendPrescription() {
    // this.isDownloadPrescriptionLoading = true;
    const url = `api/Doctor/UpdateAppointmentStatus?appointmentid=${this.appointmentId}&statusid=9&actionby=${this.userInfo.user_id}&patientid=${this.pid}`;
    this.httpService.create(url, {}).subscribe(
      (res: any) => {
        // this.displayPrescription(this.appointmentId);

        this.sendPatientToReports(this.appointmentId);
      },
      (error: any) => {
        console.warn("error", error);
      }
    );
  }
  finalizePrescription() {
    // this.isDownloadPrescriptionLoading = true;
    const url = `api/Doctor/UpdateAppointmentStatus?appointmentid=${this.appointmentId}&statusid=10&actionby=${this.userInfo.user_id}&patientid=${this.pid}`;
    this.httpService.create(url, {}).subscribe(
      (res: any) => {
        // this.displayPrescription(this.appointmentId);

        this.sendPatientToReports(this.appointmentId);
      },
      (error: any) => {
        console.warn("error", error);
      }
    );
  }
  viewPrescription() {
    this.dialog
      .open(ViewPrescriptionComponent, {
        width: "75rem",
        height: "100%",
        panelClass: "no-padding-popup",
        position: { right: "0" },
        // data: { prescription: true },
      })
      .afterClosed()
      .subscribe((data) => {
        console.log(data);
        if (data) {
          // let dataObj = {...JSON.parse(data), showDeleteIcon:true}
          // this.patientDiagnosisData.push(dataObj);
          // this.enableFormChanges();
          // this.savePrescription();
        }
      });
  }

  cancel() {
    if (this.formChange) {
      const confirmation = this._fuseConfirmationService.open({
        title: "Are you sure ?",
        icon: {
          show: false,
        },
        message: "You wanna clear changes ? This action cannot be undone!",
        actions: {
          confirm: {
            label: "Yes",
          },
          cancel: {
            show: true,
            label: "No",
          },
        },
      });
      confirmation.afterClosed().subscribe((result) => {
        console.log(result);
        if (result == "confirmed") {
          this.getPatientPrescription(this.appointmentId);
        }
        //   this.animal = result;
      });
    }
  }
  onKey(event: any) {
    this.addEmployee();
  }
  updateDOB(ev) {
    console.log(typeof ev);
    if(ev == '0' || ev == null || ev == undefined ||ev == '' || (ev && ev.trim()=='')){
      this.next_visist_after = "";
      this.pick_date ="";
    }else{
      const age = ev;
      const until = moment().add(ev, "days");
      this.pick_date = moment(until).format("YYYY-MM-DDT00:00:00");
      this.appointmentDate.next(until.toISOString());
    }
    
    // const currentDate = new Date();
    // const birthdate = new Date(currentDate.getFullYear() - age,currentDate.getMonth(),currentDate.getDate());
    // this.pick_date = moment(birthdate).format();
    // console.log(this.pick_date);
    // this.appointmentDate.next( moment(this.pick_date).format("YYYY-MM-DDT00:00:00"));
  }

  // let actualDate = moment(val);
  // let currentDate = moment().format("YYYY-MM-DDT00:00:00");
  // if(val){
  //   if(moment(actualDate).format("YYYY-MM-DDT00:00:00") == moment(currentDate).format("YYYY-MM-DDT00:00:00")){
  //     this.snackBar.open(
  //       "Pick a date must not be TODAY'S date",
  //       "close",
  //       {
  //         panelClass: "snackBarSuccess",
  //         duration: 2000,
  //       }
  //     );
  //     this.pick_date = null;
  //   }else{
  //     let days = actualDate.diff(currentDate, "days");
  //     let weeks = actualDate.diff(currentDate, "weeks");
  //     let months = actualDate.diff(currentDate, "months");
  //     this.frequency_value = "Days";
  //     this.next_visist_after = days;
  //     this.appointmentDate.next(moment(actualDate).format());
  //   }

  dateChanged(value: string, event: any) {
    this.calculate(event.value);
  }
  calculate(val) {
    console.log(val);
    let actualDate = moment(val);
    let currentDate = moment().format("YYYY-MM-DDT00:00:00");
    if(moment(actualDate).format("YYYY-MM-DDT00:00:00") === moment(currentDate).format("YYYY-MM-DDT00:00:00") || !val){
      this.next_visist_after = "";
      this.pick_date ="";
      
    }else{
      let days = actualDate.diff(currentDate, "days");
      let weeks = actualDate.diff(currentDate, "weeks");
      let months = actualDate.diff(currentDate, "months");
      this.frequency_value = "Days";
      this.next_visist_after = days;
      this.appointmentDate.next(moment(actualDate).format());
    }

    

    // if(days < 8){
    //   this.frequency_value = "Days";
    //   this.next_visist_after = days;
    // }else if(days >= 8 && weeks <4){
    //   this.frequency_value = "Weeks";
    //   this.next_visist_after = weeks;
    // }
    // else if(weeks > 4){
    //   this.frequency_value = "Months";
    //   this.next_visist_after = months;
    // }
   
  }
  changeDate(val, count_of_frequency) {
    let until;
    if (val == "Days") {
      until = moment().add(count_of_frequency, "days");
    } else if (val == "Weeks") {
      until = moment().add(count_of_frequency, "weeks");
    } else if (val == "Months") {
      until = moment().add(count_of_frequency, "months");
    }
    this.pick_date = until;
    this.appointmentDate.next(until.toISOString());
  }
  goBack() { 
    console.log(this.patientDiagnosisData.length > 0)
    if(this.patientDiagnosisData.length > 0 || this.observations.length > 0 ||  this.vitalData[0].temperature || this.vitalData[0].spo2 ||
      this.vitalData[0].respiratoryRate || this.vitalData[0].heartRate || this.vitalData[0].systolicBp || this.vitalData[0].dystolicBp ||
      this.vitalData[0].weight || (this.empForm.dirty && this.empForm.valid) || this.labs.length > 0 || this.advice !== '' || this.diet !== ''  ){
      this.confirmationToLeavePage()
    }else{
      window.history.back();
    }
  }
  confirmationToLeavePage(){
    const confirmation = this._fuseConfirmationService.open({
      title: "Are you sure you want to go back ?",
      message:
        "Entered values cannot be saved. This action cannot be undone!",
      actions: {
        confirm: {
          label: "Yes",
        },
        cancel: {
          label: "No",
        },
      },
    });
    confirmation.afterClosed().subscribe((result) => {
      if (result === "confirmed") {
        window.history.back();
      }
    });
  }

  sendWhatsapp() {
    this.isWhatsappActionLoading = true;
    this.isWhatsppSent = false;
    const url = `api/investigations/SendPatientPrescriptionToWhatsapp?appointmentid=${this.appointmentId}&patientid=${this.pid}`;
    this.httpService.create(url, {}).subscribe(
      (res: any) => {
        // this.displayPrescription(this.appointmentId);
        this.isWhatsppSent = true;
        this.isWhatsappActionLoading = false;
      },
      (error: any) => {
        this.isWhatsappActionLoading = false;
        console.warn("error", error);
      }
    );
  }
  selectionMade(event: Event, trigger: MatAutocompleteTrigger) {
    event.stopPropagation();
    trigger.openPanel();
}
}

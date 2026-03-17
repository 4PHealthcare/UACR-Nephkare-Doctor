import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import { FuseCardModule } from "@fuse/components/card";
import { SharedModule } from "app/shared/shared.module";
import { ProfileComponent } from "app/modules/admin/pages/profile/profile.component";
import { profileRoutes } from "app/modules/admin/pages/profile/profile.routing";
import { MatCardModule } from "@angular/material/card";
import { NgApexchartsModule } from "ng-apexcharts";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatDialogModule } from "@angular/material/dialog";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatMomentDateModule } from "@angular/material-moment-adapter";
import { NgSelectModule } from "@ng-select/ng-select";
import { MatSelectModule } from "@angular/material/select";
import { MatTabsModule } from "@angular/material/tabs";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatRadioModule } from "@angular/material/radio";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatGridListModule } from "@angular/material/grid-list";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { PdfViewerModule } from "ng2-pdf-viewer";
import { CdkTableModule } from "@angular/cdk/table";
import { MatTableModule } from "@angular/material/table";
import { NgxPrintModule } from "ngx-print";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatStepperModule } from '@angular/material/stepper';
import {  NgxMatDatetimePickerModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { MatChipsModule } from '@angular/material/chips';
import {  NGX_MAT_DATE_FORMATS } from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';


import { QuillModule } from 'ngx-quill';

import { HistoriesComponent } from "../../apps/history-popups/histories.component";
import { AllergiesComponent } from "../../apps/allergy-popups/allergies.component";
import { MedicalHistoryComponent } from "../../apps/history-popups/medical-history/medical-history.component";
import { SurgicalHistoryComponent } from "../../apps/history-popups/surgical-history/surgical-history.component";
import { SocialHistoryComponent } from "../../apps/history-popups/social-history/social-history.component";
import { FamilyHistoryComponent } from "../../apps/history-popups/family-history/family-history.component";
import { MenustrualHistoryComponent } from "../../apps/history-popups/menustrual-history/menustrual-history.component";
import { FoodAllergyComponent } from "../../apps/allergy-popups/food-allergy/food-allergy.component";
import { DrugAllergyComponent } from "../../apps/allergy-popups/drug-allergy/drug-allergy.component";
import { EnvironmentalAllergyComponent } from "../../apps/allergy-popups/environmental-allergy/environmental-allergy.component";
import { OpentokService } from "../../apps/video-call/opentok.service";
import { ImmunisationModalComponent } from "../../apps/patient-prescription/immunisation-modal/immunisation-modal.component";
import { SecondOpinionDetailsComponent } from "./second-opinion-details/second-opinion-details.component";
import { ReportAnalysisComponent } from "./report-analysis/report-analysis.component";
import { AddClinicalDataModalComponent } from './add-clinical-data-modal/add-clinical-data-modal.component';
import { CircularProgressChartComponent } from './circular-progress-chart/circular-progress-chart.component';
import { SetUpComponent } from './set-up/set-up.component';
import { PreConsultationComponent } from './pre-consultation/pre-consultation.component';
import { PrimaryConsultationComponent } from './primary-consultation/primary-consultation.component';
import { AssessmentComponent } from './assessment/assessment.component';
import { TreatmentComponent } from './treatment/treatment.component';
import { SubscribedPatientComponent } from './subscribed-patient/subscribed-patient.component';
import { AddVitalNotesComponent } from './add-vital-notes/add-vital-notes.component';
import { SymptomsComponent } from './symptoms/symptoms.component';
// import { ExpertOpinionReportComponent } from './expert-opinion-report/expert-opinion-report.component';
import { WeightLogsComponent } from './activity-analysis/weight-logs/weight-logs.component';
import { MedicineLogsComponent } from './activity-analysis/medicine-logs/medicine-logs.component';
import { WaterLogsComponent } from './activity-analysis/water-logs/water-logs.component';
import { StepsLogsComponent } from './activity-analysis/steps-logs/steps-logs.component';
import { SleepLogsComponent } from './activity-analysis/sleep-logs/sleep-logs.component';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
// import { FollowUpComponent } from './follow-up/follow-up.component'; 
import { OpinionPatinetDetailsComponent } from './opinion-patinet-details/opinion-patinet-details.component';
import { AssessmentResultsComponent } from './assessment-results/assessment-results.component';
import { DailyNutritionDetailsComponent } from './activity-analysis/daily-nutrition-details/daily-nutrition-details.component';
import { PatientSetUpComponent } from './patient-set-up/patient-set-up.component';
import { AddSerumCreatinineComponent } from './report-analysis/add-serum-creatinine/add-serum-creatinine.component';

export const DATETIME_FORMATS = {
  parse: {
    dateInput: 'l, L, LTS',
  },
  display: {
    dateInput: 'DD-MMM-YYYY hh:mm a',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM-YYYY',
  },
};



@NgModule({
  declarations: [
    ProfileComponent,
    HistoriesComponent,
    AllergiesComponent,
    MedicalHistoryComponent,
    SurgicalHistoryComponent,
    SocialHistoryComponent,
    FamilyHistoryComponent,
    MenustrualHistoryComponent,
    FoodAllergyComponent,
    DrugAllergyComponent,
    EnvironmentalAllergyComponent,
    ImmunisationModalComponent,
    SecondOpinionDetailsComponent,
    ReportAnalysisComponent,
    AddClinicalDataModalComponent,
    CircularProgressChartComponent,
    SetUpComponent,
    PreConsultationComponent,
    PrimaryConsultationComponent,
    AssessmentComponent,
    TreatmentComponent,
    PatientSetUpComponent,
    SubscribedPatientComponent,
    AddVitalNotesComponent,
    SymptomsComponent,
    // ExpertOpinionReportComponent,
    WeightLogsComponent,
    MedicineLogsComponent,
    WaterLogsComponent,
    StepsLogsComponent,
    SleepLogsComponent,
    // FollowUpComponent,
    AssessmentResultsComponent,
    OpinionPatinetDetailsComponent,
    DailyNutritionDetailsComponent,
    PatientSetUpComponent,
    AddSerumCreatinineComponent
  ],
  imports: [
    RouterModule.forChild(profileRoutes),
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatTooltipModule,
    FuseCardModule,
    SharedModule,
    MatCardModule,
    NgxMatDatetimePickerModule,
    NgApexchartsModule,
    MatButtonToggleModule,
    MatExpansionModule,
    MatDialogModule,
    NgxMatMomentModule,
    MatDatepickerModule,
    MatMomentDateModule,
   
    NgSelectModule,
    MatSelectModule,
    CdkTableModule,
    MatTabsModule,
    QuillModule,
    MatCheckboxModule,
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,
    MatGridListModule,
    InfiniteScrollModule,
    MatAutocompleteModule,
    PdfViewerModule,
    NgxMatTimepickerModule,
    MatTableModule,
    NgxPrintModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatChipsModule
  ],
  providers: [
    OpentokService,
    { provide: NGX_MAT_DATE_FORMATS, useValue: DATETIME_FORMATS }
  ],
})
export class ProfileModule {}

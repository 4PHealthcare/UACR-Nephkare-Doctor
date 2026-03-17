import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientPrescriptionComponent } from './patient-prescription.component';
import {PatientPrescriptionRoutingModule} from './patient-prescription-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatTableModule} from '@angular/material/table';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FuseAlertModule } from '@fuse/components/alert';
import { FuseDrawerModule } from '@fuse/components/drawer';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { PresentIllnessComponent } from './present-illness/present-illness.component';
import { ExaminationsComponent } from './examinations/examinations.component';
import { RosComponent } from './ros/ros.component';
import { MedicationModalComponent } from './medication-modal/medication-modal.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MedicalHistoryComponent } from './medical-history/medical-history.component';
import { NoSanitizePipe } from './noSanitizePipe';
import { SharedModule } from '../../../../shared/shared.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MedicalConditionComponent } from './medical-condition/medical-condition.component';
import { ViewLastPrescriptionMedicationComponent } from './view-last-prescription-medication/view-last-prescription-medication.component';


@NgModule({
  declarations: [
    PatientPrescriptionComponent,
    PresentIllnessComponent,
    ExaminationsComponent,
    RosComponent,
    MedicationModalComponent,
    MedicalHistoryComponent,
    MedicalConditionComponent,
    NoSanitizePipe,
    ViewLastPrescriptionMedicationComponent,
    // ViewPrescriptionComponent
  ],
  imports: [
    CommonModule,
    PatientPrescriptionRoutingModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatRadioModule,
    MatCheckboxModule,
    FuseAlertModule,
    FuseDrawerModule,
    MatSelectModule,
    MatDatepickerModule,
    MatMomentDateModule,
    NgSelectModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ]
})
export class PatientPrescriptionModule { }

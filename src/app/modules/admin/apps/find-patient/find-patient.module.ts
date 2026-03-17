import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FindPatientComponent } from './find-patient/find-patient.component';
import { findPatientRoutes } from './find-patient/find-patient.routing';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FuseCardModule } from '@fuse/components/card';
import { FuseAlertModule } from '@fuse/components/alert';
import { MatSelectModule } from '@angular/material/select';
import { BookAppointmentComponent } from './book-appointment/book-appointment.component';
import { MatRadioModule } from '@angular/material/radio';


@NgModule({
  declarations: [
    FindPatientComponent,
    BookAppointmentComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(findPatientRoutes),
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    FuseAlertModule,
    FuseCardModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    MatSelectModule,
    MatRadioModule
  ]
})
export class FindPatientModule { }

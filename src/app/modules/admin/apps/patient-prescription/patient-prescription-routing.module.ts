import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientPrescriptionComponent } from './patient-prescription.component';

const routes: Routes = [
  {
    path     : '',
    component: PatientPrescriptionComponent 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientPrescriptionRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExpertOpinionReportComponent } from './expert-opinion-report.component';


const routes: Routes = [
  {
    path     : '',
    component: ExpertOpinionReportComponent 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExpertOpinionReportRoutingModule { }
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { PatientQueriesComponent } from './patient-queries.component';
import { PatientQueriesRoutes } from './patient-queries.routing';

@NgModule({
    declarations: [
        PatientQueriesComponent
    ],
    imports     : [
        RouterModule.forChild(PatientQueriesRoutes),
       
    ]
})
export class PatientQueriesModule
{
}

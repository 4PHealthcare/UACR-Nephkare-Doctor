import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgSelectModule } from '@ng-select/ng-select';
import {MatRadioModule} from '@angular/material/radio';
import {MatGridListModule} from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { SharedModule } from 'app/shared/shared.module';
import { UsersComponent } from 'app/modules/admin/apps/users/users.component';
import { usersRoutes } from 'app/modules/admin/apps/users/users.routing';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { AddPatientComponent } from './add-patient/add-patient.component';
import { ViewRelativesComponent } from './view-relatives/view-relatives.component';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';

@NgModule({
    declarations: [
        UsersComponent,
        AddPatientComponent,
        ViewRelativesComponent
    ],
    imports     : [
        RouterModule.forChild(usersRoutes),
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatRippleModule,
        MatSortModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatTooltipModule,
        SharedModule,
        MatDatepickerModule,
        MatMomentDateModule,
        NgSelectModule,
        MatRadioModule,
        MatGridListModule,
        MatProgressSpinnerModule,
        GooglePlaceModule
    ]
})
export class UsersModule
{
}

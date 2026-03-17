import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from 'app/shared/shared.module';
import { HospitalFollowupComponent } from './hospital-followup.component';
import { HospitalFollowupRoutes } from './hospital-followup.routing';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';


import { NgSelectModule } from '@ng-select/ng-select';





@NgModule({
    declarations: [
        HospitalFollowupComponent,
    
    ],
    imports     : [
        RouterModule.forChild(HospitalFollowupRoutes),
        ScrollingModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatMomentDateModule,
        MatRadioModule,
        MatSelectModule,
        MatSidenavModule,
        MatTooltipModule,
        SharedModule,
        MatTabsModule,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
        NgxMaterialTimepickerModule,
        NgSelectModule

    ],
    providers   : [
        {
            provide : MAT_DATE_FORMATS,
            useValue: {
                parse  : {
                    dateInput: 'DD.MM.YYYY'
                },
                display: {
                    dateInput: 'DD-MMM-YYYY',
                    monthYearLabel    : 'MMM YYYY',
                    dateA11yLabel     : 'DD.MM.YYYY',
                    monthYearA11yLabel: 'MMMM YYYY'
                }
            }
        }
    ]
})
export class HospitalFollowupModule
{
}

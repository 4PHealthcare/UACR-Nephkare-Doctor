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
import {NgxPrintModule} from 'ngx-print';
import { TestQueueComponent } from './test-queue.component';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule, NgxMatNativeDateModule } from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
// import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import {MatListModule} from '@angular/material/list';


import { NgSelectModule } from '@ng-select/ng-select';

import { TestQueueRoutes } from './test-queue.routing';
import { TestListComponent } from './test-list/test-list.modal.component';

import { NgxMatDateFormats, NGX_MAT_DATE_FORMATS } from '@angular-material-components/datetime-picker';

const CUSTOM_DATE_FORMATS: NgxMatDateFormats = {
    parse: {
      dateInput: "l, LTS"
    },
    display: {
      dateInput: "DD-MMM-YYYY hh:mm a",
      monthYearLabel: "MMM YYYY",
      dateA11yLabel: "LL",
      monthYearA11yLabel: "MMMM YYYY"
    }
  };
  



@NgModule({
    declarations: [
        TestQueueComponent,
        TestListComponent
    ],
    imports     : [
        RouterModule.forChild(TestQueueRoutes),
        ScrollingModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatDialogModule,
        MatListModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatMomentDateModule,
        MatRadioModule,
        NgxPrintModule,
        MatSelectModule,
        MatSidenavModule,
        MatTooltipModule,
        NgxMatMomentModule,
        SharedModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
        NgxMatDatetimePickerModule,
        NgxMatTimepickerModule,
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
        },
        {provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS}
    ]
})
export class TestQueueModule
{
}

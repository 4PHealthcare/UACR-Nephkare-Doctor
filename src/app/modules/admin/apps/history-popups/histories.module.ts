import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseCardModule } from '@fuse/components/card';
import { SharedModule } from 'app/shared/shared.module';
import {MatSelectModule} from '@angular/material/select';

import { historiesRoutes } from 'app/modules/admin/apps/history-popups/histories.routing';
import {MatCardModule} from '@angular/material/card';
import { NgApexchartsModule } from "ng-apexcharts";
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatDialogModule, MatDialogRef  } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatTabsModule } from '@angular/material/tabs';

import { HistoriesComponent } from './histories.component'

// import { FamilyHistoryComponent } from './family-history/family-history.component';
import { MedicalHistoryComponent } from './medical-history/medical-history.component';
import {VideoCallModule} from '../video-call/video-call.module'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { SurgicalHistoryComponent } from './surgical-history/surgical-history.component'
// import { SocialHistoryComponent } from './social-history/social-history.component';
// import { MenustrualHistoryComponent } from './menustrual-history/menustrual-history.component'
@NgModule({
    declarations: [
        HistoriesComponent, MedicalHistoryComponent
    ],
    imports     : [
        RouterModule.forChild(historiesRoutes),
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
        NgApexchartsModule,
        MatButtonToggleModule,
        MatExpansionModule, 
        MatDialogModule,
        MatDatepickerModule,
        MatMomentDateModule,
        NgSelectModule,
        MatTabsModule,
        MatSelectModule,
        VideoCallModule,
        MatProgressSpinnerModule
    ]
})
export class HistoriesModule
{
}
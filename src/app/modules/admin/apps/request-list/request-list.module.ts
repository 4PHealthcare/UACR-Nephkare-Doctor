import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { SharedModule } from 'app/shared/shared.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSortModule } from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';

import { RequestListComponent } from './request-list.component';
import { RequestListRoutes } from './request-list.routing';



@NgModule({
    declarations: [
        RequestListComponent,
       
    ],
    imports     : [
        RouterModule.forChild(RequestListRoutes),
        MatButtonModule,
        MatButtonToggleModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatTooltipModule,
        MatTabsModule,
        SharedModule,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
        MatSelectModule
    ],
   
})
export class RequestListModule
{
}

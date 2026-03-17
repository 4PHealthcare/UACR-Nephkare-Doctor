import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { SharedModule } from 'app/shared/shared.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SecondOpinionSubscriptionComponent } from './second-opionion-subscriptions.component';
import { SecondOpinionSubscriptionRoutes } from './second-opionion-subscriptions.routing';
import { MatSelectModule } from '@angular/material/select';



@NgModule({
    declarations: [
        SecondOpinionSubscriptionComponent,
       
    ],
    imports     : [
        RouterModule.forChild(SecondOpinionSubscriptionRoutes),
        
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatTabsModule,
        MatTooltipModule,
        SharedModule,
        MatSelectModule,
        MatPaginatorModule,

    ],
   
})
export class SecondOpinionSubscriptionModule
{
}

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'app/shared/shared.module';
import { HubspotComponent } from './hubspot.component';
import { HubspotRoutes } from './hubspot.routing';

@NgModule({
    declarations: [
        HubspotComponent
    ],
    imports     : [
        RouterModule.forChild(HubspotRoutes),
        MatIconModule,
        SharedModule
    ]
})
export class HubspotModule
{
}

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseFindByKeyPipeModule } from '@fuse/pipes/find-by-key';
import { SharedModule } from 'app/shared/shared.module';
import { MatTabsModule } from '@angular/material/tabs';
import { AddServiceComponent } from './add-service/add-service.component';
import { EditServiceComponent } from './edit-service/edit-service.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { SearchSubscriptionPipe } from './search-subscription.pipe';
import { SubscriptionsListComponent } from './list/list.component';
import { SubscriptionsDetailsComponent } from './details/details.component';
import { SubscriptionsComponent } from './subscriptions.component';
import { subscriptionsRoutes } from './subscriptions.routing';


@NgModule({
    declarations: [
        SubscriptionsComponent,
        SubscriptionsDetailsComponent,
        SubscriptionsListComponent,
        AddServiceComponent,
        EditServiceComponent,
        SearchSubscriptionPipe
    ],
    imports     : [
        RouterModule.forChild(subscriptionsRoutes),
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressBarModule,
        MatSelectModule,
        MatSidenavModule,
        MatSlideToggleModule,
        MatTooltipModule,
        FuseFindByKeyPipeModule,
        SharedModule,
        MatTabsModule,
        MatDialogModule,
        MatMenuModule
    ]
})
export class SubscriptionsModule
{
}

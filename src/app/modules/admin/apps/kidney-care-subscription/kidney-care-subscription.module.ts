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
import { MAT_AUTOCOMPLETE_SCROLL_STRATEGY, MatAutocompleteModule } from '@angular/material/autocomplete';
import { BlockScrollStrategy, Overlay } from '@angular/cdk/overlay';

import { KidneyCareSubscriptionComponent } from './kidney-care-subscription.component';
import { KidneyCareSubscriptionRoutes } from './kidney-care-subscription.routing';

import { SettingsModalComponent } from './settings-modal/settings-modal.component';


@NgModule({
    declarations: [
        KidneyCareSubscriptionComponent,
        SettingsModalComponent
       
    ],
    imports     : [
        RouterModule.forChild(KidneyCareSubscriptionRoutes),
        MatButtonModule,
        MatButtonToggleModule,
        MatFormFieldModule,
        MatIconModule,
        MatAutocompleteModule,
        MatInputModule,
        MatTooltipModule,
        MatTabsModule,
        SharedModule,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
        MatSelectModule
    ],
    providers   : [
        {
            provide   : MAT_AUTOCOMPLETE_SCROLL_STRATEGY,
            useFactory: (overlay: Overlay) => (): BlockScrollStrategy => overlay.scrollStrategies.block(),
            deps      : [Overlay]
        }
    ]
   
})
export class KidneyCareSubscriptionModule
{
}

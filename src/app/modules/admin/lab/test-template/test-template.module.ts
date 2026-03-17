import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { SharedModule } from 'app/shared/shared.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TestTemplateComponent } from './test-template.component';
import { TestTemplateRoutes } from './test-template.routing';
import { TestTemplateModalComponent } from './test-template-modal/test-template-modal.component';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@NgModule({
    declarations: [
        TestTemplateComponent,
        TestTemplateModalComponent
    ],
    imports     : [
        RouterModule.forChild(TestTemplateRoutes),
        MatIconModule,
        MatPaginatorModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatTooltipModule,
        MatSelectModule,
        MatAutocompleteModule,
        SharedModule
    ]
})
export class TestTemplateModule
{
}

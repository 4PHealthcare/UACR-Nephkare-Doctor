import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ExtraOptions, PreloadAllModules, RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { FuseModule } from '@fuse';
import { FuseConfigModule } from '@fuse/services/config';
import { FuseMockApiModule } from '@fuse/lib/mock-api';
import { CoreModule } from 'app/core/core.module';
import { appConfig } from 'app/core/config/app.config';
import { mockApiServices } from 'app/mock-api';
import { LayoutModule } from 'app/layout/layout.module';
import { AppComponent } from 'app/app.component';
import { appRoutes } from 'app/app.routing';
import { AddUserModalComponent } from './modules/admin/apps/add-user-modal/add-user-modal.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete'; 




import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import {NgxPrintModule} from 'ngx-print';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule, NgxMatNativeDateModule } from '@angular-material-components/datetime-picker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import {MatGridListModule} from '@angular/material/grid-list';

import { ChiefComplaintModalComponent } from './modules/admin/apps/patient-prescription/chief-complaint-modal/chief-complaint-modal.component';
import { DiagnosisModalComponent } from './modules/admin/apps/patient-prescription/diagnosis-modal/diagnosis-modal.component';
import { AddVitalModalComponent } from './modules/admin/pages/profile/add-vital-modal/add-vital-modal.component';

import { AppointedPatientListComponent } from './modules/admin/apps/appointed-patient-list/appointed-patient-list.component';
import { AppointmentFormModalComponent } from './modules/admin/apps/appointment-form-modal/appointment-form-modal.component';
import { ReasonForCancelComponent } from './modules/admin/apps/calendar/reason-for-cancel/reason-for-cancel.component';
import { TestRangeModalComponent } from './modules/admin/apps/test-range-modal/test-range-modal.component';
import { AddTestFormComponent } from './modules/admin/apps/add-test-form/add-test-form.component';
import { TestListModalComponent } from './modules/admin/apps/test-list-modal/test-list-modal.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { LabBillingComponent } from './modules/admin/lab/lab-billing/lab-billing.component';
import { LabTestsComponent } from './modules/admin/lab/lab-tests/lab-tests.component';

import {MatDialogModule} from '@angular/material/dialog';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/auth/auth.interceptor';
import { AppointmentRequestFormModalComponent } from './modules/admin/apps/appointment-request-form-modal/appointment-request-form-modal.component';
import { AddIpModalComponent } from './modules/admin/apps/add-ip-modal/add-ip-modal.component';
import {OnlyNumberDirective} from './only-number.directive';
import { VitalsSettingsComponent } from './vitals-settings/vitals-settings.component';
import { CapitalizeDirective } from './capitalize.directive';

// import { HospitalFollowupComponent } from './modules/admin/apps/hospital-followup/hospital-followup.component';
// import { FollowUpsComponent } from './modules/admin/apps/follow-ups/follow-ups.component'
// import { RequestListComponent } from './modules/admin/apps/request-list/request-list.component';

// import { PatientPrescriptionComponent } from './modules/admin/apps/patient-prescription/patient-prescription.component';

const routerConfig: ExtraOptions = {
    preloadingStrategy       : PreloadAllModules,
    scrollPositionRestoration: 'enabled'
};

@NgModule({
    declarations: [
        AppComponent,
        AddUserModalComponent,
        ChiefComplaintModalComponent,
        AppointedPatientListComponent,
        DiagnosisModalComponent,
        AppointmentFormModalComponent,   
        ReasonForCancelComponent,
        AddVitalModalComponent,
        TestRangeModalComponent,
        AddTestFormComponent,
        TestListModalComponent,
        LabBillingComponent,
        LabTestsComponent,
        AppointmentRequestFormModalComponent,
        AddIpModalComponent,
        OnlyNumberDirective,
        CapitalizeDirective,
        VitalsSettingsComponent,
       
    ],
    imports     : [
        BrowserModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(appRoutes, routerConfig),
        
        // Fuse, FuseConfig & FuseMockAPI
        FuseModule,
        FuseConfigModule.forRoot(appConfig),
        FuseMockApiModule.forRoot(mockApiServices),

        // Core module of your application
        CoreModule,

        // Layout module of your application
        LayoutModule,
        MatDialogModule,
        MatIconModule,
        MatFormFieldModule,
        MatSelectModule,
        FormsModule,
        PdfViewerModule,
        ReactiveFormsModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatDatepickerModule,
        MatMomentDateModule,
        NgxMaterialTimepickerModule,
        NgSelectModule,
        NgxPrintModule,
        NgxMatDatetimePickerModule,
        NgxMatTimepickerModule,
        NgxMatNativeDateModule,
        MatAutocompleteModule,
        MatChipsModule,
        MatGridListModule,
        GooglePlaceModule,
        MatCheckboxModule,
        // 3rd party modules that require global configuration via forRoot
        MarkdownModule.forRoot({})
    ],
    providers:[{provide:HTTP_INTERCEPTORS,useClass:AuthInterceptor,multi:true}],
    bootstrap   : [
        AppComponent
    ]
})
export class AppModule
{
}

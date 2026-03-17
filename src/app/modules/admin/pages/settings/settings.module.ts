import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSidenavModule } from "@angular/material/sidenav";
import { FuseAlertModule } from "@fuse/components/alert";
import { SharedModule } from "app/shared/shared.module";
import { NgSelectModule } from "@ng-select/ng-select";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatAutocompleteModule } from "@angular/material/autocomplete";

import { GooglePlaceModule } from "ngx-google-places-autocomplete";

import { settingsRoutes } from "app/modules/admin/pages/settings/settings.routing";

import { FilterPipe } from "./team/filter.pipe";
import { MatDialogModule } from "@angular/material/dialog";
import { NgxMaterialTimepickerModule } from "ngx-material-timepicker";
import { MatTableModule } from "@angular/material/table";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatMenuModule } from "@angular/material/menu";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatMomentDateModule } from "@angular/material-moment-adapter";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatTabsModule } from "@angular/material/tabs";
import { MatGridListModule } from "@angular/material/grid-list";


import { MatDividerModule } from "@angular/material/divider";

import { FuseCardModule } from "@fuse/components/card";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";


import { MatChipsModule } from "@angular/material/chips";


import { MatPaginatorModule } from "@angular/material/paginator";
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';

import { DoctorScheduleComponent } from "./doctor-schedule/doctor-schedule.component";
import { SettingsComponent } from "app/modules/admin/pages/settings/settings.component";
import { SettingsAccountComponent } from "app/modules/admin/pages/settings/account/account.component";
import { SettingsSecurityComponent } from "app/modules/admin/pages/settings/security/security.component";
import { SettingsPlanBillingComponent } from "app/modules/admin/pages/settings/plan-billing/plan-billing.component";
import { SettingsNotificationsComponent } from "app/modules/admin/pages/settings/notifications/notifications.component";
import { SettingsTeamComponent } from "app/modules/admin/pages/settings/team/team.component";
import { AddUserComponent } from "./add-user/add-user.component";
import { SettingsClinicProfileComponent } from "./clinic-profile/clinic-profile.component";
import { AddHospitalLicenseModalComponent } from "./add-hospital-license/add-hospital-license-modal.component";
import { AddSubClinicModalComponent } from "./add-sub-clinic/add-sub-clinic-modal.component";
import { DoctorProfileComponent } from "./doctor-profile/doctor-profile.component";
import { AddUserModalComponent } from "./doctor-profile/add-user-modal/add-user-modal.component";
import { AddStaffModalComponent } from "./doctor-profile/add-staff-modal/add-staff-modal.component";
import { SettingsPatientIdComponent } from "app/modules/admin/pages/settings/patientId/patientId.component";
import { ServicesComponent } from "app/modules/admin/pages/settings/services/services.component";
import { AddServiceComponent } from './add-service/add-service.component';
import { EditServiceComponent } from './edit-service/edit-service.component';

import { ArraySortPipe } from "./day-sort.pipe";
import { PrescriptionHeaderFooterComponent } from "./prescription-header-footer/prescription-header-footer.component";
import { DoctorFeeComponent } from "./doctor-fee/doctor-fee.component";
import { AddServiceModalComponent } from "./add-service-modal/add-service-modal.component";
import { SpecilitySectionComponent } from "./specility-section/specility-section.component";
import { FreeConsultationDaysComponent } from './free-consultation-days/free-consultation-days.component';
import { SubscriptionManagementComponent } from "./subscription-management/subscription-management.component";
import { SearchSubscriptionPipe } from "./search-subscription.pipe";
import { AddPhysicianModalComponent } from "./doctor-profile/add-physician-modal/add-physician-modal.component";
import { PrescriptionSignatureComponent } from "./prescription-signature/prescription-signature.component";


@NgModule({
  declarations: [
    SettingsComponent,
    SettingsAccountComponent,
    SettingsSecurityComponent,
    SettingsPlanBillingComponent,
    SettingsNotificationsComponent,
    SettingsTeamComponent,
    AddUserComponent,
    FilterPipe,
    DoctorScheduleComponent,
    ArraySortPipe,
    SettingsClinicProfileComponent,
    SubscriptionManagementComponent,
    AddHospitalLicenseModalComponent,
    AddSubClinicModalComponent,
    DoctorProfileComponent,
    AddUserModalComponent,
    AddStaffModalComponent,
    AddPhysicianModalComponent,
    SettingsPatientIdComponent,
    PrescriptionHeaderFooterComponent,
    ServicesComponent,
    DoctorFeeComponent,
    AddServiceModalComponent,
    SpecilitySectionComponent,
    FreeConsultationDaysComponent,
    AddServiceComponent,
    EditServiceComponent,
    SearchSubscriptionPipe,
    PrescriptionSignatureComponent
  ],
  imports: [
    RouterModule.forChild(settingsRoutes),
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    FuseAlertModule,
    SharedModule,
    MatDialogModule,
    NgSelectModule,
    NgxMaterialTimepickerModule,
    MatTableModule,
    MatTooltipModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatButtonToggleModule,
    MatTabsModule,
    MatGridListModule,
    MatPaginatorModule,
    NgxIntlTelInputModule,
    GooglePlaceModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatDividerModule,
    FuseCardModule,
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,

    MatChipsModule,
  ],
})
export class SettingsModule {}

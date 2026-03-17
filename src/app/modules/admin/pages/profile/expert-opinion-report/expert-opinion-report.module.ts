import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpertOpinionReportComponent } from './expert-opinion-report.component';
import { ExpertOpinionReportRoutingModule } from './expert-opinion-report-routing.module';

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { SharedModule } from "app/shared/shared.module";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

import { QuillModule } from 'ngx-quill';



@NgModule({
  declarations: [ExpertOpinionReportComponent],
  imports: [
    CommonModule,
    ExpertOpinionReportRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    SharedModule,
    MatAutocompleteModule,
    MatIconModule,
    MatButtonModule,
    QuillModule

  ]
})
export class ExpertOpinionReportModule { }
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { MatChipsModule } from '@angular/material/chips';
import { AllergiesComponent } from './allergies.component';

import { MatAutocompleteModule } from '@angular/material/autocomplete'; 


@NgModule({
  declarations: [
    AllergiesComponent
  ],
  imports: [
    CommonModule,
    MatChipsModule,
    MatAutocompleteModule
  ]
})
export class AllergiesModule { }

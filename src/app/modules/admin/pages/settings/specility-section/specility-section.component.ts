import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { APIService } from 'app/core/api/api';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { AuthService } from 'app/core/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';



@Component({
  selector: 'app-specility-section',
  templateUrl: './specility-section.component.html',
  styleUrls: ['./specility-section.component.scss']
})
export class SpecilitySectionComponent implements OnInit {
  
  allSpecialities:any [] = [];
  diableBtn:boolean = false;
  public chipSelectedSpecialities: any[] = [];
  public filteredSpecialities: Observable<String[]>;
  userInfo:any;
  //
  // Set this to false to ensure specialities are from allSpecialities list only.
  // Set this to true to also allow 'free text' specialities.
  //
  private allowFreeTextAddSpeciality = false;
  changesFound:boolean = false;
  isLoadingSpinner:boolean=false;

  public specialityControl = new FormControl();
  readonly separatorKeysCodes: number[] = [ENTER];
  
  @ViewChild('specialityInput') specialityInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor(private httpService: APIService, public auth: AuthService, private cd: ChangeDetectorRef,private snackBar: MatSnackBar) { 
    this.userInfo = JSON.parse(this.auth.user);
  }

  ngOnInit(): void {
    console.log(this.changesFound)
    const url2 = `api/User/GetMasterData?mastercategoryid=`+21;
       
    this.httpService.getAll(url2).subscribe((res: any) => {
        this.allSpecialities=res.data;
    },
    (error: any) => {
        console.log('error', error);
    });

    this.filteredSpecialities = this.specialityControl.valueChanges.pipe(startWith(null),
      map(specialityName => this.filterOnValueChange(specialityName))
    );
    this.getSpecialitiesByAdminId(this.userInfo.admin_account)
  }
  public addSpeciality(event: MatChipInputEvent): void {
    if (!this.allowFreeTextAddSpeciality) {
      // only allowed to select from the filtered autocomplete list
      console.log('allowFreeTextAddSpeciality is false');
      return;
    }

    //
    // Only add when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event
    //
    if (this.matAutocomplete.isOpen) {
      return;
    }

     // Add our speciality
     const value = event.value;
     if ((value || '').trim()) {
      this.selectSpecialityByName(value.trim());
    }

    this.resetInputs();
  }

  public removeSpeciality(speciality: any): void {
    console.log(speciality);
    const index = this.chipSelectedSpecialities.indexOf(speciality);
    if (index >= 0) {
      this.chipSelectedSpecialities[index].is_active = false;
      this.changesFound = true;
      // this.chipSelectedSpecialities.push({
      //   is_active:false
      // })
      this.resetInputs();
    }
  }

  public specilitySelected(event: MatAutocompleteSelectedEvent): void {
    this.selectSpecialityByName(event.option.value);
    this.resetInputs();
  }

  private resetInputs() {
    // clear input element
    this.specialityInput.nativeElement.value = '';
    // clear control value and trigger specialityControl.valueChanges event 
    this.specialityControl.setValue(null); 
  }

  //
  // Compute a new autocomplete list each time control value changes
  //
  private filterOnValueChange(specialityName: string | null): String[] {
    let result: String[] = [];
    //
    // Remove the specialities we have already selected from all specialities to
    // get a starting point for the autocomplete list.
    //
    let allSpecialitiesLessSelected = this.allSpecialities.filter(speciality => this.chipSelectedSpecialities.indexOf(speciality) < 0);
    if (specialityName) {
      result = this.filterSpeciality(allSpecialitiesLessSelected, specialityName);
    } else {
      result = allSpecialitiesLessSelected.map(speciality => speciality.data_name);
    }
    return result;
  }

  private filterSpeciality(specialityList: any[], specialityName: String): String[] {
    let filteredSpecialityList: any[] = [];
    const filterValue = specialityName.toLowerCase();
    let specialitiesMatchingSpecialityName = specialityList.filter(speciality => speciality.data_name.toLowerCase().indexOf(filterValue) === 0);
    if (specialitiesMatchingSpecialityName.length || this.allowFreeTextAddSpeciality) {
      //
      // either the speciality name matched some autocomplete options 
      // or the name didn't match but we're allowing 
      // non-autocomplete speciality names to be entered
      //
      filteredSpecialityList = specialitiesMatchingSpecialityName;
    } else {
      //
      // the speciality name didn't match the autocomplete list 
      // and we're only allowing specialities to be selected from the list
      // so we show the whjole list
      // 
      filteredSpecialityList = specialityList;
    }
    //
    // Convert filtered list of speciality objects to list of speciality 
    // name strings and return it
    //
    return filteredSpecialityList.map(speciality => speciality.data_name);
  }
  duplicateSpecialityFound(specialityName){
    let obj = this.chipSelectedSpecialities.find(o => o.specialityname === specialityName); 

    if (obj && obj.is_active) { 
      return true;
    } else{
      return false;
    }
  }
  private selectSpecialityByName(specialityName) {
    let foundSpeciality = this.allSpecialities.filter(speciality => speciality.data_name == specialityName);
    if (foundSpeciality.length) {
      //
      // We found the speciality name in the allSpecialities list
      //
    
      if(!this.duplicateSpecialityFound(specialityName)) {
        this.chipSelectedSpecialities.push({
          doctorspecialityid:0,
          specialityname:foundSpeciality[0].data_name,
          specialityid:foundSpeciality[0].masterdata_id,
          adminid: this.userInfo.admin_account,
          is_active: true,
          createdby: this.userInfo.admin_account,
          
        })
        this.changesFound = true;
      }
     
     
    } else {
      //
      // Create a new speciality, assigning a new higher employeeId
      // This is the use case when allowFreeTextAddSpeciality is true
      //
      let highestEmployeeId = Math.max(...this.chipSelectedSpecialities.map(speciality => speciality.masterdata_id), 0);
      // this.chipSelectedSpecialities.push({ data_name: specialityName, masterdata_id: highestEmployeeId + 1 });
    }
    
  }
  
  save() {
    this.isLoadingSpinner=true;     
    const url = `api/Doctor/SaveDoctorSpecialities_forHospitals`;
    this.httpService.create(url, this.chipSelectedSpecialities).subscribe(
      (res: any) => {
        if (res.data) {
          this.isLoadingSpinner=false;  
          // this.dialogRef.close(true);

          this.snackBar.open('Specialities updated successfully. ', 'close', {
            panelClass: "snackBarSuccess",
            duration: 2000,
          });
          this.getSpecialitiesByAdminId(this.userInfo.admin_account)
          
        } 
        this.changesFound =false;
      },
      (error: any) => {
        console.log("error", error);
      }
    );

  }
  
  cancel() {
    this.getSpecialitiesByAdminId(this.userInfo.admin_account);

  }
  getSpecialitiesByAdminId(id?:any) {
    const url = `api/Doctor/GetDoctorSpecialitiesForHospitals?adminid=${id}`;
    this.httpService.getAll(url).subscribe((res: any) => {
      // console.log(res.data)
      if ( res.data && res.data.length !== 0 ) {
        console.log(res.data);
        this.chipSelectedSpecialities = res.data.map(function (speciality: any) {
          console.log('patch')
          return {
            // patientid: parseInt(obj.data.patId),
            // appointmentid: test.appointment_id,
            // createdby: parseInt(obj.data.doctorId),
            // isactive: true,
            // complaintid: test.complaint_id,
            // complaint_name: test.complaint,
            doctorspecialityid:speciality.doctorspeciality_id,
            specialityname:speciality.speciality_name,
            specialityid:speciality.speciality_id,
            adminid: speciality.admin_id,
            is_active: true,
            createdby: speciality.admin_id,
          };
        });
        this.cd.detectChanges();
      }
    });
  }
  addOnBlur(event: FocusEvent) {
    console.log(this.specialityInput)
    const target: HTMLElement = event.relatedTarget as HTMLElement;
    if (!target || target.tagName !== "MAT-OPTION") {
      const matChipEvent: MatChipInputEvent = {
        input: this.specialityInput.nativeElement,
        value: this.specialityInput.nativeElement.value,
      };
      this.duplicateSpecialityFound(matChipEvent);
    }
  }

}

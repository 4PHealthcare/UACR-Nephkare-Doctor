import { Component, ElementRef, Inject, OnInit, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  NgForm,
  Validators,
  FormControl,
  AbstractControl,
} from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatDialog } from "@angular/material/dialog";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from "@angular/material-moment-adapter";
import { APIService } from "app/core/api/api";
import * as moment from "moment";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "app/core/auth/auth.service";
import { ViewRelativesComponent } from "../view-relatives/view-relatives.component";
import { AppointmentFormModalComponent } from "../../appointment-form-modal/appointment-form-modal.component";
import { ActivatedRoute, Router } from "@angular/router";
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { AddressComponent as gAddressComponent } from "ngx-google-places-autocomplete/objects/addressComponent";
import { FuseConfirmationService } from "@fuse/services/confirmation";
import { Subscription } from "rxjs";

export const MY_FORMATS = {
  parse: {
    dateInput: "LL",
  },
  display: {
    dateInput: "DD-MMM-YYYY",
    monthYearLabel: "YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "YYYY",
  },
};

@Component({
  selector: "app-add-patient",
  templateUrl: "./add-patient.component.html",
  styleUrls: ["./add-patient.component.scss"],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class AddPatientComponent implements OnInit {
  patientRegistrationForm: FormGroup;
  @ViewChild("patientaRegistrationNGForm") patientaRegistrationNGForm: NgForm;
  options: any = {
    componentRestrictions: { country: 'IN' }
  }  

  @ViewChild('addressInput') addressInput: ElementRef;
  scheduleTimeList: any[] = [];
  
  bloodGroupList: any;
  relationShips: any[] = [];
  heightScalesList: any = [];
  weightScalesList: any = [];
  medicalMasterData: any = [];
  heightFeetInches:Subscription;
  isPatientAlreadyExists: boolean = false;
  isPhoneInputHasValue: boolean = false;
  isShowrelation:boolean=false;
  isLoading:boolean = false;
  enteredMobileNumber={};
  userInfo: any;
  editMode = false;
  selectedDependentAdminId:any;
  mainPatientAlreadyExist:boolean = false;
  showRelations:boolean = false;
  // heightId: any;
  // weightId: any;
  noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control && control.value && control.value.toString() || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }
  constructor(
    private _matDialogRef: MatDialogRef<AddPatientComponent>, 
    public dialogRef: MatDialogRef<any>,
    private _formBuilder: FormBuilder,
    private httpService: APIService,
    private snackBar: MatSnackBar,
    private auth: AuthService,
    private _router: Router,
    private route: ActivatedRoute,
    private _apiService: APIService,
    private _matDialog: MatDialog,
    private _fuseConfirmationService: FuseConfirmationService,
    
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userInfo = JSON.parse(this.auth.user);
  }

  ngOnInit(): void {
    console.log(this.data)
    
    this.getTypesOfRelationShip();
    
    
    
    this.patientRegistrationForm = this._formBuilder.group({
      user_id: [""],
      // hospitalId: ["", [Validators.required]],
      firstName: ["", [Validators.required,this.noWhitespaceValidator]],
      lastName: ["", [Validators.required,this.noWhitespaceValidator]],
      gender: ["", [Validators.required]],
      phone: ["", [Validators.required, Validators.minLength(10),Validators.maxLength(10),Validators.pattern("[6-9]\\d{9}"),],], 
      // height: [""],
      heightFt: [""],
      heightIn: [""],
      weight: [""],
      age: ["", [Validators.required, Validators.min(1), Validators.max(100),this.noWhitespaceValidator]],
      patient_dob: [""],
      bloodgroupid: [""],
      heightscaleid: [""],
      weightscale: [{ value: null, disabled: true }],
      email_address:[""],
      relation:[""],
      address: [""],
      locality: [""],
      city: [""],
      state: [""],
      pincode: [""],
      country: [""],
      hospitalid:[""]
    });
    const height_feet = <FormControl>this.patientRegistrationForm.get('heightFt');
    const height_inches = <FormControl>this.patientRegistrationForm.get('heightIn');
    this.heightFeetInches = height_feet.valueChanges.subscribe(value => {
      if (value) {
        height_inches.setValidators([Validators.required, ])
      }
      else {
        height_inches.setValidators(null);
      }

      height_inches.updateValueAndValidity();
    });
    if (this.data && this.data?.data?.user_id) {
      this.editMode = true;
      // this.patientRegistrationForm.get('phone').disable();
      this.patientRegistrationForm.get('address').clearValidators();
      this.isPatientAlreadyExists = false;
    }
    if( this.data && this.data?.data?.dependent_relationship){
      this.isPatientAlreadyExists = true;
    }
    this.getMasterData();
    if (this.data?.data?.user_id) {
      this.patientRegistrationForm.patchValue({
        user_id: this.data.data.user_id ? this.data.data.user_id : "",
        firstName: this.data.data.first_name ? this.data.data.first_name : "",
        lastName: this.data.data.last_name ? this.data.data.last_name : "",
        gender: this.data.data.gender ? this.data.data.gender : "",
        phone: this.data.data.mobile_no ? this.data.data.mobile_no : "",
        // height: this.data.data.height ? this.data.data.height : "",
        heightFt: this.data.data.height_feet ? this.data.data.height_feet : "",
        heightIn: this.data.data.height ? this.data.data.height : "",
        weight: this.data.data.weight ? this.data.data.weight : "",
        age: this.data.data.age ? this.data.data.age : "", 
        patient_dob:this.data.data.dob ? this.data.data.dob:"",
        relation:this.data.data.dependent_relationship ? this.data.data.dependent_relationship:"",
        email_address:this.data.data.email_address ? this.data.data.email_address:"",
        
        bloodgroupid: this.data.data.bloodgroup_id ? this.data.data.bloodgroup_id : "",
        heightscaleid: this.data.data.height_scaleid ? this.data.data.height_scaleid : "",
        weightscale: this.data.data.weight_scale ? this.data.data.weight_scale : "",
        address: this.data.data.address ? this.data.data.address : "",
        locality: this.data?.data?.locality ? this.data.data.locality : "",
        city: this.data?.data?.city ? this.data.data.city : "",
        state: this.data?.data?.state ? this.data.data.state : "",
        pincode: this.data?.data?.pincode ? this.data.data.pincode : "",
        country: this.data?.data?.country ? this.data.data.country : "",
        hospitalid:this.data?.data?.hospital_id ? this.data.data.hospital_id : ""
      });

      this.checkMobileExists(true);

      // if(!this.data?.data?.isprimary_account) { 
      //   this.patientRegistrationForm.controls.phone.disable();
      // }      
    }
    
    
  }
  

  getMasterData() {
    this.httpService
      .getAll(`api/User/GetMasterData?mastercategoryid=16`)
      .subscribe(
        (res: any) => {
          if (res.data) {
            this.bloodGroupList = res.data;
          }
        },
        (error: any) => {
          console.warn("error", error);
        }
      );

    this.httpService
      .getAll(`api/User/GetMasterData?mastercategoryid=19`)
      .subscribe(
        (res: any) => {
          if (res.data) {
            this.heightScalesList = res.data;
            if(!this.data?.data?.user_id){
              this.patientRegistrationForm
              .get("heightscaleid")
              .setValue(this.heightScalesList[0].masterdata_id);
            }
           
          }
        },
        (error: any) => {
          console.warn("error", error);
        }
      );

    this.httpService
      .getAll(`api/User/GetMasterData?mastercategoryid=20`)
      .subscribe(
        (res: any) => {
          if (res.data) {
            this.weightScalesList = res.data;
            this.patientRegistrationForm
              .get("weightscale")
              .setValue(this.weightScalesList[0].masterdata_id);
          }
        },
        (error: any) => {
          console.warn("error", error);
        }
      );

    const url = `api/User/GetMasterData?mastercategoryid=8`;
    this.httpService.getAll(url).subscribe((res: any) => {
      this.medicalMasterData = res.data;
    });
  }

  calculateAge(dob) {
    let date = moment(dob).format("MM-DD-YYYY");
    return moment().diff(date, "years");
  }
  updateDOB(ev) {
    const age = ev;
    const currentDate = new Date();
    const birthdate = new Date(
      currentDate.getFullYear() - age,
      currentDate.getMonth(),
      currentDate.getDate()
    );
    this.patientRegistrationForm.controls.patient_dob.setValue(
      moment(birthdate).format("YYYY-MM-DD")
    );
  }

  dateChanged(value: string, event: any) {
    this.patientRegistrationForm.controls.age.setValue(
      this.calculateAge(event.value)
    );
  }

  heightCalculate(event: any) {
    console.log()
    if (event.value) {
      if (event.value == 61 && this.patientRegistrationForm.get("height").value) {
        this.patientRegistrationForm.patchValue({
          height: this.patientRegistrationForm.get("height").value
            ? (
                this.patientRegistrationForm.get("height").value * 0.032808
              ).toFixed(1)
            : this.patientRegistrationForm.controls.height.setValue(null),
        });
      }
     if (event.value == 60 && this.patientRegistrationForm.get("height").value) {
        this.patientRegistrationForm.patchValue({
          height: this.patientRegistrationForm.get("height").value
            ? (
                this.patientRegistrationForm.get("height").value / 0.032808
              ).toFixed(1)
            : this.patientRegistrationForm.controls.height.setValue(null),
        });
      }
    }
  }

  weightCalculate(event: any) {
    if (event.value) {
      if (event.value == 63) {
        this.patientRegistrationForm.patchValue({
          weight: this.patientRegistrationForm.get("weight").value
            ? Math.round(
                this.patientRegistrationForm.get("weight").value * 2.2046
              )
            : this.patientRegistrationForm.controls.weight.setValue(null),
        });
      }
      if (event.value == 62) {
        this.patientRegistrationForm.patchValue({
          weight: this.patientRegistrationForm.get("weight").value
            ? Math.round(
                this.patientRegistrationForm.get("weight").value / 2.2046
              )
            : this.patientRegistrationForm.controls.weight.setValue(null),
        });
      }
    }
    
  }
  dismiss() {
    this._matDialogRef.close();
  }

  capitalizeFirstLetter(string) {
    if (string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    } else {
      return "";
    }
  }

  checkData($event: any) {
    if ($event == "No Issues") {
      this.patientRegistrationForm
        .get("medicalCondition")
        .setValue(["No Issues"]);
    } else {
      let data = this.patientRegistrationForm.get("medicalCondition").value;
      let index = data.indexOf("No Issues");
      if (index !== -1) {
        data.splice(index, 1);
        this.patientRegistrationForm.get("medicalCondition").setValue(data);
      }
    }
  }
  mainaccountholder:any
  showRelation(){
    this.isShowrelation = true;
  }
  checkMobileExists(isEdit?:boolean) {
    this.mainPatientAlreadyExist= false;
    this.showRelations = false;

   
      this.enteredMobileNumber = this.patientRegistrationForm.value.phone;
      this._apiService.create(`api/PatientRegistration/CreateNewPatientMobileNumberByAdminId?mobile_no=${this.patientRegistrationForm.value.phone}&adminid=${this.userInfo.admin_account}`,{})
        .subscribe((res: any) => {
  
          if(isEdit) {
            this.mainaccountholder=res.data;
          } else {
            if (res.data > 0) {

            
              if (!this.data?.data?.isprimary_account) {
                this.isPatientAlreadyExists = true;
                this.patientRegistrationForm.get('relation').setValidators([Validators.required]);
                this.patientRegistrationForm.get('relation').setValue([]);
                this.showRelations = true;
              } else if(this.data?.data?.isprimary_account){
                
  
                if (this.data.data.user_id !== res.data) {
                  this.mainPatientAlreadyExist = true;
                } else {
                  this.showRelations = true;
                }
              }
             
              this.mainaccountholder=res.data;
              this.getSecondOpenionDetals(res.data);
  
            } else if(res.data == 0){
              
              this.isPatientAlreadyExists = false;
              this.patientRegistrationForm.get('relation').clearValidators();
              // this.isShowrelation = false;
            }
          }
         
          this.patientRegistrationForm.get('relation').updateValueAndValidity();
  
        });
    
   

     
  }
  checkInputEmpty(ev){
    console.log(ev.target.value);
    const value = ev.target.value;
    if(!value){
      this.isPatientAlreadyExists = false;
      this.isShowrelation = false;
    }
  }
  main_patient_name:any;
  adminId:any;
  getSecondOpenionDetals(id) {
    this.httpService.get("api/User/GetUsersById?userId=", id).subscribe(
      (res: any) => {
       if(res.data){
        this.main_patient_name=res.data.full_name;
        this.adminId=res.data.admin_account;  
       }
        
      },
      (error: any) => {
        console.warn("error", error);
      }
    );
  }
  savePatient() {
    this.isLoading = true;
    //if(this.userInfo.user_id === this.userInfo.admin_account){

    if(this.data.prefix_patientid && this.data.prefix_startwith){

      let payload = {
        user_id: this.editMode ? this.data.data.user_id : 0,
        first_name: this.capitalizeFirstLetter( this.patientRegistrationForm.value.firstName),
        last_name: this.capitalizeFirstLetter( this.patientRegistrationForm.value.lastName),
        gender: this.patientRegistrationForm.value.gender,
        age: this.patientRegistrationForm.value.age? parseInt(this.patientRegistrationForm.value.age) : 0,
        // patient_dob: this.patientRegistrationForm.value.patient_dob ? this.patientRegistrationForm.value.patient_dob.format( "YYYY-MM-DD[T00:00:00.000Z]"): undefined,
        patient_dob: this.patientRegistrationForm.get('patient_dob').value ? moment(this.patientRegistrationForm.get('patient_dob').value).format("YYYY-MM-DD") : undefined,
        //ht: this.patientRegistrationForm.value.height ? this.patientRegistrationForm.value.height.toString(): "",
        ht_feet: this.patientRegistrationForm.controls.heightFt.value.toString(),
        ht:this.patientRegistrationForm.controls.heightIn.value.toString(),
        wt: this.patientRegistrationForm.value.weight ? this.patientRegistrationForm.value.weight.toString() : "",
        bloodgroupid: this.patientRegistrationForm.value.bloodgroupid ? this.patientRegistrationForm.value.bloodgroupid : 0,
        heightscaleid: this.patientRegistrationForm.value.heightscaleid ? this.patientRegistrationForm.value.heightscaleid : 0,
        weightscale: 62,
        // weightscale:this.patientRegistrationForm.value.weightscaled?this.patientRegistrationForm.value.weightscaleid:0,
        mobile_no: this.patientRegistrationForm.get('phone').value,
        email_address:this.patientRegistrationForm.get('email_address').value,
        role_id: 3,
        condition_id: 0,
        
        adminaccount: this.userInfo.admin_account,
        referedclinicid: this.userInfo.refered_clinicid,
        undermainbranch: this.isPatientAlreadyExists?true: this.userInfo.isadmin_account,
        created_by: this.userInfo.user_id,
        hospitaluniqueid: this.userInfo.hospital_uniqueid,
        patientuniqueid: null,

        isprimaryaccount:this.isPatientAlreadyExists ? false :this.data?.data?.isprimary_account ?  this.data?.data?.isprimary_account : true,
        dependentrelationship:this.isPatientAlreadyExists?this.patientRegistrationForm.value.relation:undefined,
        referencemobileno:this.patientRegistrationForm.get('phone').value,
        mainaccountholder: this.isPatientAlreadyExists?this.mainaccountholder: this.editMode && this.mainaccountholder ? this.mainaccountholder : 0, 
        address: this.addressInput.nativeElement ? this.addressInput.nativeElement.value : undefined,
        pincode: this.patientRegistrationForm.get('pincode').value ? (this.patientRegistrationForm.get('pincode').value).toString() :'',
        state: this.patientRegistrationForm.get('state').value,
        country: this.patientRegistrationForm.get('country').value,
        city: this.patientRegistrationForm.get('city').value,
        locality: this.patientRegistrationForm.get('locality').value,
        hospitalid:this.patientRegistrationForm.get('hospitalid').value,
        appName:'HWR'
      };
  
      this.httpService
        .create("api/PatientRegistration/CreateNewPatientBasicInfo", payload)
        .subscribe(
          (res: any) => {
            if (res?.isSuccess) {
              if (!res.data) {
                this.isLoading = false;
                this.snackBar.open(
                   "Patient already exists with the given details.",
                  "close",
                  {
                    panelClass: "snackBarWarning",
                    duration: 2000,
                  }
                );
                
              } else {
                this.isLoading = false;
                this.dialogRef.close(true);
                this.snackBar.open(
                  this.editMode
                    ? "Patient updated successfully."
                    : "Patient saved successfully.",
                  "close",
                  {
                    panelClass: "snackBarSuccess",
                    duration: 2000,
                  }
                );
              
              }
              
            } else {
              this.isLoading = false;
              this.snackBar.open(res.data, "close", {
                panelClass: "snackBarWarning",
                duration: 2000,
              });
              
            }
          },
          (error: any) => {
            this.isLoading = false;
            console.warn("error", error);
          }
        );
    }else{
      if(this.userInfo.user_id === this.userInfo.admin_account){
        const confirmation = this._fuseConfirmationService.open({
          title: "Warning",
          message:`Please enter your Hospital unique ID or UHID`,
          actions: {
            confirm: {
              label: "View",
            },
            cancel: {
              label: "Close",
            },
          },
        });
        confirmation.afterClosed().subscribe((result) => {
          if (result === "confirmed") {
            
            this.dialogRef.close(true);
          // this._router.navigateByUrl('/pages/settings') 
           // this._router.navigateByUrl('pages/settings"', {state:{patientUniqueId:"no"}})
           this._router.navigate(["/pages/settings"], { state: { patientUniqueId:"no" } });
  
          }
        });
        this.isLoading = true;
      }else{
        const confirmation = this._fuseConfirmationService.open({
          title: "Warning",
          message:`Please contact your Admin to generate UHID`,
          actions: {
            confirm: {
              label: "View",
            },
            cancel: {
              label: "Close",
            },
          },
        });
        confirmation.afterClosed().subscribe((result) => {
          if (result === "confirmed") {
            
            this.dialogRef.close(true);
          // this._router.navigateByUrl('/pages/settings') 
           // this._router.navigateByUrl('pages/settings"', {state:{patientUniqueId:"no"}})
          //  this._router.navigate(["/pages/settings"], { state: { patientUniqueId:"no" } });
  
          }
        });
        this.isLoading = true;
      }
      const confirmation = this._fuseConfirmationService.open({
        title: "Warning",
        message:`Please enter your Hospital unique ID or UHID`,
        actions: {
          confirm: {
            label: "View",
          },
          cancel: {
            label: "Close",
          },
        },
      });
      confirmation.afterClosed().subscribe((result) => {
        if (result === "confirmed") {
          
          this.dialogRef.close(true);
        // this._router.navigateByUrl('/pages/settings') 
         // this._router.navigateByUrl('pages/settings"', {state:{patientUniqueId:"no"}})
         this._router.navigate(["/pages/settings"], { state: { patientUniqueId:"no" } });

        }
      });
      this.isLoading = true;
    }
    
    
  }
  onReset(): void {
    this.patientRegistrationForm.reset();

    this.patientRegistrationForm
      .get("heightscaleid")
      .setValue(this.heightScalesList[0].masterdata_id);
    this.patientRegistrationForm
      .get("weightscale")
      .setValue(this.weightScalesList[0].masterdata_id);
  }
  getTypesOfRelationShip() {
    const url = `api/User/GetMasterData?mastercategoryid=22`;
    this.httpService.getAll(url).subscribe((res: any) => {
      this.relationShips = res.data;
    });
  }
  isShown: boolean = false; // hidden by default
  isShowAddress: boolean = false; // hidden by default

  toggleShow() {
  
     this.isShown = !this.isShown;
  
  }
  toggleAddressShow() {
  
    this.isShowAddress = !this.isShowAddress;
 
 }
  viewRelations(){
    this._matDialog
    .open(ViewRelativesComponent, {
      width: "75rem",
      panelClass: "no-padding-popup",
      height: "100%",
      data: { phone: this.enteredMobileNumber, admin_id: this.adminId },
      // panelClass:"custom-margin-modal",
    })
    .afterClosed()
    .subscribe((data) => {
      if (data != 'patient') {
        // this.dialogRef.close(true);
        let obj = {...data, search:true}
        if (this.userInfo.role_id == 5) {
          this.dialogRef.close(obj);
        } else {
          this.bookAppointment(data);
        }

      }
      // this.newGetPatientsInfo();
    });
  }
  
  bookAppointment(data) {
    this._matDialog.openDialogs.pop();
    this._matDialog
      .open(AppointmentFormModalComponent, {
        width: "50rem",
        height: "100%",
        panelClass: "no-padding-popup",
        position: { right: "0" },
        data: { patient: data },
      })
      .afterClosed()
      .subscribe((data) => {
        this.dialogRef.close(true);
      });
  }

  handleAddressChange(address: Address) {

    let locality = this.findType(address, "locality");
    this.patientRegistrationForm.get('locality').setValue(locality);

    // let city = this.findType(address, "locality");
    // this.patientRegistrationForm.get('city').setValue(city);

    let district = this.findType(address, "administrative_area_level_2");
    if(district) {
      this.patientRegistrationForm.get('city').setValue(district);
    } else  {
      district = this.findType(address, "administrative_area_level_3");
      this.patientRegistrationForm.get('city').setValue(district);
    }

    // let district = this.findType(address, "administrative_area_level_3");
    // this.patientRegistrationForm.get('district').setValue(district);

    let state = this.findType(address, "administrative_area_level_1");
    this.patientRegistrationForm.get('state').setValue(state);

    let country = this.findType(address, "country");
    this.patientRegistrationForm.get('country').setValue(country);

    let pincode = this.findType(address, "postal_code");
    this.patientRegistrationForm.get('pincode').setValue(pincode);

  }

  private findType( addr : Address, type : string ) : string {
    console.log(addr);
    let comp : gAddressComponent = addr.address_components.find((item : gAddressComponent) => item.types.indexOf(type) >= 0);
    return comp ? comp.long_name : null;
}
letterOnly(event:any,input:any){

  if (event.which === 32 && !input.length) {
    event.preventDefault();
}
  const charCode = (event.which) ? event.which : event.keyCode;
   if ((charCode < 65 || charCode > 90) && charCode!=32 && (charCode < 97 || charCode > 122) || charCode == 8 ){
   return false;
  } 
}
onInputChange(ev: string) {
  this.patientRegistrationForm.controls.email_address.setValue(ev.toLowerCase()); 
}
}


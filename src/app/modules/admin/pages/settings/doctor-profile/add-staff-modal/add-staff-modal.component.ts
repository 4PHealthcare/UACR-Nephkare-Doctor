import { Component, Inject, OnInit, ViewEncapsulation } from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { APIService } from "app/core/api/api";
import { AuthService } from "app/core/auth/auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import {  Subject } from 'rxjs';
import { SearchCountryField, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';
// import * as intlTelInput from 'intl-tel-input';
const dialCodeToCountryISOMap: { [key: string]: CountryISO } = {
  '+1': CountryISO.UnitedStates,
  '+91': CountryISO.India,
  '+44': CountryISO.UnitedKingdom,
  "+971":CountryISO.UnitedArabEmirates,
  "+234":CountryISO.Nigeria
  // Add more mappings here for other countries
}; 


@Component({
  selector: 'app-add-staff-modal',
  templateUrl: './add-staff-modal.component.html',
  styleUrls: ['./add-staff-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddStaffModalComponent implements OnInit {

  separateDialCode = true;
	SearchCountryField = SearchCountryField;
	CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
	preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  selectedCountryISO: CountryISO | undefined;


  userForm: FormGroup;
  userInfo: any;
  editMode: boolean = false;
  labId:any;
  userActionLoading:boolean = false;
  hospitals:any[] = [];
  /** list of banks */
  doctors: any[] = [];

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();

  
  roles= [
    
    {
      "masterdata_id": 4,
      "data_name": "Health Worker"
    },
   

  ];
  
  /** indicate search operation is in progress */
  searching = false;

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<any>,
    private _formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any, 
    private httpService: APIService,
    private auth: AuthService,
    private snackBar: MatSnackBar) {
    this.userInfo = JSON.parse(this.auth.user);
    this.hospitals.push({
      clinic_name: this.userInfo.first_name,
      clinicid: this.userInfo.user_id,
      admin:true
    });
    
  }

  ngOnInit(): void { 
    
    console.log(this.data)
    this.userForm = this._formBuilder.group({ 
      // firstName: ["", [Validators.required]],
      // lastName: ["", [Validators.required]],
      name: ['', [Validators.required]],
      clinicId: [this.userInfo.admin_account, [Validators.required]],
      doctorId: [''],
      doctorInput : [''],
      email: ["", [Validators.required, Validators.email]],
      mobileNumber: [
        null,
        [
          // Validators.required,
          // Validators.minLength(10),
          // Validators.maxLength(10),
          // Validators.pattern('[6-9]\\d{9}')
        ],
      ],
      roleId: ['', [Validators.required]],
    });

    

    
    //this.getDoctorsList();
    if(this.data.accountInfo.user_id){
       this.getUserInfo(this.data.accountInfo.user_id);
    } 
   

   
  }

  getCountryISOByDialCode(dialCode: string): CountryISO | undefined {
    return dialCodeToCountryISOMap[dialCode];
  }

 getUserInfo(userId: number) {
    this.httpService.getAll(`api/adminstaff/get-adminstaff-by-id/${userId}` ).subscribe( 
      (res: any) => {
        console.log(res)
        this.setCountryBasedOnDetails(res);
        this.patchForm(res.data);
      },
      (error: any) => {
        console.warn("error", error);
      }
    );
  }

 setCountryBasedOnDetails(res) {
    // const dialCode = res.data.countrycode_details.dialcode;
    // this.selectedCountryISO = this.getCountryISOByDialCode(dialCode);
  }



  searchDoctor(event:any) {
    if(this.userForm.get('clinicId').value) {
      this.httpService.getAll(`api/Doctor/SearchDoctor?searchText=${event.term}&mainbranchid=${this.userForm.get('clinicId').value}&ismainbranch=${this.userForm.get('clinicId').value == this.userInfo.user_id ? true : false}`).subscribe(
        (res: any) => {
          if(res.data && res.data.length !== 0) {
            this.doctors = res.data;
          }else {
            this.doctors = [];
          }
        },
        (error: any) => {
          console.warn("error", error);
        }
      );
    }
    
  }

  patchForm(data: any) {
   
   
    
    this.userForm.patchValue({
      name: data.user.fullname,
      
      email: data.user.email,
      mobileNumber: data.user.mobile,
      roleId: data.user.role_id,
      

    });
    const phoneNumberControl= this.userForm.controls.mobileNumber;
    phoneNumberControl.setValue({
      number: data.countrycode_details.number,
      internationalNumber: data.countrycode_details.internation_no,
      nationalNumber: data.countrycode_details.national_no,
      countryCode: data.countrycode_details.countrycode_name,
      dialCode: data.countrycode_details.dialcode,
      e164Number:data.countrycode_details.e164_number
    });
    this.labId = data.role_id;

   
  
   
   // this.getDoctorsList();
  }

  getSubClinics(userId: number) {
    
  }

  formatPhoneNumber(phoneNumber: string): string {
    // Remove all spaces
    //let formattedNumber = phoneNumber.replace(/\s+/g, '');
    let formattedNumber = phoneNumber.replace(/[\s\(\)\-\+]/g, '');
    
    // Remove the leading zero, if it exists
    if (formattedNumber.startsWith('0')) {
      formattedNumber = formattedNumber.substring(1);
    }
    
    return formattedNumber;
  }

  addUser() {
    console.log(this.userForm.get("mobileNumber").value)
    this.userActionLoading = true;
    let name = this.userForm.get("name").value;
    let firstName = name.split(' ').slice(0, -1).join(' ');
    let lastName = name.split(' ').slice(-1).join(' ');


    let doctors = [];
    if (this.userForm.get("roleId").value == 474) {
      this.doctors.forEach(element => {
        doctors.push(element.user_id);
      });
    }

    
    
    const body = {
       userId: this.data && this.data.accountInfo ? this.data.accountInfo.user_id : 0,
      username: this.userForm.get("email").value,
      fullname: this.userForm.get("name").value,
      email: this.userForm.get("email").value,
      mobile: this.formatPhoneNumber(
        this.userForm.get("mobileNumber").value.nationalNumber,
      ),
      roleId: 4,
      actionBy: this.userInfo.user_id,
      isAdmin: false,
       adminAccount: this.userInfo.admin_account,
     
      countryCode: this.userForm.get("mobileNumber").value.dialCode,
      countryCodeDetails: {
        countryId: 0,

        countryName: this.userForm.get("mobileNumber").value.countryCode,
        dialCode: this.userForm.get("mobileNumber").value.dialCode,
        e164: this.userForm.get("mobileNumber").value.e164Number,
        international:
          this.userForm.get("mobileNumber").value.internationalNumber,
        national: this.userForm.get("mobileNumber").value.nationalNumber,
        number: this.userForm.get("mobileNumber").value.number
      }
      // userid: this.data && this.data.accountInfo ? this.data.accountInfo.user_id : 0,
      // username: this.userForm.get("email").value,
      // password: 'test@1234',
      // firstname: firstName,
      // lastname: lastName,
      // clinicid: this.userInfo.admin_account,
      // adminaccount: this.userInfo.admin_account,
      // undermainbranch: this.userInfo.user_id == this.userForm.get("clinicId").value ? true : false,
      // emailaddress: this.userForm.get("email").value,
      // mobileno: this.formatPhoneNumber(this.userForm.get("mobileNumber").value.nationalNumber),
      // countrycode:this.userForm.get("mobileNumber").value.dialCode,
      // roleid: parseInt(this.userForm.get("roleId").value),
      // actionby: this.userInfo.user_id,
      // coordinate_team : this.userForm.get("roleId").value == 474 ? doctors :this.userForm.get("doctorId").value ? this.userForm.get("doctorId").value : undefined,
      // appname: "HWR",
      // "countrycode_details": { 
      //   "country_id": 0,
      //   "user_id": 0,
      //   "countrycode_name": this.userForm.get("mobileNumber").value.countryCode,
      //   "dialcode": this.userForm.get("mobileNumber").value.dialCode,
      //   "e164_number": this.userForm.get("mobileNumber").value.e164Number,
      //   "internation_no":this.userForm.get("mobileNumber").value.internationalNumber,
      //   "national_no": this.userForm.get("mobileNumber").value.nationalNumber,
      //   "number": this.userForm.get("mobileNumber").value.number
      // },
    };

    this.httpService.create("api/adminstaff/save-adminstaff", body).subscribe(
      (res: any) => {

        if(res?.isSuccess) {
          this.dialogRef.close(true);
          //this.SaveActivity();
          this.snackBar.open('User added successfully. ', 'close', {
            panelClass: "snackBarSuccess",
            duration: 2000,
          });
        }else {
          this.snackBar.open(res.data, 'close', {
            panelClass: "snackBarWarning",
            duration: 2000,
          });
        }
        this.userActionLoading = false;
      },
      (error: any) => {
        this.userActionLoading = false;
        console.warn("error", error);
      }
    );
  }

  SaveActivity() {
    const roleId= parseInt(this.userForm.get("roleId").value);
    const roleName = this.roles.find(f=>f.masterdata_id === roleId).data_name;
    const body = {
      activityid: 0,
      userid: this.userInfo.user_id,
      titlename: "Added Staff",
      descriptionname: "Added <b>"+this.userForm.get("name").value+"</b> as <b>"+roleName +"</b>",
      createdby: this.userInfo.user_id,
      categoryname: "AddStaff"
    };
    const url = `api/PatientRegistration/CreateActivity`;
    this.httpService.create(url, body).subscribe((res: any) => { },
      (error: any) => { console.log('error', error); });
  }

  selectHospital() {
    this.userForm.get('doctorId').setValue(null);
    this.doctors = [];
    this.userForm.get('doctorId').enable();
    this.getDoctorsList(true);
  }

  getDoctorsList(isReset?:boolean) {
    
    // const url = `api/User/GetHospitalbasedUsers?roleid`;
    // const body = {
    //   roleid: 82580,
    //   pageSize: 100,
    //   pageNo: 1,
    //   clinicid: this.userInfo.admin_account,
    //   ismainbranch: this.userInfo.isadmin_account ? true : false,
    //   ishwradmin: true,
    //   userid: this.userInfo.user_id
    // };
    // this.httpService.create(url, body).subscribe((res: any) => {
    //   if(res.data.userdata) {
    //     this.doctors = res.data.userdata
    //     // if(!isReset) {
    //     //   this.userForm.get('doctorId').setValue([this.data.accountInfo.created_by]);
    //     // }

        
    //     if(this.data && this.data.accountInfo) {
    //       this.patchForm(this.data.accountInfo);
    //     }
        
    //   }
    // });
  }

  changeRole(value){
    this.labId=value;


    if (value == 82564) {
      this.userForm.get('doctorId').setValidators([Validators.required]);
      this.userForm.get('doctorId').setValue([]);
    }else {
      this.userForm.get('doctorId').clearValidators();   
    }
   
    this.userForm.get('doctorId').updateValueAndValidity();

    // this.userForm.get('doctorId').
    // this.userForm.get('doctorId').setValue(undefined);
  }
  changePreferredCountries() {
		this.preferredCountries = [CountryISO.India, CountryISO.Canada];
	}
  close(){
    this.userForm.reset();
    this.dialogRef.close(true);
    
  }
}

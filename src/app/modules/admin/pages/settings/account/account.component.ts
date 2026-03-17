import {
  ChangeDetectionStrategy, 
  Component,
  OnInit,
  ViewEncapsulation,
  ChangeDetectorRef
  
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { APIService } from "app/core/api/api";
import { AuthService } from "app/core/auth/auth.service";
import { UserService } from "app/core/user/user.service";
import { DataService } from "app/core/user/user.resolver";
import { SearchCountryField, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';

@Component({
  selector: "settings-account",
  templateUrl: "./account.component.html",
  styleUrls: ["./account.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsAccountComponent implements OnInit {

  separateDialCode = true;
	SearchCountryField = SearchCountryField;
	CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
	preferredCountries: CountryISO[] = [CountryISO.India, CountryISO.UnitedKingdom];

  accountForm: FormGroup;
  userInfo: any;
  accountInfo: any;
  photo: any;
  uploaded = false;
  filename:any;
  mimetype:any;
  disable_btn=true;
  fileBase64:any;
  languages:any[] = [];
  specialities:any[] = [];
  isLoadingSpinner:boolean=false;
  noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control && control.value && control.value.toString() || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }
  constructor(
    private _formBuilder: FormBuilder,
    private httpService: APIService,
    private auth: AuthService,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef,
    private dataService: DataService 
    
  ) {
    this.userInfo = JSON.parse(this.auth.user);
  }

  ngOnInit(): void {
    // Create the form
    console.log(this.userInfo)
    this.getUserInfo(this.userInfo.user_id);
    this.getMasterData();
    this.getSpecialityList();
    this.intitForm();
  }
  getSpecialityList() {
    const url = `api/User/GetMasterData?mastercategoryid=`+21;
     
    this.httpService.getAll(url).subscribe((res: any) => {
        this.specialities=res.data;
        // this.getUserInfo(this.userInfo.user_id);
    },
    (error: any) => {
        console.log('error', error);
    });
  }

  intitForm() {
    this.accountForm = new FormGroup({
      name: new FormControl("", [Validators.required,this.noWhitespaceValidator]),
      email: new FormControl({ value: null   }, [
        Validators.required,
        Validators.email,
      ]),
      phone: new FormControl("", [Validators.required]),
      medRegn: new FormControl("", [Validators.required,this.noWhitespaceValidator]),
      specialityid: new FormControl("", [Validators.required]),
      education: new FormControl("", [Validators.required]),
      expYears: new FormControl("", [Validators.required,this.noWhitespaceValidator]),
      fees: new FormControl(""),
      gender: new FormControl("", [Validators.required]), 
      languages: new FormControl("", [Validators.required]),
      profiledescription: new FormControl(""),
      isPhotoUpdated:new FormControl(false)
    });
    
    if ( this.userInfo.role_id != 5 ) {
      this.accountForm.controls.medRegn.setValidators([]);
      this.accountForm.controls.education.setValidators([]);
      this.accountForm.controls.expYears.setValidators([]);
      this.accountForm.controls.fees.setValidators([]);
      this.accountForm.controls.languages.setValidators([]);
      this.accountForm.controls.profiledescription.setValidators([]);
    }
    if (this.userInfo.admin_account === this.userInfo.user_id ) {
      this.accountForm.controls.specialityid.clearValidators();
      this.accountForm.controls.medRegn.clearValidators();
      this.accountForm.controls.education.clearValidators();
      this.accountForm.controls.expYears.clearValidators();
      this.accountForm.controls.fees.clearValidators();
      this.accountForm.controls.languages.clearValidators();
      this.accountForm.controls.gender.clearValidators();
    }
  }
  getMasterData() {
    this.httpService.getAll("api/User/GetMasterData?mastercategoryid=53").subscribe(
      (res: any) => {
        
        if (res.data) {

          this.languages = res.data;

        }
      },
      (error: any) => {
        console.warn("error", error);
      }
    );
  }

  getUserInfo(userId: number) {
    this.httpService.get("api/User/GetUsersById?userId=", userId).subscribe( 
      (res: any) => {
        this.accountInfo = res.data;
        this.cd.detectChanges();
        if(this.accountInfo.photo_folderpath && this.accountInfo.photo_filename) {
          this.photo = `https://hellokidneydata.s3.ap-south-1.amazonaws.com/${this.accountInfo.photo_folderpath}/${this.accountInfo.photo_filename}`;
          this.disable_btn = false;
        }
        this.patchForm(this.accountInfo);
        
        if(this.accountInfo?.isadmin_account){
          this.accountForm.get('gender').clearValidators();
        }
      },
      (error: any) => {
        console.warn("error", error);
      }
    );
  }

  patchForm(data: any) {
    
   
    let languages:any[] = [];
    if(data.languages && data.languages[0]) {
      languages = data.languages[0].language.split(",");
      
    }
    let newlanguages = languages.map(item => item.trim());
    let name = data.full_name ? data.full_name : data.first_name + ' ' + data.last_name;

    if(data.admin_account !==3 && data.isadmin_account) {
      name = data.contactperson_name; 
    }
    this.accountForm.patchValue({
      name: name,
      email: data.email_address,
      phone: ({
        number: data.countrycode_details.number,
        internationalNumber: data.countrycode_details.internation_no,
        nationalNumber: data.countrycode_details.national_no,
        countryCode: data.countrycode_details.countrycode_name,
        dialCode: data.countrycode_details.dialcode,
        e164Number:data.countrycode_details.e164_number
      }),
      medRegn: data.medical_registrationno,
      specialityid:data?.speciality_id,
      education: data.education,
      expYears: data.exp_years,
      gender: data.gender,
      profiledescription: data.profile_description,
      fees: data.fee,
      languages: newlanguages,
      isPhotoUpdated: false
    });
    
    // const phoneNumberControl= this.accountForm.controls.phone;
    // phoneNumberControl.setValue({
    //   number: data.countrycode_details.number,
    //   internationalNumber: data.countrycode_details.internation_no,
    //   nationalNumber: data.countrycode_details.national_no,
    //   countryCode: data.countrycode_details.countrycode_name,
    //   dialCode: data.countrycode_details.dialcode,
    //   e164Number:data.countrycode_details.e164_number
    // });
    setTimeout(() => {
      this.cd.detectChanges();
      
  }, 500);
   
  }

  updateAccount() {
    // console.log(this.photo);
    this.isLoadingSpinner=true;
    let nameParts = this.accountForm.get("name").value.trim().split(/\s+/); // Split by spaces and remove extra spaces
    let firstName = nameParts.slice(0, 2).join(" "); // Take the first two words as first name
    let lastName = nameParts.slice(2).join(" "); // Take the rest as last name
    this.accountForm.markAsPristine();
    console.log(name)
    let body:any
    if(this.accountInfo?.isadmin_account){
      body ={
        userid: this.userInfo.user_id,
        username: this.accountForm.get("email").value,
        emailaddress:this.accountForm.get("email").value,
        firstname:this.capitalizeFirstLetter(firstName),
        lastname: this.capitalizeFirstLetter(lastName),
       
        mobileno: this.accountForm.get("phone").value.number,  
        roleid: this.accountInfo.role_id,
        actionby: this.userInfo.user_id,
        
        isphoto_updated: this.accountForm.get("isPhotoUpdated").value,
        
        adminaccount: this.accountInfo.admin_account,
        clinicid: this.accountInfo.refered_clinicid,
        undermainbranch: this.accountInfo.under_mainbranch,
        isadminaccount: this.accountInfo.isadmin_account,
        contactperson: undefined,
        appname:'HLKD',
      }
    }else{
      body = {
        userid: this.userInfo.user_id,
        username: this.accountForm.get("email").value,
        password: "test@1234",
        firstname:this.capitalizeFirstLetter(firstName),
        lastname: this.capitalizeFirstLetter(lastName),
        emailaddress: this.accountForm.get("email").value,
        mobileno: this.accountForm.get("phone").value.mobileno,
        roleid: this.accountInfo.role_id,
        actionby: this.userInfo.user_id,
        medicalregistrationno: this.accountForm.get("medRegn").value,
        specialityid:this.accountForm.get("specialityid").value,
        education_info: this.accountForm.get("education").value,
        expyears: parseInt(this.accountForm.get("expYears").value),
        profiledescription: this.accountForm.get("profiledescription").value,
        fees:this.accountForm.get("fees").value,
        languages:this.accountForm.get("languages").value,
        isphoto_updated: this.accountForm.get("isPhotoUpdated").value,
        user_gender: this.accountForm.get("gender").value,
        adminaccount: this.accountInfo.admin_account,
        clinicid: this.accountInfo.refered_clinicid,
        undermainbranch: this.accountInfo.under_mainbranch,
        isadminaccount: this.accountInfo.isadmin_account,
        contactperson: undefined,
        appname:'HLKD',
      };
    }
    
    
    if (this.mimetype && this.fileBase64) {
      body["photo"] = {
        patientreportid: 0,
        filename: this.filename,
        mimetype: this.mimetype,
        fileBase64: this.fileBase64,
      }
    }
    // if(this.accountInfo.admin_account !== 3 && this.accountInfo.isadmin_account) {
    //   body.isadminaccount = true;
    //   body.contactperson = this.capitalizeFirstLetter(this.accountForm.get("name").value);
    //   body.firstname = undefined;
    //   body.lastname = undefined
    // }
    console.log(body);
    this.httpService.create("api/User/UpdateUser", body).subscribe(
      (res: any) => { 
        this.isLoadingSpinner=false;
        console.warn(res);
        this.dataService.setData(body["photo"]);
        this.getUserInfo(this.userInfo.user_id);
        this.SaveActivity();
        this.snackBar.open("User updated successfully.", "close", {
          panelClass: "snackBarSuccess",
          duration: 2000,
        }); 
      },
      (error: any) => {
        console.warn("error", error);
      }
    );
  }

  SaveActivity() {
    const body = {
      activityid: 0,
      userid: this.userInfo.user_id,
      titlename: "Profile Update",
      descriptionname: "Profile have been updated",
      createdby: this.userInfo.user_id,
      categoryname: "Profile",
    };
    const url = `api/PatientRegistration/CreateActivity`;
    this.httpService.create(url, body).subscribe(
      (res: any) => {
        //this.disable_btn = true;
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }

  cancelUpdate() {
    this.patchForm(this.accountInfo);
    this.accountForm.markAsPristine();
  }
  onSelectFile(event) {
    
    
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      
      let file = event.target.files[0];
     
      reader.onload = function (event: any) {
        this.photo = event.target.result;
        this.disable_btn=false;
        const base64Content = this.photo;
        let base64ContentArray = base64Content.split(",");
        let mimeType = base64ContentArray[0].match(
          /[^:\s*]\w+\/[\w-+\d.]+(?=[;| ])/
        )[0];
        let base64Data = base64ContentArray[1];
        this.fileBase64=base64Data;
        this.mimetype=mimeType;
        this.filename=file.name;
        this.uploaded = false;
        this.accountForm.get('isPhotoUpdated').setValue(true);
        this.accountForm.controls.isPhotoUpdated.markAsDirty()
        this.accountForm.updateValueAndValidity({emitEvent: false, onlySelf: true});
        this.cd.detectChanges();
       
        
      }.bind(this);
      
      reader.readAsDataURL(file); 
      
    }
  }
  public delete() {
    this.photo = null;
  }

  onMouseEnter() {
    this.uploaded = false;
  }
  capitalizeFirstLetter(string) {
   
    if (string) {
      const words = string.split(' ');
      const capitalizedWords = words.map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      });
      return capitalizedWords.join(' ');
    } else {
      return '';
    }
  }
}

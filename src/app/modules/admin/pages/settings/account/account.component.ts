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
    
    this.intitForm();
  }
  getSpecialityList() {
    // const url = `api/User/GetMasterData?mastercategoryid=`+21;
     
    // this.httpService.getAll(url).subscribe((res: any) => {
    //     this.specialities=res.data;
    //     // this.getUserInfo(this.userInfo.user_id);
    // },
    // (error: any) => {
    //     console.log('error', error);
    // });
  }

  intitForm() {
    this.accountForm = new FormGroup({
      name: new FormControl("", [Validators.required,this.noWhitespaceValidator]),
      email: new FormControl({ value: null   }, [
        Validators.required,
        Validators.email,
      ]),
      phone: new FormControl("", [Validators.required]), 
      city: new FormControl("", [Validators.required]),
      state: new FormControl("", [Validators.required]),
      countryname: new FormControl("", [Validators.required]),
      
      isPhotoUpdated:new FormControl(false)
    });
    
   
  }
  

  getUserInfo(userId: number) { 
    this.httpService.getAll(`api/adminstaff/get-adminstaff-by-id/${userId}` ).subscribe( 
      (res: any) => {
        this.accountInfo = res.data;
        this.cd.detectChanges();
       
        this.patchForm(this.accountInfo);
        
       
      },
      (error: any) => {
        console.warn("error", error);
      }
    );
  }

  patchForm(data: any) {
    
   
   
    this.accountForm.patchValue({
      name: data.user.fullname,
      email: data.user.email,
      city: data.user.city,
      state: data.user.state,
      countryname: data.user.country,
      phone: ({
        number: data.countryCode?.number,
        internationalNumber: data.countryCode?.internation_no,
        nationalNumber: data.countryCode?.national_no,
        countryCode: data.countryCode?.countrycode_name,
        dialCode: data.countryCode?.dialcode,
        e164Number:data.countryCode?.e164_number
      }),
      
    });
    this.photo = data.user.profile_pic
    
   
    setTimeout(() => {
      this.cd.detectChanges();
      
  }, 500);
   
  }

  updateAccount() {
     this.isLoadingSpinner=true;

    const body = {
      userId: this.accountInfo?.user.user_id ? this.accountInfo?.user.user_id : 0,
      username: this.accountForm.get("email").value,
      fullname: this.accountForm.get("name").value,
      email: this.accountForm.get("email").value,
      mobile: this.formatPhoneNumber(
        this.accountForm.get("phone").value.nationalNumber,
      ),
      roleId: 2,
      actionBy: this.userInfo.user_id,
      isAdmin: true,
      // adminAccount: 1,
      city: this.accountForm.get("city").value,
      state: this.accountForm.get("state").value,
      country: this.accountForm.get("countryname").value,
      countryCode: this.accountForm.get("phone").value.dialCode,
      countryCodeDetails: {
        countryId: 0,

        countryName: this.accountForm.get("phone").value.countryCode,
        dialCode: this.accountForm.get("phone").value.dialCode,
        e164: this.accountForm.get("phone").value.e164Number,
        international:
          this.accountForm.get("phone").value.internationalNumber,
        national: this.accountForm.get("phone").value.nationalNumber,
        number: this.accountForm.get("phone").value.number,
      },

      photo: {
        filename: this.filename,
        mimetype: this.mimetype,
        base64: this.fileBase64,
      },
      createdBy: this.userInfo.user_id,
    }; 

    this.httpService.create("api/adminstaff/save-adminstaff", body).subscribe(
      (res: any) => {
        if (res?.isSuccess) {
           this.dataService.setData(body["photo"]);

          //this.dialogRef.close(true);
          // this.SaveActivity();
          this.snackBar.open("User added successfully. ", "close", {
            panelClass: "snackBarSuccess",
            duration: 2000,
          });
        } else {
          this.snackBar.open(res.data, "close", {
            panelClass: "snackBarWarning",
            duration: 2000,
          });
        }
        this.isLoadingSpinner=false;
      },
      (error: any) => {
       this.isLoadingSpinner=false;
        console.warn("error", error);
      },
    );
    // // console.log(this.photo);
    // this.isLoadingSpinner=true;
    // let nameParts = this.accountForm.get("name").value.trim().split(/\s+/); // Split by spaces and remove extra spaces
    // let firstName = nameParts.slice(0, 2).join(" "); // Take the first two words as first name
    // let lastName = nameParts.slice(2).join(" "); // Take the rest as last name
    // this.accountForm.markAsPristine();
    // console.log(name)
    // let body:any
    // if(this.accountInfo?.isadmin_account){
    //   body ={
    //     userid: this.userInfo.user_id,
    //     username: this.accountForm.get("email").value,
    //     emailaddress:this.accountForm.get("email").value,
    //     firstname:this.capitalizeFirstLetter(firstName),
    //     lastname: this.capitalizeFirstLetter(lastName),
       
    //     mobileno: this.accountForm.get("phone").value.number,  
    //     roleid: this.accountInfo.role_id,
    //     actionby: this.userInfo.user_id,
        
    //     isphoto_updated: this.accountForm.get("isPhotoUpdated").value,
        
    //     adminaccount: this.accountInfo.admin_account,
    //     clinicid: this.accountInfo.refered_clinicid,
    //     undermainbranch: this.accountInfo.under_mainbranch,
    //     isadminaccount: this.accountInfo.isadmin_account,
    //     contactperson: undefined,
    //     appname:'HLKD',
    //   }
    // }else{
    //   body = {
    //     userid: this.userInfo.user_id,
    //     username: this.accountForm.get("email").value,
    //     password: "test@1234",
    //     firstname:this.capitalizeFirstLetter(firstName),
    //     lastname: this.capitalizeFirstLetter(lastName),
    //     emailaddress: this.accountForm.get("email").value,
    //     mobileno: this.accountForm.get("phone").value.mobileno,
    //     roleid: this.accountInfo.role_id,
    //     actionby: this.userInfo.user_id,
    //     medicalregistrationno: this.accountForm.get("medRegn").value,
    //     specialityid:this.accountForm.get("specialityid").value,
    //     education_info: this.accountForm.get("education").value,
    //     expyears: parseInt(this.accountForm.get("expYears").value),
    //     profiledescription: this.accountForm.get("profiledescription").value,
    //     fees:this.accountForm.get("fees").value,
    //     languages:this.accountForm.get("languages").value,
    //     isphoto_updated: this.accountForm.get("isPhotoUpdated").value,
    //     user_gender: this.accountForm.get("gender").value,
    //     adminaccount: this.accountInfo.admin_account,
    //     clinicid: this.accountInfo.refered_clinicid,
    //     undermainbranch: this.accountInfo.under_mainbranch,
    //     isadminaccount: this.accountInfo.isadmin_account,
    //     contactperson: undefined,
    //     appname:'HLKD',
    //   };
    // }
    
    
    // if (this.mimetype && this.fileBase64) {
    //   body["photo"] = {
    //     patientreportid: 0,
    //     filename: this.filename,
    //     mimetype: this.mimetype,
    //     fileBase64: this.fileBase64,
    //   }
    // }
    // // if(this.accountInfo.admin_account !== 3 && this.accountInfo.isadmin_account) {
    // //   body.isadminaccount = true;
    // //   body.contactperson = this.capitalizeFirstLetter(this.accountForm.get("name").value);
    // //   body.firstname = undefined;
    // //   body.lastname = undefined
    // // } 
    // console.log(body);
    // this.httpService.create("api/User/UpdateUser", body).subscribe(
    //   (res: any) => { 
    //     this.isLoadingSpinner=false;
    //     console.warn(res);
    //     this.dataService.setData(body["photo"]);
    //     this.getUserInfo(this.userInfo.user_id);
    //     this.SaveActivity();
    //     this.snackBar.open("User updated successfully.", "close", {
    //       panelClass: "snackBarSuccess",
    //       duration: 2000,
    //     }); 
    //   },
    //   (error: any) => {
    //     console.warn("error", error);
    //   }
    // );
  }

  formatPhoneNumber(phoneNumber: string): string {
    // Remove all spaces
    //let formattedNumber = phoneNumber.replace(/\s+/g, '');
    let formattedNumber = phoneNumber.replace(/[\s\(\)\-\+]/g, "");

    // Remove the leading zero, if it exists
    if (formattedNumber.startsWith("0")) {
      formattedNumber = formattedNumber.substring(1);
    }

    return formattedNumber;
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

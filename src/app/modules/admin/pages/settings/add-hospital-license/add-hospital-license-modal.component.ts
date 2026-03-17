import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { APIService } from "app/core/api/api";
import { AuthService } from "app/core/auth/auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { AddressComponent as gAddressComponent } from "ngx-google-places-autocomplete/objects/addressComponent";

@Component({
  selector: 'app-add-hospital-license-modal',
  templateUrl: './add-hospital-license-modal.component.html',
  styleUrls: ['./add-hospital-license-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddHospitalLicenseModalComponent implements OnInit {

  userForm: FormGroup;
  userInfo: any;
  editMode: boolean = false;
  userActionLoading:boolean = false;
  mimetype:string;
  filename:any;
  fileBase64:any;
  options: any = {
    componentRestrictions: { country: 'IN' }
  }  

  @ViewChild('addressInput') addressInput: ElementRef;


  photo:any;
  isDataUpdated:boolean = false;
  isPhotoUpdated:boolean = false;
  roles= [
    {
      "masterdata_id": 4,
      "data_name": "Care Team"
    },
    {
      "masterdata_id": 5,
      "data_name": "Doctor"
    },
    {
      "masterdata_id": 6,
      "data_name": "Customer Support"
    },
    {
      "masterdata_id": 478,
      "data_name": "Hospital Admin"
    }
  ];

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<any>,
    private _formBuilder: FormBuilder,
    private cd: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private httpService: APIService,
    private auth: AuthService,
    private snackBar: MatSnackBar) {
    this.userInfo = JSON.parse(this.auth.user);
  }


  ngOnInit(): void {
    this.userForm = this._formBuilder.group({ 
      // firstName: ["", [Validators.required]],
      // lastName: ["", [Validators.required]],
      contactPersonName: ['', []],
      clinicAddress: ['', [Validators.required]],
      // clinicMobileNumber: ['',  [Validators.required,
      //   Validators.minLength(10),
      //   Validators.maxLength(10),
      //   Validators.pattern('[6-9]\\d{9}')
      // ]],
      hospitalName: ['', [Validators.required]],
      pincode: ['', {readonly:true}],
      locality: [''],
      country:[''],
      state: [''],
      cityName: ['', [Validators.required]],
      email: [{ value: null, disabled: true }, [Validators.required, Validators.email]],
      mobileNumber: [
        { value: null, disabled: true },
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10),
          Validators.pattern('[6-9]\\d{9}')
        ],
      ],
      // customerSupportNumber: [
      //   "",
      //   [Validators.required,
      //     Validators.minLength(10),
      //     Validators.maxLength(10),
      //     Validators.pattern('[6-9]\\d{9}')
      //   ],
      // ],
      supportemail:[{value:'support@clintel.health'},[Validators.required]],
      roleId: [5, [Validators.required]],
    });
    console.log(this.data.accountInfo);
    if(this.data && this.data.accountInfo) {
      this.patchForm(this.data.accountInfo);
    }
  } 

  private findType( addr : Address, type : string ) : string {
    let comp : gAddressComponent = addr.address_components.find((item : gAddressComponent) => item.types.indexOf(type) >= 0);
    return comp ? comp.long_name : null;
}



  handleAddressChange(address: Address) {

    // this.userForm.get('clinicAddress').setValue(address.formatted_address);
    
    let district = this.findType(address, "administrative_area_level_2");
    this.userForm.get('cityName').setValue(district);
     
    let country = this.findType(address, "country");
    this.userForm.get('country').setValue(country);

    let state = this.findType(address, "administrative_area_level_1");
    this.userForm.get('state').setValue(state);

    let pincode = this.findType(address, "postal_code");
    this.userForm.get('pincode').setValue(pincode);

    let locality = this.findType(address, "neighborhood");
    this.userForm.get('locality').setValue(locality);

    
  }


  patchForm(data: any) {

    this.userForm.patchValue({
      contactPersonName: data.contactperson_name,
      hospitalName: data.full_name,
      cityName: data.city,
      email: data.email_address,
      mobileNumber: data.mobile_no,
      roleId: 5,
      clinicAddress: data.hospital_address,
      clinicMobileNumber: data.clinic_mobileno,
      pincode: data.pincode,
      country: data.country,
      state: data.state,
      locality: data.locality,
      customerSupportNumber: data.customer_supportno,
      supportemail:data.support_email,
    });

    if (data.logo_folderpath && data.logo_filename) {
      this.photo = `https://hellokidneydata.s3.ap-south-1.amazonaws.com/${data.logo_folderpath}/${data.logo_filename}`;
    }
  }

  addUser() {
    this.userActionLoading = true;

    let body = {
      userid: this.data && this.data.accountInfo ? this.data.accountInfo.user_id  : 0,
      username: this.userForm.get("email").value,
      password: 'test@1234',
      hospitalname: this.userForm.get("hospitalName").value, 
      cityname: this.userForm.get("cityName").value,
      contactpersonname: this.userForm.get("contactPersonName").value,
      isphoto_updated : false,
      islogo_uploaded: false,
      emailaddress: this.userForm.get("email").value,
      mobileno: this.userForm.get("mobileNumber").value,
      roleid: parseInt(this.userForm.get("roleId").value),
      actionby: this.userInfo.user_id,
      isadminaccount: true,
      adminaccount: 0,
      clinicmobileno: this.userForm.get("clinicMobileNumber").value,
      hospitaladdress: this.addressInput.nativeElement.value,    
      specialityid: this.data && this.data.accountInfo ? this.data.accountInfo.speciality_id : 0,
      pincodeno: this.userForm.get('pincode').value?(this.userForm.get('pincode').value).toString():null,
      countryname: this.userForm.get('country').value,
      statename: this.userForm.get('state').value,
      localityname: this.userForm.get('locality').value,
      customer_supportno: this.userForm.get('customerSupportNumber').value,
      support_email:this.userForm.get('supportemail').value,
      appname:"HWR"
    };
    if (this.isPhotoUpdated && this.fileBase64) {
      body['cliniclogo'] = {
        "patientreportid": 0,
        "filename": this.filename,
        "mimetype": this.mimetype,
        "fileBase64": this.fileBase64    
      };
      body.islogo_uploaded = this.isPhotoUpdated;
    }

    this.httpService.create("api/User/AddClinic", body).subscribe(
      (res: any) => {

        if(res?.isSuccess) {
          this.dialogRef.close(true);
          this.snackBar.open('Hospital license updated successfully. ', 'close', {
            panelClass: "snackBarSuccess",
            duration: 2000,
          });
        }else {
          this.snackBar.open(res.data, 'close', {
            panelClass: "snackBarWarning",
            duration: 2000,
          });
        }
        this.isDataUpdated = true;
        this.userActionLoading = false;
      },
      (error: any) => {
        this.userActionLoading = false;
        console.warn("error", error);
      }
    );
  }

 

  clearInput(event?:any) {
    if(event) {
      event.value = '';
    }
    this.fileBase64 = undefined;
    this.mimetype = undefined;
    this.filename = undefined;
    this.photo = undefined;
    this.isPhotoUpdated = false;
  }

  onSelectFile(event) {
    
    this.clearInput();
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
        this.isPhotoUpdated = true;
        
      }.bind(this);
      
      reader.readAsDataURL(file); 
      
    }
  }

}

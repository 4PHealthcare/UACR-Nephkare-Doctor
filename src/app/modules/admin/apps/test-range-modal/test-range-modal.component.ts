import { Component, OnInit, ViewChild, Inject } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { APIService } from "app/core/api/api";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "app/core/auth/auth.service";

@Component({
  selector: "app-test-range-modal",
  templateUrl: "./test-range-modal.component.html",
  styleUrls: ["./test-range-modal.component.scss"],
})
export class TestRangeModalComponent implements OnInit {
  testRangeForm: FormGroup;
  userInfo: any;
  isEditMode:boolean=false;
  specimens:any [] = [];
  departments:any[] = [];
  @ViewChild("testRangeFormNGForm") testRangeFormNGForm: NgForm;
  noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control && control.value && control.value.toString() || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }
  constructor(
    private _matDialogRef: MatDialogRef<TestRangeModalComponent>,
    public dialogRef: MatDialogRef<any>,
    private _formBuilder: FormBuilder,
    private httpService: APIService,
    private snackBar: MatSnackBar,
    private auth: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userInfo = JSON.parse(this.auth.user);
  }

  ngOnInit(): void {
    console.log( this.data);
    this.testRangeForm = this._formBuilder.group({
      testName: ["", [Validators.required]],
      referanceRange: ["", [Validators.required,this.noWhitespaceValidator
      ]],
      testUnits: ["", [Validators.required,this.noWhitespaceValidator
      ]],
      specimen:["", [Validators.required]],
      department:["",[Validators.required]],
      neutral_min_age: [""],
      neutral_max_age: [""],
      neutral_min_value: [""],
      neutral_max_value: [""],
      male_min_age: [""],
      male_max_age: [""],
      male_min_value: [""],
      male_max_value: [""],
      female_min_age: [""],
      female_max_age: [""],
      female_min_value: [""],
      female_max_value: [""],
    });
   

    this.getMasterDataInfo(71);
    this.getMasterDataInfo(72);

    if (this.data && this.data.data) {
      this.isEditMode = true;
     
    } 
    
}
updatePatchValue() {
  this.testRangeForm.patchValue({
    testName: this.data.data.hospital_test_name,
    referanceRange:this.data.data.range,
    testUnits:this.data.data.unit,
    neutral_min_age:this.data.data.neutral_minage,
    neutral_max_age:this.data.data.neutral_maxage,
    neutral_min_value:this.data.data.neutral_minvalue,
    neutral_max_value:this.data.data.neutral_maxvalue,
    male_min_age:this.data.data.male_minage,
    male_max_age:this.data.data.male_maxage,
    male_min_value:this.data.data.male_minvalue,
    male_max_value:this.data.data.male_maxvalue,
    female_min_age:this.data.data.female_minage,
    female_max_age:this.data.data.female_maxage,
    female_min_value:this.data.data.female_minvalue,
    female_max_value:this.data.data.female_maxvalue,
    specimen: this.data.data.sample_type,
    department: this.data.data.department
  });
}

getMasterDataInfo(type) {
  const url = `api/User/GetMasterData?mastercategoryid=` + type;
  this.httpService.getAll(url).subscribe(
    (res: any) => {
      switch (type) {
        case 71:
          this.specimens = res.data;
          break;
        case 72:
          this.departments = res.data;
          if (this.data && this.data.data) {
            this.updatePatchValue();
          } 
          break;          
        default:
      }
    },
    (error: any) => {
      console.log("error", error);
    }
  );
}

  dismiss() {
    this._matDialogRef.close();
  }
  save() {
    let payload = {
      
      hospitallabid: this.data.data.hospital_labid,
      hospitaladminid:this.userInfo.admin_account,
      hospitaltestname: this.testRangeForm.value.testName,
      testrange: this.testRangeForm.value.referanceRange,
      testunit: this.testRangeForm.value.testUnits,
      neutralminage: this.testRangeForm.value.neutral_min_age !== null ? this.testRangeForm.value.neutral_min_age: undefined,
      neutralmaxage: this.testRangeForm.value.neutral_max_age !== null ? this.testRangeForm.value.neutral_max_age: undefined,
      neutralminvalue: this.testRangeForm.value.neutral_min_value !== null ? this.testRangeForm.value.neutral_min_value: undefined,
      neutralmaxvalue: this.testRangeForm.value.neutral_max_value !== null? this.testRangeForm.value.neutral_max_value: undefined,
      maleminage: this.testRangeForm.value.male_min_age !== null ? this.testRangeForm.value.male_min_age: undefined,
      malemaxage: this.testRangeForm.value.male_max_age !== null ? this.testRangeForm.value.male_max_age: undefined,
      maleminvalue: this.testRangeForm.value.male_min_value !== null ? this.testRangeForm.value.male_min_value: undefined,
      malemaxvalue: this.testRangeForm.value.male_max_value !== null ? this.testRangeForm.value.male_max_value: undefined,
      femaleminage: this.testRangeForm.value.female_min_age !== null ? this.testRangeForm.value.female_min_age : undefined,
      femalemaxage: this.testRangeForm.value.female_max_age !== null ? this.testRangeForm.value.female_max_age: undefined,
      femaleminvalue: this.testRangeForm.value.female_min_value !== null ? this.testRangeForm.value.female_min_value : undefined,
      femalemaxvalue: this.testRangeForm.value.female_max_value !== null ? this.testRangeForm.value.female_max_value : undefined,
      specimen: this.testRangeForm.value.specimen,
      department: this.testRangeForm.value.department
    
    };

    this.httpService
      .create("api/Lab/UpdateLabTestsHospital", payload)
      .subscribe(
        (res: any) => {
          if (res?.isSuccess) {
            this.dialogRef.close(true);
            let saveMsg = 'Test generators saved successfully.';

            if (this.data.data.hospital_labid) {
              saveMsg = 'Test generators updated successfully.'
            }
            this.snackBar.open(saveMsg, "close", {
              panelClass: "snackBarSuccess",
              duration: 2000,
            });
          } else {
            this.snackBar.open(res.data, "close", {
              panelClass: "snackBarWarning",
              duration: 2000,
            });
          }
        },
        (error: any) => {
          console.warn("error", error);
        }
      );
  }
  clear() {
    this.testRangeFormNGForm.resetForm();
    this.updatePatchValue();
  }
}

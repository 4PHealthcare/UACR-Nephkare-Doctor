import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, NgForm, Validators,AbstractControl } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { APIService } from "app/core/api/api";
import { AuthService } from "app/core/auth/auth.service";

@Component({
  selector: 'app-menustrual-history',
  templateUrl: './menustrual-history.component.html',
  styleUrls: ['./menustrual-history.component.scss']
})
export class MenustrualHistoryComponent implements OnInit {
  frequency: any[] = [{name: 'Regular', id: 164}, {name: 'Irregular', id: 165}];
  menorrhagia: string[] = ["Yes", "No"];
  cheifComplaintForm: FormGroup;
  submitted = false;
  userInfo: any;
  @ViewChild("cheifComplaintNGForm") chiefComplaintNGForm: NgForm;
  isLoadingSpinner:boolean=false;

  constructor(
    private _formBuilder: FormBuilder,
    private httpService: APIService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>,
    private auth: AuthService,
  ) {
    this.userInfo = JSON.parse(this.auth.user);
  }

  ngOnInit(): void {
    console.log(this.data)
    // Create the form
    this.cheifComplaintForm = this._formBuilder.group({
      frequency: ["", [Validators.required]],
      menorrhagia: [""],
      menopause:[""]
    });
    if (
      this.data &&
      this.data.menstrual &&
      this.data.menstrual.menstral_id
    ) {
      this.updateForm();
    }
  }

  updateForm() {
    this.cheifComplaintForm.patchValue({
      frequency: this.data.menstrual.frequency_id,
      menorrhagia: this.data.menstrual.is_Menorrhagia == true ? 'Yes' : 'No',
      menopause: this.data.menstrual.menorrhagia_age,
    })
  }

  get f(): { [key: string]: AbstractControl } {
    return this.cheifComplaintForm.controls;
  }

  deleteMenstrualHistory() {
    const url =
          `api/SocialAndSurgicalHistory/DeleteMenstralHistory?historyId=`+this.data.menstrualHistory[0].menstral_id;
        this.httpService.getAll(url).subscribe(
          (res: any) => {
            if (res?.isSuccess) {
             
            }
          },
          (error: any) => {
            console.log("error", error);
          }
        );
  }

  onSubmit() {
    this.submitted = true;
    this.isLoadingSpinner=true;
    if (this.cheifComplaintForm.invalid) {
      return;
    }

    if (this.data.menstrualHistory && this.data.menstrualHistory.length !== 0) {
        this.deleteMenstrualHistory();
    }

    const body = {
      menstralid: this.data.menstrual ? this.data.menstrual.menstral_id : 0,
      patientid: parseInt(this.data.userId),
      appointmentid: 0,
      frequencyid: this.cheifComplaintForm.get('frequency').value,
      ismenorrhagia: this.cheifComplaintForm.get('menorrhagia').value == 'Yes' ? true : false,
      menorrhagiaage: this.cheifComplaintForm.get('menopause').value  ? parseInt(this.cheifComplaintForm.get('menopause').value): undefined,
      createdby: this.userInfo.user_id
    };
    const url = `api/SocialAndSurgicalHistory/SaveMenstralHistory`;
    this.httpService.create(url, body).subscribe((res: any) => {
      if(res.data){ 
        this.isLoadingSpinner=false;
        this.snackBar.open("Menstrual history saved successfully.", "close", {
          panelClass: "snackBarSuccess",
          duration: 2000,
        });
      }
      // this.dialogRef.close(true);

    });
    console.log(JSON.stringify(this.cheifComplaintForm.value, null, 2));
  }

  onReset(): void {
    this.submitted = false;
    // this.cheifComplaintForm.reset();
    this.dialogRef.close();
  }

}

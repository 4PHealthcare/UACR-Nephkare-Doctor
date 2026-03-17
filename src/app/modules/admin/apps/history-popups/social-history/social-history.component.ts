import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, NgForm, Validators,AbstractControl } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { APIService } from "app/core/api/api";

@Component({
  selector: 'app-social-history',
  templateUrl: './social-history.component.html',
  styleUrls: ['./social-history.component.scss']
})
export class SocialHistoryComponent implements OnInit {
  Smoking_Status: string[] = ["Current Smoker", "Past Smoker", "Non Smoker"];
  alcohol_Status: string[] = ["Current Alcoholic", "Past Alcoholic", "Non Alcoholic"];
  cheifComplaintForm: FormGroup;
  submitted=false;
  smoking_historyid:any;
  alcohol_historyid:any;
  @ViewChild("cheifComplaintNGForm") chiefComplaintNGForm: NgForm;
  smokingaacholFrequencies: any;
  isLoadingSpinner:boolean=false;

  constructor(
    private _formBuilder: FormBuilder,
    private httpService: APIService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>
  ) {}

  ngOnInit(): void {
    // Create the form
    this.cheifComplaintForm = this._formBuilder.group({
      smoking: [""],
      _smoking_quantity:[""],
      _smoking_frequency:[""],
      alcohol: [""],
      _alcohol_quantity:[""],
      _alcohol_frequency:[""],
      
    });
    this.getSmokingAlcholFrequency();
     
    if (this.data && this.data?.smoking && this.data.smoking.smoking_historyid) {
      this.smoking_historyid=this.data.smoking.smoking_historyid;
      this.updateSmokongForm();
    }


    
    
    if (this.data && this.data?.alchol && this.data.alchol.alcohol_historyid) {
      this.alcohol_historyid=this.data.alchol.alcohol_historyid;
      this.updateAlcholForm();
    }

  }

  updateSmokongForm() {
    this.cheifComplaintForm.patchValue({
      smoking: this.data.smoking.smoking_history == true ? 'Current Smoker' : this.data.smoking.past_smoker == true ? 'Past Smoker' : 'Non Smoker',
      _smoking_quantity: this.data.smoking.smoking_quantity,
      _smoking_frequency: this.data.smoking.smoking_frquencyid,
    })
  }

  updateAlcholForm() {
    this.cheifComplaintForm.patchValue({
      alcohol: this.data.alchol.alcohol_history == true ? 'Current Alcoholic' : this.data.alchol.past_alcoholic == true ? 'Past Alcoholic' : 'Non Alcoholic',
      _alcohol_quantity: this.data.alchol.alcohol_quantity,
      _alcohol_frequency: this.data.alchol.alcohol_frquencyid,
    })
  }

  get f(): { [key: string]: AbstractControl } {
    return this.cheifComplaintForm.controls;
  }
  onSubmit() {
    this.submitted = true;
 
    if ( !this.cheifComplaintForm.get('smoking').value && !this.cheifComplaintForm.get('alcohol').value) {
      return;
    }
       this.isLoadingSpinner=true;
    if (this.cheifComplaintForm.get('smoking').value !== '') {
      const smokingData = {
        smokinghistoryid: this.data?.smoking ? this.data.smoking.smoking_historyid : 0,
        patientid: parseInt(this.data.userId),
        appointmentid: 0,
        smokinghistory: this.cheifComplaintForm.get('smoking').value === 'Current Smoker' ? true : false,
        smokingquantity: this.cheifComplaintForm.get('_smoking_quantity').value ? this.cheifComplaintForm.get('_smoking_quantity').value : "0",
        smokingfrquencyid: this.cheifComplaintForm.get('_smoking_frequency').value ? this.cheifComplaintForm.get('_smoking_frequency').value : 0,
        smokingstatus: this.cheifComplaintForm.get('smoking').value === 'Current Smoker' ? 27 : 28,
        pastsmoker: this.cheifComplaintForm.get('smoking').value === 'Past Smoker' ? true : false,
      };
      this.saveSmokingHistory(smokingData);
    }
    if (this.cheifComplaintForm.get('alcohol').value !== '') {
      const alcholData = {
        alcoholhistoryid: this.data?.alchol ? this.data.alchol.alcohol_historyid : 0,
        patientid: parseInt(this.data.userId),
        appointmentid: 0,
        alcoholhistory: this.cheifComplaintForm.get('alcohol').value === 'Current Alcoholic' ? true: false,
        alcoholquantity: this.cheifComplaintForm.get('_alcohol_quantity').value ? this.cheifComplaintForm.get('_alcohol_quantity').value : "0",
        alcoholfrquencyid: this.cheifComplaintForm.get('_alcohol_frequency').value ? this.cheifComplaintForm.get('_alcohol_frequency').value : 0,
        alcoholstatus: this.cheifComplaintForm.get('alcohol').value === 'Current Alcoholic' ? 27 : 28,
        pastalcoholic: this.cheifComplaintForm.get('alcohol').value === 'Past Alcoholic' ? true : false,
      };
      this.saveAlcholHistory(alcholData);
    }
  }
  onReset(): void {
    this.submitted = false;
    if(this.smoking_historyid || this.alcohol_historyid){
      this.dialogRef.close();
    }else{
      this.cheifComplaintForm.reset();
    }
   
   
  }

  getSmokingAlcholFrequency() {
    const url = `api/User/GetMasterData?mastercategoryid=23`;
    this.httpService.getAll(url).subscribe((res: any) => {
      this.smokingaacholFrequencies = res.data; 
    });
  }

  saveSmokingHistory(body) {
    const url = `api/SocialAndSurgicalHistory/SaveSmokingHistory`;
    this.httpService.create(url, body).subscribe((res: any) => {
      console.log(res);
      this.isLoadingSpinner=false;
      if(res.data){ 
        if(!this.smoking_historyid) {
          this.smoking_historyid = res.data;
          this.data['smoking'] = {
            'smoking_historyid' : res.data
          }
        }

        if(this.smoking_historyid){
          this.snackBar.open("Social Determinants of Health history Saved successfully.", "close", {
            panelClass: "snackBarSuccess",
            duration: 2000,
          });
        }else{
          this.snackBar.open("Social Determinants of Health history updated  successfully.", "close", {
            panelClass: "snackBarSuccess",
            duration: 2000,
          });
        }
      }
        
      // this.dialogRef.close(true);
    });
  }

  saveAlcholHistory(body) {
    const url = `api/SocialAndSurgicalHistory/SaveAlchohalHistory`;
    this.httpService.create(url, body).subscribe((res: any) => {
      this.isLoadingSpinner=false;

      if(res.data){   
        if(!this.alcohol_historyid) {
          this.alcohol_historyid = res.data;
          this.data['alchol'] = {
            'alcohol_historyid': res.data
          }
        }
        if(this.smoking_historyid){
          this.snackBar.open("Social Determinants of Health history Saved successfully.", "close", {
            panelClass: "snackBarSuccess",
            duration: 2000,
          });
        }else{
          this.snackBar.open("Social Determinants of Health history updated  successfully.", "close", {
            panelClass: "snackBarSuccess",
            duration: 2000,
          });
        }
      }
      // this.dialogRef.close(true);
    });
  }

}

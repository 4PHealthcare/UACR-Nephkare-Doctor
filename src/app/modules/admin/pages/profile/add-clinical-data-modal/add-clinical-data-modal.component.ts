import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  NgForm,
  Validators,
  FormControl,
  AbstractControl,
} from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { APIService } from "app/core/api/api";
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import * as moment from "moment";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";

@Component({
  selector: "app-add-clinical-data-modal",
  templateUrl: "./add-clinical-data-modal.component.html",
  styleUrls: ["./add-clinical-data-modal.component.scss"],
})
export class AddClinicalDataModalComponent implements OnInit {
  clincicalDataForm: FormGroup;
  submitted = false;
  editMode = false;
  deletedReports: any = [];
  symptoms: any = [
    {
      name: "Swelling of feet and face",
      checked: false,
    },
    {
      name: "Weakness, fatigue, headache",
      checked: false,
    },
    {
      name: "Lack of interest to eat",
      checked: false,
    },
    {
      name: "Breathing difficulty",
      checked: false,
    },
    {
      name: "Reduced urination",
      checked: false,
    },
    {
      name: "Body pain, muscle pain",
      checked: false,
    },
    {
      name: "Urination at night",
      checked: false,
    },
    {
      name: "Reddish colour in urine",
      checked: false,
    },
    {
      name: "Chest discomfort",
      checked: false,
    },
    {
      name: "Vomiting and burning in the stomach",
      checked: false,
    },
    {
      name: "Pain in loin",
      checked: false,
    },
  ];

  riskFactors: any = [
    {
      name: "Diabetes mellitus",
      checked: false,
    },
    {
      name: "High Blood Pressure",
      checked: false,
    },
    {
      name: "Heart disease",
      checked: false,
    },
    {
      name: "Overweight / obesity",
      checked: false,
    },
    {
      name: "Multiple kidney stones",
      checked: false,
    },
    {
      name: "Urine infection in the past",
      checked: false,
    },
    {
      name: "Family history of kidney disease",
      checked: false,
    }
  ];
  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  isFormData: boolean = false;
  patId:any;
  private _unsubscribeAll: Subject<void> = new Subject<void>();

  secondOpinionOverviewDetails:any;
  urls: any[] = [];
  new_urls: any[] = [];
  edit_urls:any[] = [];
  @ViewChild("clincicalDataNGForm") clincicalDataNGForm: NgForm;
  constructor(
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private httpService: APIService
  ) {}

  ngOnInit(): void {
    
    this.patId =  this.data.data;
    this.secondOpinionOverviewDetails=this.data.secondOpinionData;
    console.log(this.secondOpinionOverviewDetails);
    
    this.clincicalDataForm = new FormGroup({
      healthinfo: new FormControl("", Validators.required),
      healthproblem: new FormControl(""),
      painkiller_used: new FormControl("", Validators.required),
      do_smoke: new FormControl("", Validators.required),
      selectedtype:new FormControl("text", Validators.required),  
      do_drink: new FormControl("", Validators.required),
    });
    if(this.data && this.data.secondOpinionData){
      this.updateFormData(this.secondOpinionOverviewDetails)
    }
  }
  updateFormData(data:any) {
    console.log(data)
    this.clincicalDataForm.patchValue({
      healthinfo: data.health_info,
      healthproblem: data.health_problem,
      painkiller_used:data.painkiller_used ? 'yes' : 'no',
      do_smoke:data.do_smoke ? 'yes' : 'no',
      do_drink:data.do_drink ? 'yes' : 'no' 
     });

     let symptoms_array = data.symptoms.split(',');
     let riskFactors_array = data.risk_factors.split(',');
     symptoms_array = symptoms_array.map(function (el) {
      return el.trim();
    });
    riskFactors_array = riskFactors_array.map(function (el) {
      return el.trim();
    });
    
    this.getSelectedSymptoms(symptoms_array);
    this.getSelectedRiskFactors(riskFactors_array); 
     
     console.log(data.reports.filter(file => !(file.mime_type).match("audio")))
    this.edit_urls = (data.reports.filter(file => !(file.mime_type).match("audio"))).map(function(file:any){
      file.edit = true;
      file.src = `https://hellokidneydata.s3.ap-south-1.amazonaws.com/${file.folder_path}/${file.file_name}`;
      return file;
    });

  }
  getSelectedSymptoms(symptoms:any) {
   console.log(symptoms);
    this.symptoms = this.symptoms.filter(function(e:any){
      if(symptoms.indexOf(e.name) !== -1) {
        e.checked = true;
      }
      return e;
    })
    console.log(this.symptoms);
  }

  getSelectedRiskFactors(riskFactors:any) {
    this.riskFactors = this.riskFactors.filter(function(e:any){

      if(riskFactors.indexOf(e.name) !== -1) {
        e.checked = true;
      }
      return e;
    })
  }
  changeHandler(i: number) {
    this.symptoms[i].checked = !this.symptoms[i].checked;
  }
  changeRiskHandler(i: number) {
    this.riskFactors[i].checked = !this.riskFactors[i].checked;
  }
 
  onSelectFile(event) {
    if (event.target.files && event.target.files[0]) {
     
      var filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        var reader = new FileReader();
        reader.onload = (event: any) => {
          console.log(event.target.result);
          this.urls.push(event.target.result);
          let base64ContentArray = event.target.result.split(",");
          let mimeType = base64ContentArray[0].match(
            /[^:\s*]\w+\/[\w-+\d.]+(?=[;| ])/
          )[0];
          console.log(mimeType);
          let base64Data = base64ContentArray[1];
          let fileExtenstion;
          if (mimeType && mimeType.includes('image')) {
            fileExtenstion = 'jpeg'
          } else if (mimeType && mimeType.includes('pdf')) {
            fileExtenstion = 'pdf'
          }
          console.log(base64ContentArray);
          console.log(base64Data);
         
          this.new_urls.push({
            patientreportid: 0,
            filename: `${moment().format("DDMMYYYYHHmmss")}.${fileExtenstion}`,
            mimetype: mimeType,
            fileBase64: base64Data,
            issecondopinion:true,
            
          });
        };

        reader.readAsDataURL(event.target.files[i]);
      }
      
    }
  }
  getCheckedSymptoms() {
    return this.symptoms
      .filter(function (e) {
        return e.checked;
      })
      .map(function (e) {
        return e.name;
      });
  }

  getCheckedRiskFactors() {
    return this.riskFactors
      .filter(function (e) {
        return e.checked;
      })
      .map(function (e) {
        return e.name;
      });
  }
  saveRecord() {
    let reports: any = [];
    // if(this.isFormData) {
    //   reports = this.reports.filter(report => !report.edit );
    // } else {
    //   reports = this.reports;
    // }
    const obj = {
      infoid: this.secondOpinionOverviewDetails?.info_id ? this.secondOpinionOverviewDetails?.info_id :0,
      patientid: parseInt(this.patId),
      healthinfo: this.clincicalDataForm.value.healthinfo,
      healthproblem: this.clincicalDataForm.value.healthproblem, 
      symptomsinfo: this.getCheckedSymptoms(),
      riskfactors: this.getCheckedRiskFactors(),
      reports: this.new_urls,
      painkiller_used: this.clincicalDataForm.value.painkiller_used == 'yes' ? true : false,
      do_smoke: this.clincicalDataForm.value.do_smoke == 'yes' ? true : false,
      do_drink: this.clincicalDataForm.value.do_drink == 'yes' ? true : false,
    };
    const url = `api/PatientRegistration/SaveSecondOpinion_PatientBasicInfo`;
    this.httpService.create(url, obj).subscribe((res: any) => {
      this.dialogRef.close(true);
      this.snackBar.open( this.editMode ? 'Comorbid Illnesses updated successfully.' : 'Comorbid Illnesses saved successfully. ', 'close', {
        panelClass: "snackBarSuccess",
        duration: 2000,
      });
      
    },
    (error: any) => {
        console.log('error', error);
    });
  }

  deleteReports(reports: any) {
    console.log('delete....')
    const url = `api/Investigations/DeleteReport`;

    this.httpService
      .create(url, this.deletedReports)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(
        (res: any) => {
          if (res.isSuccess && res.data) {
            this.saveRecord();
          } else {
            // this.toasterService.presentErrorToastMsg(
            //   "Failed to delete a file. Please try again"
            // );
          }
        },
        (error: any) => {
          // this.actionLoading = false;
          // this.toasterService.presentErrorToastMsg(
          //   "Failed to delete a file. Please try again"
          // );
        }
      );
  }

  save() {
    let reports: any = [];
    if(this.data.secondOpinionData) {
      reports = this.new_urls.filter((report) => !report.edit);

      if (this.deletedReports && this.deletedReports.length !== 0) {
        this.deleteReports(reports);
      } else {
        this.saveRecord();
      }
    } else {
      this.saveRecord();
    }
    
  

  }
  deleteFileNew(index: number, report: any) {
    console.log(report);
    this.new_urls.splice(index, 1);
    this.urls.splice(index, 1);
    // if (report.patientreport_id) {
    //   this.deletedReports.push(report.patientreport_id);
    // }
  }
  deleteFile(index: number, report: any) {

    this.edit_urls.splice(index, 1);
    if (report.patientreport_id) {
      this.deletedReports.push(report.patientreport_id);
    }
  }
}

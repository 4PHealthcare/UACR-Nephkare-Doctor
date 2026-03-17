import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { APIService } from 'app/core/api/api';
import { AuthService } from 'app/core/auth/auth.service';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import moment from 'moment';

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD-MMM-YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY'
  },
};

export interface DataSet
{
    id?: string;
    title?: string;
}

@Component({
  selector: 'app-report-upload',
  templateUrl: './report-upload.component.html',
  styleUrls: ['./report-upload.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class ReportUploadComponent implements OnInit {
  timings: any;
  photo: any;
  today = moment();
  uploaded = false;
  isLoadingSpinner:boolean = false;
  filename:any;
  mimetype:any;
  fileBase64:any;
  reportForm: FormGroup;
  patientId = '';
  dataChange:boolean = false;
  maxDate: Date = new Date();

  userInfo: any;
  constructor(public dialogRef: MatDialogRef<any>,
    private httpService: APIService,
    private snackBar: MatSnackBar,
    private auth: AuthService, 
    @Inject(MAT_DIALOG_DATA) public data: any) { 
      this.userInfo = JSON.parse(this.auth.user);
    }

  ngOnInit(): void {
    if(this.data) {
      this.patientId = this.data.patientid;
    }   
    this.reportForm = new FormGroup({
      reportType:  new FormControl(null, [Validators.required]),
      recordDate: new FormControl(new Date(), []),
      fileName: new FormControl("", []),
      notes: new FormControl(""),
      selectedFileType: new FormControl("", [Validators.required]),
    });

    this.reportForm.valueChanges.subscribe(() => {
      this.dataChange  = true;
    });
  }
  clearInput(event?:any) {
    if(event) {
      event.value = '';
    }
    this.fileBase64 = undefined;
    this.mimetype = undefined;
    this.filename = undefined;
    this.reportForm.controls.selectedFileType.setValue(undefined);
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
        this.reportForm.controls.selectedFileType.setValue(file.name);
        this.uploaded = false;
       
      }.bind(this);
      
      reader.readAsDataURL(file); 
      
    }
  }
  SelectUploadFIleType(){}
  saveFile() {
    this.isLoadingSpinner = true;
    let fileExtenstion = this.filename.split('.').pop();
    
    if (!fileExtenstion) {
      if (this.mimetype && this.mimetype.includes('image')) {
        fileExtenstion = '.jpeg'
      } else if (this.mimetype && this.mimetype.includes('pdf')) {
        fileExtenstion = '.pdf'
      }
      
    }
    let isPrescription = parseInt(this.reportForm.controls.reportType.value) !== 0 ? false : true;
    const bodyInvestigation = {
      investigationid: 0,
      patientid: parseInt(this.patientId),
      recorddate: this.reportForm.controls.recordDate.value ? moment(this.reportForm.controls.recordDate.value).format("YYYY-MM-DD") : undefined,
      testname: this.reportForm.controls.fileName.value,
      docnotes: this.reportForm.controls.notes.value,
      createdby: this.userInfo.user_id, 
      reportfor: parseInt(this.patientId),
      reporttypeid: parseInt(this.reportForm.controls.reportType.value),
      reportcategoryid: parseInt(this.reportForm.controls.reportType.value),
      investigationReportList: [
        {
          patientreportid: 0,
          filename: `${moment().format("DDMMYYYYHHmmss")}.${fileExtenstion}`,
          mimetype: this.mimetype,
          fileBase64: this.fileBase64
        }
      ]
    };
    // const bodyPrescrition = {
    //   prescriptionid: 0,
    //   patientid: parseInt(this.patientId),
    //   recorddate: this.reportForm.controls.recordDate.value ? moment(this.reportForm.controls.recordDate.value).format("YYYY-MM-DD") : undefined,
    //   filename: this.reportForm.controls.fileName.value,
    //   docnotes: this.reportForm.controls.notes.value,
    //   createdby: this.userInfo.user_id,
    //   reportcategoryid: parseInt(this.reportForm.controls.reportType.value),
    //   patientReports: [
    //     {
    //       patientreportid: 0,
    //       filename: `${moment().format("DDMMYYYYHHmmss")}.${fileExtenstion}`,
    //       mimetype: this.mimetype,
    //       fileBase64: this.fileBase64
    //     }
    //   ]
    // }
    const url = `api/Investigations/ManageInvestigations`;
    this.httpService.create(url, bodyInvestigation).subscribe((res: any) => {
      this.isLoadingSpinner = false;
      this.dialogRef.close(true);
      this.snackBar.open('report uploaded successfully. ', 'close', {
        panelClass: "snackBarSuccess",
        duration: 2000,
      });
    },
    (error: any) => {
        console.log('error', error);
    });
  }
}

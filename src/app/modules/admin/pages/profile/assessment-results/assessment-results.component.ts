import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { APIService } from 'app/core/api/api';

@Component({
  selector: 'app-assessment-results',
  templateUrl: './assessment-results.component.html',
  styleUrls: ['./assessment-results.component.scss']
})
export class AssessmentResultsComponent implements OnInit {

  questions:any[] = [];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private httpService: APIService,
    public dialogRef: MatDialogRef<any>
  ) { }

  ngOnInit(): void {
    console.log(this.data);

    const url = `api/Patient/GetPatientHealthAssessmentByPatientId?patientId=${this.data.patientId}&question_type=${this.data.type}`;

    this.httpService.getAll(url).subscribe(
      (res: any) => {
        console.log(res);
        if(res.data && res.data.survey_result && res.data.survey_result.length !==0){
          this.questions = res.data.survey_result;
        }
       
      },
      (error: any) => {
        console.log("error", error);
      }
    );

  }

}

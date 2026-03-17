import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from "@angular/material/dialog";
import { APIService } from 'app/core/api/api';
import { FileManagerReportViewComponent } from 'app/modules/admin/apps/file-manager/report-view/report-view.component';
import { AddClinicalDataModalComponent } from '../add-clinical-data-modal/add-clinical-data-modal.component';


@Component({
  selector: 'app-second-opinion-details', 
  templateUrl: './second-opinion-details.component.html',
  styleUrls: ['./second-opinion-details.component.scss']
})
export class SecondOpinionDetailsComponent implements OnInit {
  @Input() patient: any;
  secondOpinionOverviewDetails:any;
  constructor(public dialog: MatDialog, private httpService: APIService,) { }

  ngOnInit(): void {
    console.log(this.patient._value.user_id);
    this.getSecondOpinionOverview();
  }
  open_clinical_data_modal(SoaData?:any){ 
    this.dialog.open(AddClinicalDataModalComponent, {
      width: "50rem",
      height: "100%",
      panelClass:"no-padding-popup",
      position: { right: "0" },
      data: { data:this.patient, secondOpinionData:SoaData},
    })
    .afterClosed()
    .subscribe((data) => {
      if (data) {
         this.getSecondOpinionOverview();
      }
    });
  }
  getSecondOpinionOverview(){
    this.httpService
    .getAll(`api/PatientRegistration/GetPatient_SecondOpinion_Overview?patientid=${this.patient._value.user_id}`)
    .subscribe(
      (res: any) => {
      if(res.data) {
        this.secondOpinionOverviewDetails = res.data.medical_info ;
        console.log(this.secondOpinionOverviewDetails)
      } 
      },
      (error: any) => {
        console.warn("error", error);
      }
    );
  }
  openDocuments(reports) {
    console.log(reports);
    this.dialog
        .open(FileManagerReportViewComponent, { 
          width: "65rem",
          height: "100%",
          panelClass: "no-padding-popup",
          position: { right: "0" },
          data: { patientid: this.patient._value.user_id, reports},
        })
        .afterClosed()
        .subscribe((data) => {
          if (data) {
            // this.getPatientInfo();
            // this.getvalues();
          }
        });

    
  }
}

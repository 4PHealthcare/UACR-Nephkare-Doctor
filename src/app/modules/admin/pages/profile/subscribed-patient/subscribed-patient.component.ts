import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { APIService } from "app/core/api/api";

@Component({
  selector: 'app-subscribed-patient',
  templateUrl: './subscribed-patient.component.html',
  styleUrls: ['./subscribed-patient.component.scss']
})
export class SubscribedPatientComponent implements OnInit {
  patientId:any;
  subscriptionObj:any={};
  @Input() isSecondOpinionTab: boolean;
  @Input() isSubscribedPatient:boolean;

  constructor(public route: ActivatedRoute , private httpService: APIService) { }

  ngOnInit(): void {
    this.patientId = this.route.snapshot.queryParamMap.get("id");
    this.get_subsription_data(this.patientId)
  }
  get_subsription_data(id){
    const url1 = `api/Patient/GetPatientLatest_OpinionPlan?patientid=${id}`;
    this.httpService.getAll(url1).subscribe( 
      (res: any) => {
        if (res.isSuccess && res.data) {
         console.log(res.data);
         this.subscriptionObj = res.data;
        }
      },
      (error: any) => {
        console.warn("error", error);
      }
    );
  }

}

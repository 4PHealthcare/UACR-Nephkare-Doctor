import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { APIService } from 'app/core/api/api';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
  selector: 'app-patient-set-up',
  templateUrl: './patient-set-up.component.html',
  styleUrls: ['./patient-set-up.component.scss']
})
export class PatientSetUpComponent implements OnInit {
  sosSetUpForm: FormGroup;
  @ViewChild("sosSetUpNGForm") sosSetUpNGForm: NgForm;
  patientId: any;
  user: any;
  ccdDetails: any[]=[];
  clintel_paymentid: any;
  
  constructor(private router: Router,  private httpService: APIService, private route: ActivatedRoute, private auth: AuthService,private snackBar: MatSnackBar, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.patientId = this.route.snapshot.queryParamMap.get("id");
    this.user = JSON.parse(this.auth.user);
    console.log(this.user)
    this.intiateSosForm();
    this.getCordinatorHospitalData();
    this.getSubscriptionList();
    this.getSetupDetailsByPatientID(this.patientId);
  }
  intiateSosForm(){
    this.sosSetUpForm = new FormGroup({
      subscription_id:new FormControl(''),
      careCordinatorId: new FormControl(null,Validators.required),
      hospitalEmergancyNo:new FormControl('',[Validators.required,
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.pattern('[6-9]\\d{9}')])
    });
  }
  getCordinatorHospitalData(){
    const url1 = `api/Patient/GetClintelPatient_Coordinator_EmergencyNo?admin_id=${this.user.admin_account}&patient_id=${this.patientId}`;
    this.httpService.getAll(url1).subscribe(
      (res: any) => {
        if (res.isSuccess && res.data) {
         this.ccdDetails = res.data.cod_details;
        }
      },
      (error: any) => {
        console.warn("error", error);
      }
    );
  }
  getSubscriptionList(){
    this.httpService.getAll(`api/Patient/GetClintelPatient_SubscriptionPaymentDetails?patientid=${this.patientId}`).subscribe((rsp)=>{
      if(rsp.data){
        this.clintel_paymentid = rsp.data[0].clintel_paymentid;
        
      }
    })
  }
  async getSetupDetailsByPatientID(id:number){ 
    const url1 = `api/Patient/GetClintelPatient_CoordinatorDetails?patient_id=${id}`;
    this.httpService.getAll(url1).subscribe(
      (res: any) => {
        if (res.isSuccess && res.data) {
          
        //  this.patchForm(res.data);
        //  this.cd.detectChanges();
         this.sosSetUpForm.patchValue({
          subscription_id:res.data.clintel_paymentid,
          careCordinatorId: res.data.assigned_to_careteam,
          hospitalEmergancyNo:res.data.hospital_emergency_no
        })
         this.cd.detectChanges();

        }
      },
      (error: any) => {
        console.warn("error", error);
      }
    );
  }
  patchForm(data){
    this.sosSetUpForm.patchValue({
      subscription_id:data.clintel_paymentid,
      careCordinatorId: data.assigned_to_careteam,
      hospitalEmergancyNo:data.hospital_emergency_no
    })
    this.cd.detectChanges()
    
  }
  saveSetUp(){
    let payload ={
      "subscription_id":this.clintel_paymentid,
      "patient_id": Number(this.patientId),
      "cordinator_id": this.sosSetUpForm.controls.careCordinatorId.value,
      "hospital_emergency_no":this.sosSetUpForm.controls.hospitalEmergancyNo.value

    }
    const url = "api/Patient/SaveCLintelPatientSubscription_SupportTeam";
    this.httpService.create(url, payload).subscribe(
      (res: any) => {
        this.snackBar.open("Patient set up saved successufully. ", "close", {
          panelClass: "snackBarSuccess",
          duration: 2000,
        });
        this.getSetupDetailsByPatientID(Number(this.patientId))
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }
  clear(){
    
    this.sosSetUpForm.reset()
  }
  validateNumericInput(event: KeyboardEvent): void {
    const input = event.key;
    if (input !== 'Backspace' &&!/^[0-9]*$/.test(input) && input !== 'Tab') {
      event.preventDefault();
    }
  }

}

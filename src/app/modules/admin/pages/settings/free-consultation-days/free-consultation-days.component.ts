import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { APIService } from 'app/core/api/api';
import { AuthService } from 'app/core/auth/auth.service';
import { FormControl } from '@angular/forms';
@Component({
  selector: 'app-free-consultation-days',
  templateUrl: './free-consultation-days.component.html',
  styleUrls: ['./free-consultation-days.component.scss']
})
export class FreeConsultationDaysComponent implements OnInit {
  freeConsultaionForm: FormGroup;
  userInfo: any;
  changesFound:boolean = false;
  isLoadingSpinner:boolean=false;
  constructor(private _formBuilder: FormBuilder,
    private httpService: APIService,
    private auth: AuthService,
    private snackBar: MatSnackBar) {
      this.userInfo = JSON.parse(this.auth.user);
     }

  ngOnInit(): void {
    this.freeConsultaionForm = this._formBuilder.group({
      conslultation_period:  ['', Validators.required],
    });
    this.freeConsultaionForm.valueChanges.subscribe(x => {
      this.changesFound = true;
    })
    this.getfreeConsultaionDays(this.userInfo.admin_account)
  }
  getfreeConsultaionDays(id?:any) {
    const url = `api/Doctor/GetFreeConsultationDays_ForHospitals?adminid=${id}`;
    this.httpService.getAll(url).subscribe((res: any) => {
      console.log(res.data)
      this.initForm(res.data);
    });
  }
 
  initForm(data:any) {
    console.log(data);
    this.freeConsultaionForm.patchValue({
      // adminaccountid: data.admin_account,
      freedaysid:data.freedays_id,
      conslultation_period: data.free_consultationdays,
      
    });
    this.changesFound = false;
  }
  save(){
    this.isLoadingSpinner=true;
    const url = `api/Doctor/SaveFreeConsultationDays`;
    const body = {
      "freedaysid": 0,
      "freeconsultationdays": parseInt(this.freeConsultaionForm.controls.conslultation_period.value),
      "adminid": this.userInfo.admin_account,
      "isactive_": true,
      "createdby": this.userInfo.admin_account
      
    }
    this.httpService.create(url,body).subscribe((res: any) => { 
      this.isLoadingSpinner=false;
       
        this.snackBar.open('Free consultation period updated successfully. ', 'close', {
            panelClass: "snackBarSuccess",
            duration: 2000,
          });
          this.getfreeConsultaionDays(this.userInfo.admin_account)
          // this.getUserInfo(this.userInfo.user_id);
    },
    (error: any) => {
        console.warn('error', error);
    })
  }
  clearForm(){
   
    this.freeConsultaionForm.controls.conslultation_period.setValue(null);
  }

}

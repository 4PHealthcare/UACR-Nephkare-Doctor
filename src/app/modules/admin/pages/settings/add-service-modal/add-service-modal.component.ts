import { Component, Inject, OnInit, } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { APIService } from 'app/core/api/api';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-service-modal',
  templateUrl: './add-service-modal.component.html',
  styleUrls: ['./add-service-modal.component.scss']
})
export class AddServiceModalComponent implements OnInit {
  isLoadingSpinner:boolean=false;

  constructor(
    private httpService: APIService,
    public dialogRef: MatDialogRef<any>,
    public snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  serviceForm: FormGroup;
  serviceId:any;
  userInfo:any;
  type:string;
  sampleCollection:boolean = false;
  sample_type:string ='';
  labGroup:boolean = false;
  inputText: string;
  ngOnInit(): void {
    console.log(this.data);
    this.type = this.data.type;
    this.userInfo = this.data.user;
    this.serviceForm = new FormGroup({
      service: new FormControl("", [Validators.required]),
      sample_type: new FormControl("", []),
      description: new FormControl("", []),
      fee: new FormControl("", [
        Validators.required,
        Validators.pattern("^[0-9]*$"),
      ]),
    });

    if (this.data && this.data.service) {
      this.editService(this.data.service);
    }
    if (this.type == 'lab') {
      this.serviceForm.controls.sample_type.setValidators([Validators.required])
    }
  }

  editService(data) {
    console.log(data);
    this.serviceId = data.service_id;
    this.sample_type = data.sample_type;
    this.labGroup = data.is_labgroup;
    this.serviceForm.patchValue({
      service: data.service_type,
      fee: data.price,
      sample_type:data.sample_type,
      description: data?.description
    });
  }
  isSampleExcists:boolean=false;
  setActivity(option){
    console.log(option);
    this.sample_type=option.sample_type;
    this.labGroup = option.is_group;
    if(this.sample_type){
      this.isSampleExcists=true;
    } else {
      this.isSampleExcists=false
      this.snackBar.open('Please add Specimen to this test', 'close', {
        panelClass: 'snackBarWarning',
        duration: 2000,
      });
      this.serviceForm.get('service').setValue(null);

    }
    this.serviceForm.get('sample_type').setValue(option.sample_type);
    // this.serviceForm.get('service').disable();
  }
  saveDoctorSchedule() {
    this.isLoadingSpinner=true;
    const payload = {
      serviceid: this.serviceId,
      servicetype: this.serviceForm.get("service").value,
      price_value: this.serviceForm.get("fee").value.toString(),
      roleid: this.userInfo.role_id,
      hospitaladminid: this.userInfo.admin_account,
      createdby: this.userInfo.user_id,
      servicecategory: this.type,
      sampletype:this.sample_type,
      islabgroup: this.labGroup,
      description: this.serviceForm.get("description").value,
    };
    this.httpService
      .create("api/User/createHospitalServices", payload)
      .subscribe(
        (res: any) => {
        this.isLoadingSpinner=false;
          if (res.data == '-1') {
            this.snackBar.open('Service Name already exists.', 'close', {
              panelClass: 'snackBarWarning',
              duration: 2000,
            });
            // this.isSampleExcists = false;
            // this.serviceForm.get('service').enable();
            // this.serviceForm.get('service').setValue(undefined);
            // this.serviceForm.get('sample_type').setValue(undefined);
          } else {
            this.dialogRef.close(true);
          }
 

        },
        (error: any) => {
          console.warn("error", error);
        }
      );
  }
  clearReports(){
    this.inputText = undefined;
    this.isSampleExcists = false;
    this.labGroup = undefined;
    this.serviceForm.get('service').enable();
    this.serviceForm.get('service').setValue(undefined);
    this.serviceForm.get('sample_type').setValue(undefined);

  }
   
 
  filteredOptions$ = new BehaviorSubject<any>(null);
  searchDrugsTerm(event) {
    const value = event.target.value;
    if (value.length > 1) {
      const url = `api/Lab/GetLabServicesBySearch?hospitaladminid=${this.userInfo.admin_account}&searchkey=${value}`;
      this.httpService.getAll(url).subscribe(
        (res: any) => {
          if (res.data && res.data.length > 0) {
            this.filteredOptions$.next(res.data);
          } else {
            this.filteredOptions$.next([]);
          }
        },
        (error: any) => {
          console.log("error", error);
        }
      );
    } else {
      this.filteredOptions$.next([]);
    }
  }

  clear(){
    this.serviceForm.reset();
  }

  

}

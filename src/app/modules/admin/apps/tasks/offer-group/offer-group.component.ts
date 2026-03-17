import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { APIService } from 'app/core/api/api';
import { AuthService } from 'app/core/auth/auth.service';
import moment from 'moment';

@Component({
  selector: 'app-offer-group',
  templateUrl: './offer-group.component.html',
  styleUrls: ['./offer-group.component.scss']
})
export class OfferGroupComponent implements OnInit {

  taskForm: FormGroup;
  userInfo: any;
  editMode: boolean = false;
  startDate: Date;
  endDate: Date;
  today = moment();
  constructor(private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private snackBar: MatSnackBar, 
    @Inject(MAT_DIALOG_DATA) public data: any,
    private httpService: APIService,
    private auth: AuthService,) { 
      this.userInfo = JSON.parse(this.auth.user);
    }

  ngOnInit(): void {
    if (this.data && this.data.action) {
      this.editMode = true;
      this.startDate = this.data.group.valid_from;
      this.endDate = this.data.group.valid_to;
    }
        this.taskForm = this._formBuilder.group({
          promogroup_id       : [''],
          promocode_group    : ["", [Validators.required]],
          notes    : [''],
          valid_from  : [new Date()],
          valid_to : [new Date()]
      });

      this.taskForm.patchValue({
        promogroup_id: this.data ? this.data.group.promogroup_id : '',
        promocode_group: this.data ? this.data.group.promocode_group : '',
        notes: this.data ? this.data.group.notes: '',
        valid_from: this.data ? this.data.group.valid_from != null ? moment(this.data.group.valid_from).format('YYYY-MM-DD') : null : null,
        valid_to: this.data ? this.data.group.valid_to != null ? moment(this.data.group.valid_to).format('YYYY-MM-DD') : null : null,
      });
  }

  isCorrectdue(): boolean {
    if (this.startDate !== null && this.startDate !== undefined && this.endDate !== null && this.endDate !== undefined) {
      if (moment(this.startDate).toDate() <= moment(this.endDate).toDate()) {
        return true;
      }
   }
   this.taskForm.setErrors({ 'invalid': true });
   return false;
  }

setDate(type) {
    if(type === 'valid_from') {
      this.startDate = this.taskForm.controls.valid_from.value._d;
    } else  if(type === 'valid_to') {
      this.endDate = this.taskForm.controls.valid_to.value._d;
    }
}

clearDate(type: any) {
  if(type === 'valid_from') { 
    this.taskForm.get('valid_from').setValue(null);
    this.startDate = null;
  } else if(type === 'valid_to') { 
    this.taskForm.get('valid_to').setValue(null);
    this.endDate = null;
  }
}

returnBody() {
  const fromDate = this.taskForm.controls.valid_from.value == null ? null : moment(this.taskForm.controls.valid_from.value).format('YYYY-MM-DD');
  const toDate = this.taskForm.controls.valid_to.value == null ? null : moment(this.taskForm.controls.valid_to.value).format('YYYY-MM-DD');
  if(this.editMode) {
      return {
        promogroup_id: this.data.group.promogroup_id,
        promocode_group: this.taskForm.controls.promocode_group.value,
        validfrom: fromDate,
        validto: toDate,
        notes: this.taskForm.controls.notes.value,
        created_by: this.userInfo.user_id,
    }
  } else {
    return {
        promogroup_id: 0,
        promocode_group: this.taskForm.controls.promocode_group.value,
        validfrom: fromDate,
        validto: toDate,
        notes: this.taskForm.controls.notes.value,
        created_by: this.userInfo.user_id,
    }
  }
}

  submit() {
    const url = `api/PromoCode/SavePromoCodeGroup`;
    this.httpService.create(url, this.returnBody()).subscribe((res: any) => {
      this.dialogRef.close(true);
      this.snackBar.open('Offer group added successfully. ', 'close', {
        panelClass: "snackBarSuccess",
        duration: 2000,
      });
    },(error: any) => { console.log('error', error); });
  }
}

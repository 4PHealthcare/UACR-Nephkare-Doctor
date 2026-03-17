import { Component, Inject, OnInit} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { APIService } from 'app/core/api/api';
import { AuthService } from 'app/core/auth/auth.service';
import moment from 'moment';
import { Subscription } from '../../subscriptions/subscriptions.types';
import { PromocodeGroups } from '../tasks.types';

@Component({
  selector: 'app-offer',
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.scss'],
  styles: [
    ` .mat-dialog-container {
        padding: 0px !important;
      }
    `,
  ],
})
export class OfferComponent implements OnInit {
    closeDrawer() {
        throw new Error('Method not implemented.');
    }
  today = moment();
  taskForm: FormGroup;
  task: PromocodeGroups;
  subscriptions: Subscription[];
  promoCodeGroups: any;
  userInfo: any;
  editMode: boolean = false;
  tagsEditMode: boolean = false;
  startDate: Date;
  endDate: Date;
  selectedSubscription: string[];
  LinkSubObj: any[];
  constructor(
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private httpService: APIService,
    private auth: AuthService,) { 
      this.userInfo = JSON.parse(this.auth.user);
    }

  ngOnInit() {
    this.GetServices();
    if (this.data && this.data.offer) {
      this.GetServicesLinkedToOffers(this.data.offer.promocodeid)
      this.editMode = true;
      this.startDate = this.data.offer.validfrom;
      this.endDate = this.data.offer.validto;
    }
    this.GetPromoCodeGroups();
    this.taskForm = this._formBuilder.group({
      promocodeid       : [''],
      promocode    : ["", [Validators.required]],
      description    : [''],
      validfrom  : new FormControl(null, [Validators.required]),
      validto : new FormControl(null, [Validators.required]),
      promoGroup_id : new FormControl("", [Validators.required])
  }); 

  this.taskForm.patchValue({
    promocodeid: this.data ? this.data.offer.promocodeid : '',
    promocode: this.data ? this.data.offer.promocode : '',
    description: this.data ? this.data.offer.description: '',
    validfrom: this.data ? this.data.offer.validfrom != null ? moment(this.data.offer.validfrom).format('YYYY-MM-DD') : null : null,
    validto: this.data ? this.data.offer.validto != null ? moment(this.data.offer.validto).format('YYYY-MM-DD') : null : null,
    promoGroup_id: this.data ? this.data.groupId: '',
  });
}
    
GetPromoCodeGroups() {
  const url = `api/PromoCode/GetPromoCodeGroup?userid=`+ this.userInfo.user_id;
  this.httpService.getAll(url).subscribe((res: any) => {
    if(res?.isSuccess && res.data) {
      this.promoCodeGroups = res.data;
    }
  },(error: any) => {console.log('error', error); });
}

isCorrectdue(): boolean
{
  if (this.startDate !== null && this.startDate !== undefined && this.endDate !== null && this.endDate !== undefined) {
    if (moment(this.startDate).toDate() <= moment(this.endDate).toDate()) {
      return true;
    }
    this.taskForm.setErrors({ 'invalid': true });
    return false;
 }
}

setDate(type) {
  if(type === 'validfrom') {
      this.startDate = this.taskForm.controls.validfrom.value._d;
    } else  if(type === 'validto') {
      this.endDate = this.taskForm.controls.validto.value._d;
  }
}

clearDate(type: any) {
  if(type === 'validfrom') { 
    this.taskForm.get('validfrom').setValue(null);
    this.startDate = null;
  } else if(type === 'validto') { 
    this.taskForm.get('validfrom').setValue(null);
    this.endDate = null;
  }
}

returnBody() {
  const fromDate = this.taskForm.controls.validfrom.value == null ? null : moment(this.taskForm.controls.validfrom.value).format('YYYY-MM-DD');
  const toDate = this.taskForm.controls.validto.value == null ? null : moment(this.taskForm.controls.validto.value).format('YYYY-MM-DD');
    if(this.editMode) {
        return  {
          promocodeid: this.data.offer.promocodeid,
          promocode: this.taskForm.controls.promocode.value,
          validfrom: fromDate,
          validto: toDate,
          description: this.taskForm.controls.description.value,
          promo_groupid: this.taskForm.controls.promoGroup_id.value,
      }
    } else {
        return  {
          promocodeid: 0,
          promocode: this.taskForm.controls.promocode.value,
          validfrom: fromDate,
          validto: toDate,
          description: this.taskForm.controls.description.value,
          promo_groupid: this.taskForm.controls.promoGroup_id.value,
          created_by: this.userInfo.user_id,
      }
    }
}

submit() {
  const url = `api/PromoCode/SavePromoCode`;
  this.httpService.create(url, this.returnBody()).subscribe((res: any) => {
      if(res && res.isSuccess && this.selectedSubscription) {
        this.saveServices(res.data);
      }
      this.dialogRef.close(true);
      this.snackBar.open('Offer added successfully. ', 'close', {
        panelClass: "snackBarSuccess",
        duration: 2000,
      });},
        (error: any) => {
            console.log('error', error);
        });
  }

  saveServices(promoId: any) {
    let subId;
      this.LinkSubObj = new Array();
      for(let sub of this.selectedSubscription) {
        const body = {
          promocodeid: promoId,
          serviceid: sub,
          createdby: this.userInfo.user_id
        };
        this.LinkSubObj.push(body);
        subId = sub;
      }
      const url = `api/PromoCode/LinkServicesToPromocodes`;
      this.httpService.create(url, this.LinkSubObj).subscribe((res: any) => {
        this.SaveActivity();
       },
        (error: any) => { console.log('error', error); });
  }

  GetServices() {
    const url = `api/Subscription/GetSubscriptionList?subscriptionTypeId=7`;
    this.httpService.getAll(url).subscribe((res: any) => {
        if(res?.isSuccess && res.data) {
            this.subscriptions = res.data;
        }
    },(error: any) => { console.log('error', error); });
  }
    
  GetServicesLinkedToOffers(offerId: any) {
    const url = `api/PromoCode/GetServicesLinkedToOffers?promocodeid=`+ offerId;
    this.httpService.getAll(url).subscribe((res: any) => {
        if(res?.isSuccess && res.data) {
          this.selectedSubscription = res.data.map(s=>s.service_id);
        }
    },(error: any) => { console.log('error', error); });
  }

  SaveActivity() {
    const desc = this.editMode ? "Updated offer <b>"+ this.taskForm.controls.promocode.value +"</b>" : "Created new Offer <b>"+ this.taskForm.controls.promocode.value+"</b>";
    const body = {
        activityid: 0,
        userid: this.userInfo.user_id,
        titlename: this.editMode ? "Updated the Promocode" : "New Promocode is created",
        descriptionname: desc,
        createdby: this.userInfo.user_id,
        categoryname: this.editMode ? "EditOffer" : "AddOffer"
      };
    const url = `api/PatientRegistration/CreateActivity`;
    this.httpService.create(url, body).subscribe((res: any) => { },
        (error: any) => { console.log('error', error); });
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { APIService } from 'app/core/api/api';
import { AuthService } from 'app/core/auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { WindowRefService } from '../window-ref.service';

@Component({
  selector: 'app-find-patient',
  templateUrl: './find-patient.component.html',
  styleUrls: ['./find-patient.component.scss']
})
export class FindPatientComponent implements OnInit {
  signInForm: FormGroup;
  patientInfo$ = new BehaviorSubject<any>(null);
  specialities: any = [];
  doctorsList: any = [];
  showPhoneNoSection: boolean = true;
  selectedSpeciality: any = '';
  selectedDoctor: any = '';
  userId: any = '';
  consultationType = 'followUp';
  doctorSlots: any = [];
  appointmentTime: string = '';

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _apiService: APIService,
    private winRef: WindowRefService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    console.log('params', this._activatedRoute.snapshot.paramMap.get('id'));
    this.userId = this._activatedRoute.snapshot.paramMap.get('id');

    this.signInForm = this._formBuilder.group({
      phone: ['', [Validators.required, Validators.minLength(10),
        Validators.maxLength(10),
        Validators.pattern("[6-9]\\d{9}")]]
  });
  }

  findPatient() {
    let phoneNo = this.signInForm.value;
    let url = `api/PatientRegistration/CreateNewPatientMobileNumber?mobile_no=${phoneNo.phone}&issecondopinion=false`
    this._apiService.create(url, {}).subscribe((res: any) => {
      this.getPatinentInfo(res.data);
      this.showPhoneNoSection = false;
    })
  }

  patientId: any;
  consultationFee: any;

  getPatinentInfo(pid: number) {
    let url = `api/PatientRegistration/GetPatientBasicInfo?userid=${pid}`
    this._apiService.getAll(url).subscribe((data: any) => {
      this.patientId = data.data.user_id;
      this.getSpecialityList();
      this.patientInfo$.next(data.data);
    });
  }

  getSpecialityList() {
    const url = `api/User/GetMasterData?mastercategoryid=`+21;
    this._apiService.getAll(url).subscribe((res: any) => {
      this.specialities=res.data;
    },
    (error: any) => {
        console.log('error', error);
    });
  }

  getDoctorsList(specialityId: number) {
    let apiUrl = `api/Doctor/GetHospitalScheduledDoctors?clinicid=${this.userId}&ismainbranch=true&isdoctor=true&specialityid=${specialityId}`
    this._apiService.getAll(apiUrl)
      .subscribe((res: any) => {
        this.doctorsList = res.data;
        this.consultationFee = res.data[0].client_consultationfee;
      });
  }

  selectSpeciality(evnt: any) {
    this.getDoctorsList(evnt.value);
    this.getDoctorAvailableTimes();
  }

  getDoctorAvailableTimes() {
    const url = `api/Patient/GetTodayDoctorSlots?doctorid=${this.userId}`;
    this._apiService.getAll(url)
      .subscribe((res: any) => {
        this.doctorSlots = res.data;
      });

  }



  submit() {
    this.getPayementID();
  }

  createRzpayOrder(data: any) {
    console.log(data);
  }

  async checkout(data: any) {
    const options: any = {
      //key: "rzp_test_ZCJ0bvDCJbxZL6", // For Dev
      key: "rzp_live_TsuBIYrRxbJt0u", // For Live
      amount: Number(this.consultationFee) * 100, // amount should be in paise format to display Rs 1255 without decimal point
      currency: 'INR',
      name: '', // company name or product name
      description: '',  // product description
      image: './assets/logo.png', // company logo or product image
      // order_id: data.order_id, // order_id created by you in backend
      modal: {
        // We should prevent closing of the form when esc key is pressed.
        escape: false,
      },
      notes: {
        // include notes if any
      },
      theme: {
        color: '#0c238a'
      }
    };
    options.handler = ((response, error) => {
      options.response = response;
      console.log('error#', error);
      // call your backend api to verify payment signature & capture transaction
    });
    options.modal.ondismiss = (() => {
      // handle the case when user closes the form while transaction is in progress
      console.log('Transaction cancelled.');
    });
    const rzp = new this.winRef.nativeWindow.Razorpay(options);
    rzp.open();
  }

  getPayementID() {
    console.log('feee', this.consultationFee);
    const url = `api/Patient/Razorpayment_Order?amount=${(Number(this.consultationFee)) * 100}&patientid=${this.patientId}&serviceid=0&issecondopinion=false`;
    const body = {}
    this._apiService.create(url, body).subscribe((res: any) => {
      console.log(res);
      if(res && res.order_id) {
        this.checkout(res);
      }else {
        this.snackBar.open('Please check try again. ', 'close', {
          panelClass: "snackBarSuccess",
          duration: 2000,
        });
      }
    },
    (error: any) => {
      this.snackBar.open('Please check try again. ', 'close', {
        panelClass: "snackBarSuccess",
        duration: 2000,
      });
    }
    );
  }
}

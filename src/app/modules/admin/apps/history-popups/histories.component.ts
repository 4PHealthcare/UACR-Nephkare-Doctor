import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { APIService } from 'app/core/api/api';
import { AuthService } from 'app/core/auth/auth.service';
@Component({
  selector: 'app-histories',
  templateUrl: './histories.component.html',
  styleUrls: ['./histories.component.scss']
})
export class HistoriesComponent implements OnInit {
  tabIndex = 0;
  tempData:any;
  userInfo:any;
  measurementObj:any;
  constructor(public dialogRef: MatDialogRef<any>, @Inject(MAT_DIALOG_DATA) public data: any, private auth: AuthService, private httpService: APIService) {
    this.userInfo = JSON.parse(this.auth.user);
   }

  ngOnInit(): void { 
    this.tempData=this.data;
    console.log(this.tempData);
    this.tabIndex = this.data?.index ? this.data?.index : 0;
  }
  close(){
    // this.tempData=this.data;
    // console.log(this.tempData);
    this.dialogRef.close(true)
  }
}
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { APIService } from 'app/core/api/api';

@Component({
  selector: 'app-medicine-logs',
  templateUrl: './medicine-logs.component.html',
  styleUrls: ['./medicine-logs.component.scss']
})
export class MedicineLogsComponent implements OnInit {

  medicineLogs:any[] = [];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>,
    private httpService: APIService
  ) { }

  ngOnInit(): void {
    this.getMedicineLogs();
  }

  getMedicineLogs() {
   
    const url = `api/Patient/GetPatientMedicineTracker_last30days?patientid=${this.data.userId}`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
       
        if(res.data) {
         this.medicineLogs = (res.data).reverse();

        }

      },
      (error: any) => {

      }
    );

  }

}

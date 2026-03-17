import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { APIService } from "app/core/api/api";
import { AuthService } from "app/core/auth/auth.service";
import { SelectionModel } from "@angular/cdk/collections";
import { MatTableDataSource } from "@angular/material/table";
@Component({
  selector: "app-view-last-prescription-medication",
  templateUrl: "./view-last-prescription-medication.component.html",
  styleUrls: ["./view-last-prescription-medication.component.scss"],
})
export class ViewLastPrescriptionMedicationComponent implements OnInit {
  userInfo: any;
  latestMedicationList:any[]=[];
  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel(true, []);
  masterSelected:boolean;
  checkedList:any;
  public specilityId: any;
  constructor(
    public dialogRef: MatDialogRef<any>,
    private auth: AuthService,
    private httpService: APIService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.userInfo = JSON.parse(this.auth.user);
    this.masterSelected = false;
  }

  ngOnInit(): void {
    console.log(this.data); 
    // this.getUserInfo(this.userInfo.user_id);
   this.httpService.get("api/User/GetUsersById?userId=", this.userInfo.user_id).subscribe(
    (res: any) => {
      if (res.data) {
       this.specilityId=res.data.speciality_id;
       this.getLatestMedicationForCompletedAppointment(this.data.patientId,this.data.AppointmentId,this.specilityId);
       console.log(this.specilityId)
      }
     
    },
    (error: any) => {
      console.warn("error", error);
    }
  );
  }
  getLatestMedicationForCompletedAppointment(patienId, appointmentId, specialityId) {
    console.log(specialityId)
    const url = `api/Patient/GetLatestMedicationForCompletedAppointment?patientid=${patienId}&specialityid=${specialityId}`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        console.log(res);
        if(res && res.data ){
          this.latestMedicationList = res.data; 
        }else{
          this.latestMedicationList =[];
        }
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }
  // takeMedicationToPrescription(){
  //   this.dialogRef.close(this.latestMedicationList);
    
  // }

  takeMedicationToPrescription(){
    
    this.dialogRef.close(this.checkedList);
    
  }
  
  // The master checkbox will check/ uncheck all items
  checkUncheckAll() {
    for (var i = 0; i < this.latestMedicationList.length; i++) {
      this.latestMedicationList[i].isSelected = this.masterSelected;
    }
    this.getCheckedItemList();
  }

  // Check All Checkbox Checked
  isAllSelected() {
    this.masterSelected = this.latestMedicationList.every(function(item:any) {
        return item.isSelected == true;
      })
    this.getCheckedItemList();
  }

  // Get List of Checked Items
  getCheckedItemList(){
    
    this.checkedList = [];
    for (var i = 0; i < this.latestMedicationList.length; i++) {
      if(this.latestMedicationList[i].isSelected)
      this.checkedList.push(this.latestMedicationList[i]);
    }
    // this.checkedList = JSON.stringify(this.checkedList);
  }
}

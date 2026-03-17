import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, NgForm, Validators } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { APIService } from "app/core/api/api";
import { AuthService } from "app/core/auth/auth.service";

@Component({
  selector: "app-ros",
  templateUrl: "./ros.component.html",
  styleUrls: ["./ros.component.scss"],
})
export class RosComponent implements OnInit {
  userInfo: any;
  RosList: any = [];
  selectedROSList: any = [];
  addedRos: any = [];
  appointmentId:any;
  patientRosId: any;
  cheifComplaintForm: FormGroup;
  editMode: boolean = false;
  isLoadingSpinner:boolean=false;

  @ViewChild("cheifComplaintNGForm") chiefComplaintNGForm: NgForm;

  constructor(
    private _formBuilder: FormBuilder,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<any>,
    private httpService: APIService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private auth: AuthService
  ) {
    this.userInfo = JSON.parse(this.auth.user);
  }

  ngOnInit(): void {
    console.log(this.data)
    this.cheifComplaintForm = this._formBuilder.group({
      ros: ["", [Validators.required]],
    });
    if (this.data && this.data?.ros && this.data?.ros?.patient_ros_id) {
      this.getRosDetailsById(this.data.ros.patient_ros_id);
      this.editMode = true;
    } else {
      this.getROSList();
    }
  }

  getRosChildlist(ros: any, ev: any, ind: any) {
    if (ev) {
      this.RosList[ind].iselected = true;
      let rosObj = {
        rosId: "",
        selectedRosChildList: [],
        selectedRosName: "",
      };
      rosObj.rosId = ros.masterdata_id;
      rosObj.selectedRosName = ros.data_name;
      const url = `api/Patient/GetROSChildList?RosId=${ros.masterdata_id}`;
      this.httpService.getAll(url).subscribe((res: any) => {
        if (res.isSuccess) {
          rosObj.selectedRosChildList = res.data.map((x) => ({
            ...x,
            iselected: false,
          }));
          this.selectedROSList.push(rosObj);
        }
      });
    } else {
      this.selectedROSList.splice(
        this.selectedROSList.findIndex(
          (data: any) => data.selectedRosName == ros.data_name
        ),
        1
      );
    }
  }

  getROSList() {
    const url = `api/User/GetMasterData?mastercategoryid=35`;
    this.httpService.getAll(url).subscribe((res: any) => {
      if (res.isSuccess) {
        let info = res.data.map((x) => ({
          ...x,
          iselected: false,
        }));
        this.RosList = info;
      }
    });
  }

  // selectedRos(id: number, data: any) {
  //   const url = `api/Patient/GetROSChildList?RosId=${id}`;
  //   this.httpService.getAll(url).subscribe((res: any) => {
  //     this.selectedROSList.push(data);
  //   });
  // }

  selectedRosChild(evnt: any, data: any, mainInd: any, subInd: any) {
    if (evnt.checked) {
      this.selectedROSList[mainInd].selectedRosChildList[subInd].iselected =
        true;
    } else {
      this.selectedROSList[mainInd].selectedRosChildList[subInd].iselected =
        false;
    }
  }

  saveRos() {
    this.isLoadingSpinner=true;
    let filteredArray = this.selectedROSList.filter((element: any) =>
      element.selectedRosChildList.some(
        (subElement: any) => subElement.iselected === true
      )
    );
    filteredArray.forEach((data: any) => {
      let obj = {
        rosid: data.rosId,
        ros_name: data.selectedRosName,
        roslist: data.selectedRosChildList,
      };
      this.addedRos.push(obj);
    });
    const body = {
      patientrosid: this.patientRosId ? this.patientRosId : 0,
      appointmentid: this.patientRosId  ? this.appointmentId : this.data.appointmentId ? parseInt(this.data.appointmentId) : 0,
      patientid: parseInt(this.data.userId),
      roslist: this.addedRos,
      notes_info: "",
      createdby: this.userInfo.user_id,
    };
    const url = `api/Patient/CreatePatientROS`;
    this.httpService.create(url, body).subscribe(
      
      (res: any) => {
        this.isLoadingSpinner=false;
        if (res.isSuccess) {
          this.selectedROSList = [];
          this.dialogRef.close(true);
          if (this.editMode) {
            this.snackBar.open("Patient ROS updated successfully. ", "close", {
              panelClass: "snackBarSuccess",
              duration: 2000,
            });
          } else {
            this.snackBar.open("Patient ROS added successfully. ", "close", {
              panelClass: "snackBarSuccess",
              duration: 2000,
              
            });
          }
        }
      },
      (error: any) => {
        this.snackBar.open(error, "close", {
          panelClass: "snackBarFailure",
          duration: 2000,
        });
      }
    );
  }

  getRosDetailsById(id: any) {
    const url = `api/Patient/GetPatientROSById?PatientRosId=${id}`;
    this.httpService.getAll(url).subscribe(
      
      (res: any) => {
        if (res.isSuccess) {
          this.patientRosId = res.data.patient_ros_id;
          this.appointmentId = res.data.appointment_id;

          this.RosList.push({
            data_name: res.data.ros,
            masterdata_id: res.data.ros_id,
            iselected: true,
          });

          if(res.data.rosChildSelectedList && this.data.ros && this.data.ros.ros_lists && this.data.ros.ros_lists.length !==0) {
            res.data.rosChildSelectedList = res.data.rosChildSelectedList.map(obj => ({ ...obj, iselected: this.data.ros.ros_lists.some(element => obj.disease.trim().includes(element.trim())) }))
          }

          let rosObj = {
            rosId: res.data.ros_id,
            selectedRosChildList: res.data.rosChildSelectedList,
            selectedRosName: res.data.ros,
          };
          this.selectedROSList.push(rosObj);
        }
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }
}

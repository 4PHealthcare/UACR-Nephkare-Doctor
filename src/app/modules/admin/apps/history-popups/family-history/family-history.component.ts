import { Component, Inject, OnInit, ViewChild } from "@angular/core";

import {
  FormBuilder,
  FormGroup,
  NgForm,
  Validators,
  FormControl,
  AbstractControl,
} from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { APIService } from "app/core/api/api";
import _ from "lodash";

@Component({
  selector: "app-family-history",
  templateUrl: "./family-history.component.html",
  styleUrls: ["./family-history.component.scss"],
})
export class FamilyHistoryComponent implements OnInit {
  problems: any[] = [];
  familyHistoryForm: FormGroup;
  submitted = false;
  selectedProblems: any = [];
  relationShips: any;
  familyhistory_id:any;
  @ViewChild("familyHistoryNGForm") chiefComplaintNGForm: NgForm;
  isLoadingSpinner:boolean=false;
  forcheckbox:boolean=true;

  constructor(
    private _formBuilder: FormBuilder,
    private httpService: APIService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>,
    
  ) {}

  ngOnInit(): void {
    this.getProblemConditions();
    // Create the form
    this.familyHistoryForm = this._formBuilder.group({
      relationship: ["", [Validators.required]],
    });
    this.getTypesOfRelationShip();
    
    
    
    if (
      this.data &&
      this.data.familyHistory &&
      this.data.familyHistory.familyhistory_id
    ) {
      console.log('first');
      this.familyhistory_id=this.data.familyHistory.familyhistory_id;
     
      this.updateForm();
    }
  }
  getProblemConditions() {
    
    const url = `api/User/GetMasterData?mastercategoryid=62`;
    this.httpService.getAll(url).subscribe((res: any) => {
      this.problems = res.data;
      console.log(this.problems);
      console.log('second');
    });
  }

  updateForm() {
    if (this.data.familyHistory.history_name !== "") {
      let histories = this.data.familyHistory.history_name.includes(",")
        ? this.data.familyHistory.history_name.split(",")
        : [this.data.familyHistory.history_name];
      this.selectedProblems = histories;
      console.log('third');
     
      this.problems.forEach((obj1: any) => {
        histories.forEach((obj2: any) => {

          if (obj1.data_name == obj2) {
            return (obj1.value = true);
          }
        });
      });
    }
    this.familyHistoryForm.patchValue({
      relationship: this.data.familyHistory.relation_id,
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.familyHistoryForm.controls;
  }
  onSubmit() {
    this.submitted = true;
    this.isLoadingSpinner=true;
    this.problems.map(obj=> obj.checked=false);
    
     if (this.familyHistoryForm.invalid) {
      return;
     
    }
    const body = {
      familyhistoryid: this.data.familyHistory
        ? this.data.familyHistory.familyhistory_id
        : 0,
      patientid: parseInt(this.data.userId),
      history: this.selectedProblems.toString(),
      appointmentid: 0,
      relationid: this.familyHistoryForm.get("relationship").value,
    };
    const url = `api/PatientHistory/SaveFamilyHistory`;
    this.httpService.create(url, body).subscribe((res: any) => {
      this.isLoadingSpinner=false;

      this.problems.map(obj=>obj.checked=[])
      
      if(this.data?.familyHistory?.familyhistory_id){
        this.snackBar.open("Family history updated successfully.", "close", {
          panelClass: "snackBarSuccess",
          duration: 2000,
        });
      }else{
        this.snackBar.open("Family history saved successfully.", "close", {
          panelClass: "snackBarSuccess",
          duration: 2000,
        });
      }
      // this.dialogRef.close(true);
    });
    console.log(JSON.stringify(this.familyHistoryForm.value, null, 2));
  }
  onReset(): void {
    this.submitted = false;
    this.familyHistoryForm.reset();
   // this.dialogRef.close();
  }
  clearSelectedProblem(){
    //this.familyHistoryForm.reset();
  }

  selectedSymptom(data: any, evnt: any,familyMemberId:any,index:any) { 
    let selectedProblem = data.data_name;
    if (evnt.checked) {
      if(this.data?.familyHistory?.length > 0){
        if (this.hasDuplicate(this.data.familyHistory, familyMemberId, selectedProblem)) {
          this.snackBar.open("Duplicate found!", "close", {
           panelClass: "snackBarWarning",
           duration: 2000,
         });
           this.problems[index].checked = false
          console.log(this.selectedProblems)
         }else{
          this.selectedProblems.push(data.data_name);
         }
       }else{
        this.selectedProblems.push(data.data_name);
       }
    }else{
      this.selectedProblems = _.without(this.selectedProblems, data.data_name);
    }  
  }
  hasDuplicate(familyHistory, familyMemberId, selectedProblem) {
    return familyHistory.some(history => {
      const problemExists = history.history_name.includes(selectedProblem);
      const memberExists = history.relation_id === familyMemberId;
  
      return problemExists && memberExists;
    });
  }

  getTypesOfRelationShip() {
    const url = `api/User/GetMasterData?mastercategoryid=22`;
    this.httpService.getAll(url).subscribe((res: any) => {
      this.relationShips = res.data;
    });
  }

  
  
}

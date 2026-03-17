import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ThemePalette } from "@angular/material/core";
import { APIService } from 'app/core/api/api';
import moment from 'moment';

@Component({
  selector: 'app-add-vital-notes',
  templateUrl: './add-vital-notes.component.html',
  styleUrls: ['./add-vital-notes.component.scss']
})
export class AddVitalNotesComponent implements OnInit {
  isLoadingSpinner:boolean=false;
  today = moment();

  vitalForm: FormGroup;
  public showSpinners = true;
  public showSeconds = false;
  public stepHour = 1;
  public stepMinute = 1;
  public stepSecond = 1;
  public color: ThemePalette = "primary";
  checkList: boolean[] = [];
  public stepHours = [1, 2, 3, 4, 5];
  public stepMinutes = [1, 5, 10, 15, 20, 25];
  public stepSeconds = [1, 5, 10, 15, 20, 25];


  quillModules: any = {
    toolbar: [
      [{ font: [] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"], // toggled buttons
      ["clean"], // remove formatting button
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }], // superscript/subscript
      [{ color: [] }, { background: [] }], // dropdown with defaults from theme

      [{ align: [] }],

      ["link"], // link and image, video
    ],
  };

  notesForm: FormGroup;
 

  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private httpService: APIService
  ) { }

  ngOnInit(): void {
    this.notesForm = new FormGroup({
      date: new FormControl("", [Validators.required]),
      notes: new FormControl("", [Validators.required]),
    });
    this.notesForm.controls.date.setValue(new Date());
   
  }

  saveNotes() {
    this.isLoadingSpinner=true;
    const obj = {
      "notesid": 0,
      // "titlename": "string",
     //moment().format('YYYY-MM-DDTHH:mm:ss')
      "createdon":moment(this.notesForm.controls.date.value).format('YYYY-MM-DDTHH:mm:ss'),
      "notesdescription": this.notesForm.controls.notes.value,
      "doctor_id": parseInt(this.data.doctorId),
      "patient_id": parseInt(this.data.patientId),
      "opinion_id": this.data.opinion_id ? parseInt(this.data.opinion_id) : 0
    }
    const url = `api/Notes/ManageUserNotes`;
      this.httpService.create(url, obj).subscribe(
        (res: any) => {
          this.isLoadingSpinner=false;

          if (res.data) {
           
            this.dialogRef.close(true);
          } 

        },
        (error: any) => {

          console.log("error", error);
        }
      );
  }

}

import {
  Component,
  OnInit,
  ViewChild,
  Inject,
  NgZone,
  ElementRef,
} from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormGroup,
  NgForm,
  Validators,
} from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { APIService } from "app/core/api/api";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "app/core/auth/auth.service";
import { ThemePalette } from "@angular/material/core";

@Component({
  selector: "app-view-relatives",
  templateUrl: "./view-relatives.component.html",
  styleUrls: ["./view-relatives.component.scss"],
})
export class ViewRelativesComponent implements OnInit {
 

  testListForm: FormGroup;
  userInfo: any;
  
  relationsList:any[]=[];
  @ViewChild("testListFormNGForm") testListFormNGForm: NgForm;

  constructor(
    private _matDialogRef: MatDialogRef<ViewRelativesComponent>,
    public dialogRef: MatDialogRef<any>,
    private fb: FormBuilder,
    private httpService: APIService,
    private snackBar: MatSnackBar,
    private auth: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userInfo = JSON.parse(this.auth.user);
  }

  ngOnInit(): void {
    console.log(this.data)
    this.testListForm = this.fb.group({
      tests: this.fb.array([]),
    });

    this.getTestsList();
  }
  dismiss(data?:string, patientData?:any) {
    if (patientData) {
      this._matDialogRef.close(patientData);
    } else {
      this._matDialogRef.close(data);
    }
  }
  getTestsList() {
    this.httpService
      .getAll(
        `api/User/GetPatientsByMobileNo?mobileno=${this.data.phone}&adminid=${this.data.admin_id}`
      )
      .subscribe(
        (res: any) => {
          if (res.data) {
            this.relationsList=res.data;
            console.log(this.relationsList)
          }
        },
        (error: any) => {
          console.warn("error", error);
        }
      );
  }

  save() {
   
  }
}

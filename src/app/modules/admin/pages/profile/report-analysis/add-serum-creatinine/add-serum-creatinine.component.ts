import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: 'app-add-serum-creatinine',
  templateUrl: './add-serum-creatinine.component.html',
  styleUrls: ['./add-serum-creatinine.component.scss']
})
export class AddSerumCreatinineComponent implements OnInit {
  rows: any[] = [];

  constructor(private _matDialogRef: MatDialogRef<AddSerumCreatinineComponent>,
    private cd: ChangeDetectorRef,) { }

  ngOnInit(): void {
    this.addRow()
  }

    dismiss() {
      this._matDialogRef.close();
  }
  onSubmit() {

  }
  addRow() {
    this.rows.push({});
    this.cd.detectChanges();
  }

  removeRow(index: number) {
    if (this.rows.length > 1) {
      this.rows.splice(index, 1);
    }
  }
}

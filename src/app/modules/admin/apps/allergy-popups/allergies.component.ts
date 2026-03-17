import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-allergies',
  templateUrl: './allergies.component.html',
  styleUrls: ['./allergies.component.scss']
})
export class AllergiesComponent implements OnInit {
  tabIndex = 0;
  editMode = false;
  constructor(public dialogRef: MatDialogRef<any>,
     @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.tabIndex = this.data?.index ? this.data?.index : 0;
    if (this.data?.foodAllergy != null) {
      this.editMode = true;
    }
  }
close(){
  this.dialogRef.close(true);
}
}
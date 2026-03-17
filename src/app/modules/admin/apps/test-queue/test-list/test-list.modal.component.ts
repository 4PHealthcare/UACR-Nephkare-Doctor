import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit, ViewChild, Inject } from "@angular/core";

@Component({
  selector: 'app-test-lest',
  templateUrl: './test-list.modal.html',
  styleUrls: []
})

export class TestListComponent implements OnInit {

    tests:any[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>
  ) { }


  ngOnInit(): void {
    this.tests = this.data.tests;
  }

  dismiss() {
    this.dialogRef.close();
  }
}

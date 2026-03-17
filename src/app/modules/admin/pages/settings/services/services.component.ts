import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { LiveAnnouncer } from "@angular/cdk/a11y";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTableDataSource } from "@angular/material/table";
import { FuseConfirmationService } from "@fuse/services/confirmation";
import { APIService } from "app/core/api/api";
import { MatSort, Sort } from "@angular/material/sort";
import { AuthService } from "app/core/auth/auth.service";
import { BehaviorSubject } from "rxjs";
import { AddServiceModalComponent } from '../add-service-modal/add-service-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: "app-services",
  templateUrl: "./services.html",
  styleUrls: ["./services.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesComponent implements OnInit {
  servicesList: any[] = [];
  serviceId: number = 0;
  changesFound: boolean = false;
  displayedColumns: string[] = [
    "service_type",
    "service_name",
    "price",
    "created_on",
    "action",
  ];
  dataSource = new MatTableDataSource([]);
  @ViewChild(MatSort) sort: MatSort;
  userInfo: any;
  loading: boolean = false;
  @Input() type:string;
  constructor(
    private httpService: APIService,
    private auth: AuthService,
    private snackBar: MatSnackBar,
    private _liveAnnouncer: LiveAnnouncer,
    public dialog: MatDialog,
    private _fuseConfirmationService: FuseConfirmationService,
    private cd: ChangeDetectorRef
  ) {
    this.userInfo = JSON.parse(this.auth.user);
  }

  ngOnInit(): void {
    // Create the form

    if (this.userInfo.role_id != 5 && this.type == 'op' ) {
      this.displayedColumns = [ "service_type", "price", "created_on"]
    } else if (this.userInfo.role_id != 5 && this.type == 'IP' ) {
      this.displayedColumns = [ 
      "service_type",
      
      "price",
      "created_on",
      "action",]
    }
     else {
      this.displayedColumns= [
        "service_type",
        "service_name",
        "price",
        "created_on",
        "action",
      ];
    }
    this.intitForm();
    this.getServices();
  }

  ngAfterViewInit() {}

  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce("Sorting cleared");
    }
  }

  intitForm() {
   
  }



  openAddService(service?:any) {
    this.dialog
      .open(AddServiceModalComponent, {
        width: '25rem',
        height: '100%',
        panelClass:'no-padding-popup',
        position: { right: '0' },
        data: { user:this.userInfo,  service, type:this.type}
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          let msg = "Service added successfully.";
          if (service) {
            msg = "Service updated successfully.";
          }
          this.snackBar.open(msg, "close", {
            panelClass: "snackBarSuccess",
            duration: 2000,
          });
          this.getServices();
        }
      });
  }
  
  
  getServices() {
    this.loading = true;
    this.httpService
      .getAll(`api/User/GetHospitalServices?adminid=${this.userInfo.admin_account}&category=${this.type}`)
      .subscribe(
        (res: any) => {
          this.servicesList = res.data ? res.data : [];
          this.dataSource.data = this.servicesList;
          this.dataSource.sort = this.sort;
        },
        (error: any) => {
          console.warn("error", error);
        }
      );
  }

  deleteRecord(id: number) {
    const confirmation = this._fuseConfirmationService.open({
      title: "Delete Service?",
      message:
        "Are you sure you want to delete this? This action cannot be undone!",
      actions: {
        confirm: {
          label: "Delete",
        },
      },
    });
    confirmation.afterClosed().subscribe((result) => {
      if (result === "confirmed") {
        const url = `api/User/DeleteHospitalService?serviceid=` + id;
        this.httpService.getAll(url).subscribe(
          (res: any) => {
            if (res?.isSuccess) {
              this.getServices();
              this.snackBar.open("Service deleted successfully. ", "close", {
                panelClass: "snackBarSuccess",
                duration: 2000,
              });
            }
          },
          (error: any) => {
            console.log("error", error);
          }
        );
      }
    });
  }

  
  checkAll() {}

  clear() {
    this.changesFound = false;
  }


  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    console.log(this.dataSource.filter);
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  

  
}

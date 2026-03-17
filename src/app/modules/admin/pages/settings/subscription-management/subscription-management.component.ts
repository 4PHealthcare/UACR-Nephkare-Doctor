import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AddServiceComponent } from '../add-service/add-service.component';
import { EditServiceComponent } from '../edit-service/edit-service.component';

import { APIService } from 'app/core/api/api';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { SubscriptionsService } from '../subscriptions.service';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
  selector: 'subscription-management',
  templateUrl: './subscription-management.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionManagementComponent implements OnInit {
  serviceList$ = new BehaviorSubject<any>(null);
  selectedServiceCategory: any;
  //subsriptionsList$ = new BehaviorSubject<any>(null);
  subsriptionsList:any[]=[]
  searchService: any;
  user: any;

  /**
   * Constructor
   */
  constructor(
    private _subscriptionsService: SubscriptionsService,
    public dialog: MatDialog,
    private httpService: APIService,
    private snackBar: MatSnackBar,
    private _fuseConfirmationService: FuseConfirmationService,
    private cd: ChangeDetectorRef,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.selectedServiceCategory = 82573
    this.getServiceCategoriesList();
    this.user = JSON.parse(this.auth.user);
    console.log(this.user.admin_account);
    // Get the categories
  }

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  addNewService() {
    let filteredObject = this.serviceList$.value.find(x => x.masterdata_id === this.selectedServiceCategory);
    this.cd.detectChanges();

    const dialogRef = this.dialog
      .open(AddServiceComponent, {
        width: '25rem',
        height: '100%',
        position: { right: '0' },
        data: { categoryId: this.selectedServiceCategory, name:filteredObject.data_name }, 
      })
      .afterClosed()
      .subscribe((res: any) => {
        if (res) {
          this.getServicesList();
        }
      });
  }

  editService(data: any) {
    const dialogRef = this.dialog
      .open(EditServiceComponent, {
        width: '25rem',
        height: '100%',
        position: { right: '0' },
        data: data,
      })
      .afterClosed()
      .subscribe((data: any) => {
        if (data) {
          this.getServicesList();
        }
      });
  }

  deleteService(data: any) {
    const confirmation = this._fuseConfirmationService.open({
      title: 'Delete Service',
      message: 'Are you sure you want to remove? This action cannot be undone!',
      actions: {
        confirm: {
          label: 'Delete',
        },
      },
    });

    confirmation.afterClosed().subscribe((result) => {
      if (result === 'confirmed') {
        const url = `api/Subscription/DeleteSubscription?subscriptionId=${data.subscription_id}`;
        this.httpService.getAll(url).subscribe(
          (res: any) => {
            this.getServiceCategoriesList();
            this.snackBar.open('Service deleted successfully.', 'close', {
              panelClass: 'snackBarSuccess',
              duration: 2000,
            });
          },
          (error: any) => {
            this.snackBar.open(error, 'close', {
              panelClass: 'snackBarFailure',
              duration: 2000,
            });
          }
        );
      }
    });
  }

  // serviceList:any = [];

  getServiceCategoriesList(initial?:boolean) { 
    this._subscriptionsService
      .getServiceCategoriesList()
      .subscribe((res: any) => {
        this.serviceList$.next(res.data.filter((item)=>{
          return item.masterdata_id == 82573
        }));
        this.cd.detectChanges();
        if (initial) {
          this.selectedServiceCategory = res.data[0].masterdata_id;
        }
        this.getServicesList();

      });
  }

  getServicesList() {
    this._subscriptionsService
      .getServicesListByAdminId(this.user.admin_account)
      .subscribe((res: any) => {
        //this.subsriptionsList$.next(res.data);
        this.subsriptionsList = res.data;
        this.cd.detectChanges();
      });
  }
  filterByCategory(event){
    console.log(event);
  }
}

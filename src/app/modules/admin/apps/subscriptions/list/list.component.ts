import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AddServiceComponent } from '../add-service/add-service.component';
import { EditServiceComponent } from '../edit-service/edit-service.component';
import { SubscriptionsService } from '../subscriptions.service';
import { APIService } from 'app/core/api/api';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
  selector: 'subscriptions-list',
  templateUrl: './list.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionsListComponent implements OnInit {
  serviceList$ = new BehaviorSubject<any>(null);
  selectedServiceCategory: any;
  subsriptionsList$ = new BehaviorSubject<any>(null);
  searchService: any;

  /**
   * Constructor
   */
  constructor(
    private _subscriptionsService: SubscriptionsService,
    public dialog: MatDialog,
    private httpService: APIService,
    private snackBar: MatSnackBar,
    private _fuseConfirmationService: FuseConfirmationService
  ) {}

  ngOnInit(): void {
    this.getServiceCategoriesList();
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
    const dialogRef = this.dialog
      .open(AddServiceComponent, {
        width: '25rem',
        height: '100%',
        panelClass:'no-padding-popup',
        position: { right: '0' },
        data: { categoryId: this.selectedServiceCategory },
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
        panelClass:'no-padding-popup',
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

  getServiceCategoriesList() {
    this._subscriptionsService
      .getServiceCategoriesList()
      .subscribe((res: any) => {
        this.serviceList$.next(res.data);
        this.selectedServiceCategory = res.data[0].masterdata_id;
        this.getServicesList();
      });
  }

  getServicesList() {
    this._subscriptionsService
      .getServicesList(this.selectedServiceCategory)
      .subscribe((res: any) => {
        this.subsriptionsList$.next(res.data);
      });
  }
}

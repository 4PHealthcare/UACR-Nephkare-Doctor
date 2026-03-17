import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { PromocodeGroups, Tag, Task } from 'app/modules/admin/apps/tasks/tasks.types';
import { APIService } from 'app/core/api/api';
import { AuthService } from 'app/core/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { OfferGroupComponent } from '../offer-group/offer-group.component';
import { OfferComponent } from '../offer/offer.component';
import { Category, Subscription } from '../../subscriptions/subscriptions.types';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
    selector       : 'tasks-list',
    templateUrl    : './list.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [
        ` .mat-dialog-container {
            padding: 0px !important;
          }
        `,
      ],
})
export class TasksListComponent implements OnInit, OnDestroy
{
    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;
    categories: Category[];
    subscriptions: Subscription[];
    drawerMode: 'side' | 'over';
    selectedTask: PromocodeGroups;
    tags: Tag[];
    tasks: Task[];
    userInfo: any;
    serviceId : number;
    offerGroups$= new BehaviorSubject<PromocodeGroups>(null);
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private config = {
        width: '600px',
      };
    searchContent: string;
    constructor(
        public dialog: MatDialog,
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseConfirmationService: FuseConfirmationService,
        private httpService: APIService,
        private auth: AuthService)
    {
        this.userInfo = JSON.parse(this.auth.user);
    }

    ngOnInit(): void
    {
        this._activatedRoute.queryParams.subscribe(params => {
           this.serviceId = params['id'] === undefined ? -1 : parseInt(params['id']);
          });
        this.GetServices();
        this.offerGroups$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((task: PromocodeGroups) => {
                this.selectedTask = task;
            });

        // Subscribe to media query change
        this._fuseMediaWatcherService.onMediaQueryChange$('(min-width: 1440px)')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((state) => {

                // Calculate the drawer mode
                this.drawerMode = state.matches ? 'side' : 'over';

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        fromEvent(this._document, 'keydown')
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter<KeyboardEvent>(event =>
                    (event.ctrlKey === true || event.metaKey) // Ctrl or Cmd
                    && (event.key === '/' || event.key === '.') // '/' or '.' key
                )
            )
            .subscribe((event: KeyboardEvent) => {
                console.log(event);
                // If the '/' pressed
                if ( event.key === '/' )
                {
                    this.createTask('task');
                }

                // If the '.' pressed
                if ( event.key === '.' )
                {
                    this.createTask('section');
                }
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    
    onBackdropClicked(): void
    {
        // Go back to the list
        this._router.navigate(['./'], {relativeTo: this._activatedRoute});
        this.GetPromoCodeGroups();
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    createTask(type: 'task' | 'section'): void
    {
        if(type === 'section') {
            this.dialog.open(OfferGroupComponent, {
                width: "35rem",
                height: "100%",
                position: { right: "0" },
              }).afterClosed().subscribe((data) => {
                if(data) {
                    this.serviceId = -1;
                    this.GetServices();
              }
            });
        } else {
            this.dialog.open(OfferComponent, {
                width: "35rem",
                height: "100%",
                position: { right: "0" },
              }).afterClosed().subscribe((data) => {
                if(data) {
                    this.serviceId = -1;
                    this.GetServices();
              }
            });
        }
    }
   
    GetPromoCodeGroups() {
       const url = `api/PromoCode/GetOffersList?SubscriptionId=${this.serviceId}&userId=${this.userInfo.user_id}`;
        this.httpService.getAll(url).subscribe((res: any) => {
            if(res?.isSuccess) {
                this.offerGroups$.next(res.data);
            }
        },(error: any) => { console.log('error', error); });
    }

    offerEdit(offer: any, groupId: string) {
        this.dialog.open(OfferComponent, {
          width: "35rem",
          height: "100%",
          position: { right: "0" },
          data: { offer, groupId },
        }).afterClosed().subscribe((data) => {
            if(data) {
                this.serviceId = -1;
                this.GetServices();
            }
        });
      }

      offerGroupEdit(offerGroup: any) {
        const action = 'edit';
        const url = `api/PromoCode/GetPromoCodeGroupById?groupid=`+offerGroup.promogroup_id;
        this.httpService.getAll(url).subscribe((res: any) => {
            if(res?.isSuccess && res.data) {
                const group = res.data;
                this.dialog.open(OfferGroupComponent, {
                    width: "35rem",
                    height: "100%",
                    position: { right: "0" },
                    data: { group, action },
                  }).afterClosed().subscribe((data) => {
                    if(data) {
                        this.serviceId = -1;
                        this.GetServices();
                    }
                });
            }
        },(error: any) => {
                console.log('error', error);
            });
      }

    GetServices() {
        const url = `api/Subscription/GetSubscriptionList?subscriptionTypeId=7`;
        this.httpService.getAll(url).subscribe((res: any) => {
            if(res?.isSuccess && res.data) {
                this.subscriptions = res.data;
            }
        },(error: any) => { console.log('error', error); });
        this.GetPromoCodeGroups();
    }

    onOptionsSelected(eve) {
        this.serviceId = eve.value;
        console.log(this.serviceId);
        this.GetPromoCodeGroups()
    }

    deleteOffer(offer: any) {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete Service',
            message: 'Are you sure you want to remove this offer? This action cannot be undone!',
            actions: {
              confirm: {
                label: 'Delete',
              },
            },
        });
        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                const url = `api/PromoCode/DeletePromoCode?codeid=`+offer.promocodeid;
                this.httpService.getAll(url).subscribe((res: any) => {
                    if(res?.isSuccess && res.data) {
                        this.GetPromoCodeGroups();
                    }
                },(error: any) => { console.log('error', error); });
            }
        });
    }

    deleteOfferGroup(offerGroup: any) {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete Service',
            message: 'Are you sure you want to remove this offer group? This action cannot be undone!',
            actions: {
              confirm: {
                label: 'Delete',
              },
            },
        });
        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                const url = `api/PromoCode/DeletePromoCodeGroup?promogroup_id=`+offerGroup.promogroup_id;
                this.httpService.getAll(url).subscribe((res: any) => {
                    if(res?.isSuccess && res.data) {
                        this.GetPromoCodeGroups();
                    }
                },(error: any) => { console.log('error', error); });
            }
        });
    }
}

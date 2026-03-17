import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatButton } from '@angular/material/button';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'app/layout/common/notifications/notifications.types';
import { NotificationsService } from 'app/layout/common/notifications/notifications.service';
import { APIService } from 'app/core/api/api';
import { AuthService } from 'app/core/auth/auth.service';
import { Router } from '@angular/router';
import { DataService } from 'app/core/user/user.resolver';

@Component({
  selector: "notifications",
  templateUrl: "./notifications.component.html",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: "notifications",
})
export class NotificationsComponent implements OnInit, OnDestroy {
  @ViewChild("notificationsOrigin") private _notificationsOrigin: MatButton;
  @ViewChild("notificationsPanel")
  private _notificationsPanel: TemplateRef<any>;

  notifications: Notification[];
  unreadCount: number = 0;
  private _overlayRef: OverlayRef;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  userInfo: any;
  isLoading: boolean = false;
  pageNumber: number = 1;
  pagesize:number = 20;
  /**
   * Constructor
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _notificationsService: NotificationsService,
    private _overlay: Overlay,
    private _viewContainerRef: ViewContainerRef,
    private httpService: APIService,
    private auth: AuthService,
    private router: Router,
    private dataservice:DataService
  ) {
    this.userInfo = JSON.parse(this.auth.user);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
     this.getAllNotificationsList()
   this.getUnreadNotificationCount()
    this.notificationEvnetListener();
    console.log('notify')
    // Subscribe to notification changes
    this._notificationsService.notifications$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((notifications: Notification[]) => {
        // Load the notifications
        // this.notifications = notifications;

        // Calculate the unread count
        this._calculateUnreadCount();
        this.getNotificationCount();

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();

    // Dispose the overlay
    if (this._overlayRef) {
      this._overlayRef.dispose();
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Open the notifications panel
   */
  openPanel(): void {
    this.notifications = [];
    this.getAllNotificationsList();
   // this.clearNotificationCount();
    // Return if the notifications panel or its origin is not defined
    if (!this._notificationsPanel || !this._notificationsOrigin) {
      return;
    }

    // Create the overlay if it doesn't exist
    if (!this._overlayRef) {
      this._createOverlay();
    }

    // Attach the portal to the overlay
    this._overlayRef.attach(
      new TemplatePortal(this._notificationsPanel, this._viewContainerRef)
    );
  }

  getNotificationCount() {
    const url = `api/Notifications/GetNotificationsCount?userId=${this.userInfo.user_id}`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        console.log("res##", res.data);
       // this.unreadCount = res.data;
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }

  notificationEvnetListener() {
    this._notificationsService.addSignalRDataListner("notifyClient", (data) => {
      
      if(data.category=='Appointment' && data.id == this.userInfo.user_id) {
        this.unreadCount += 1;
        this._changeDetectorRef.detectChanges();
      }
      
    });
}


  clearNotificationCount() {
    const url = `api/Notifications/ClickBellIconCount?userId=${this.userInfo.user_id}`;
    this.httpService.create(url, {}).subscribe(
      (res: any) => {
        console.log("res1##", res.data);
        this.unreadCount = 0;
        //this.getAllNotificationsList();
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }

  getAllNotificationsList() {
    const url = `api/Notifications/GetAllNotifications?userId=${this.userInfo.user_id}&pagesize=${this.pagesize}&pageno=${this.pageNumber}`;
    this.httpService.getAll(url).subscribe( 
      (res: any) => {

        let data = res.data ? res.data : [];
        
        if( !this.notifications || this.notifications?.length == 0) {
          this.notifications = data;
        } else if(this.notifications && this.notifications.length !== 0){
          this.notifications = [...this.notifications, ...data];
        }


        // this.notifications = res.data;
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }

  readNotification(notification: any) {
    const url = `api/Notifications/ReadNotifications?notificationId=${notification.notification_id}`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {

        this._overlayRef.detach();
        this._changeDetectorRef.detectChanges()
       
        if(notification.category == "Patient Registration"){

          if(this.router.url.includes('/dashboard')) {
            this.dataservice.setCalendarData({patientName:notification.patient_name});
          } else {
            this.router.navigate(["/dashboard"], {state:{patientName:notification.patient_name}})

          }
        }else{
          console.log(this.router.url);
          if(this.router.url.includes('/calr/calendar')) {
            this.dataservice.setCalendarData({
              patientName: notification.patient_name,
              appointmentDate:notification.appointment_date,
              doctor_id:notification.doctor_id
            });
          } else {
            this.router.navigate(["/calr/calendar"], {state:{patientName:notification.patient_name, appointmentDate:notification.next_appointment_date, doctor_id:notification.doctor_id, notification:true}}); 
          }
          

          
        }
        if(!notification.read){
          this.unreadCount -=1;
          this.getUnreadNotificationCount();
        }
        else{
          this.unreadCount;
        }
       
       
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }

  /**
   * Close the messages panel
   */
  closePanel(): void {
    this._overlayRef.detach();
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    const url = `api/Notifications/MarkAllNotificationsAsRead?userId=${this.userInfo.user_id}`;
    this.httpService.create(url, {}).subscribe(
      (res: any) => {
        console.log(res.data);
        this.unreadCount = 0;
        this._changeDetectorRef.detectChanges()
      
      },
      (error: any) => {
        console.log("error", error);
      }
    );
    this.getAllNotificationsList();
    
  }

  /**
   * Toggle read status of the given notification
   */
  toggleRead(notification: Notification): void {
    // Toggle the read status
    notification.read = !notification.read;

    // Update the notification
    this._notificationsService
      .update(notification.id, notification)
      .subscribe();
  }

  /**
   * Delete the given notification
   */
  delete(notification: Notification): void {

    const url = `api/Notifications/DeleteNotifications?notificationid=${notification.notification_id}`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {

        if(res.data) {
          // Find the index of the updated notification
         const index = this.notifications.findIndex(item => item.notification_id === notification.notification_id);

         // Delete the notification
         this.notifications.splice(index, 1);
        }
         

      },
      (error: any) => {
        console.log("error", error);
      }
    );

    // Delete the notification
    this._notificationsService.delete(notification.notification_id).subscribe();
    this.unreadCount -= 1;
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

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Create the overlay
   */
  private _createOverlay(): void {
    // Create the overlay
    this._overlayRef = this._overlay.create({
      hasBackdrop: true,
      backdropClass: "fuse-backdrop-on-mobile",
      scrollStrategy: this._overlay.scrollStrategies.block(),
      positionStrategy: this._overlay
        .position()
        .flexibleConnectedTo(
          this._notificationsOrigin._elementRef.nativeElement
        )
        .withLockedPosition(true)
        .withPush(true)
        .withPositions([
          {
            originX: "start",
            originY: "bottom",
            overlayX: "start",
            overlayY: "top",
          },
          {
            originX: "start",
            originY: "top",
            overlayX: "start",
            overlayY: "bottom",
          },
          {
            originX: "end",
            originY: "bottom",
            overlayX: "end",
            overlayY: "top",
          },
          {
            originX: "end",
            originY: "top",
            overlayX: "end",
            overlayY: "bottom",
          },
        ]),
    });

    // Detach the overlay from the portal on backdrop click
    this._overlayRef.backdropClick().subscribe(() => {
      this._overlayRef.detach();
    });
  }

  /**
   * Calculate the unread count
   *
   * @private
   */
  private _calculateUnreadCount(): void {
    let count = 0;

    if (this.notifications && this.notifications.length) {
      count = this.notifications.filter(
        (notification) => !notification.read
      ).length;
    }

    // this.unreadCount = count;
  }

  getUnreadNotificationCount(){
    const url = `api/Notifications/GetReadNotificationsCount?userId=${this.userInfo.user_id}`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        console.log("res##", res.data);
        this.unreadCount = res.data;
        this._changeDetectorRef.detectChanges();
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }

  onScroll() {
    this.pageNumber = this.pageNumber + 1; 
    
    this.getAllNotificationsList();
  }

}

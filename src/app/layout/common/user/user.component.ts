import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BooleanInput } from "@angular/cdk/coercion";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { User } from "app/core/user/user.types";
import { UserService } from "app/core/user/user.service";
import { DataService } from "app/core/user/user.resolver";

@Component({
  selector: "user",
  templateUrl: "./user.component.html",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: "user",
})
export class UserComponent implements OnInit, OnDestroy {
  /* eslint-disable @typescript-eslint/naming-convention */
  static ngAcceptInputType_showAvatar: BooleanInput;
  /* eslint-enable @typescript-eslint/naming-convention */

  @Input() showAvatar: boolean = true;
  user: any;
  photo: any;
 
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  /**
   * Constructor
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _router: Router,
    private _userService: UserService,
    private cd: ChangeDetectorRef,
    private _activateRoute: ActivatedRoute,
    private dataService: DataService
  ) {
    this.dataService.getData().subscribe((data) => {
      if(data?.fileBase64) {
        this.photo = `data:${data?.mimetype};base64,${data?.fileBase64}`;
        this.cd.detectChanges();
    }
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */

  ngOnInit(): void
  {
      // Subscribe to user changes
      this._userService.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((user: User) => {
              if(user) {
                  this.user = user;
                  if ( user.photo_folderpath && user.photo_filename) {
                      this.photo = `https://hellokidneydata.s3.ap-south-1.amazonaws.com/${this.user.photo_folderpath}/${this.user.photo_filename}`;
                      this.cd.detectChanges();
                  }
                  console.log(this.user) 
              } else {
                  this.user = {
                      user_id:0
                  };
              }
              console.log(this.user)


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
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Update the user status
   *
   * @param status
   */
  updateUserStatus(status: string): void {
    // Return if user is not available
    if (!this.user) {
      return;
    }

    // Update the user
    this._userService
      .update({
        ...this.user,
        status,
      })
      .subscribe();
  }

  /**
   * Sign out
   */
  signOut(): void {
    this._router.navigate(["/sign-out"]);
  }

  goToSettings(string) {
    console.log(string);
    this._router.navigate(["/pages/settings"]);
  }

  goToProfile() {
    this._router.navigate(["/pages/account"]);
  }

  goToActivities() {
    this._router.navigate(["/activities"]);
  }
}

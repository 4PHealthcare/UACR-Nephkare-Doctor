import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { MatDrawer } from "@angular/material/sidenav";
import { Subject, Subscription } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { FuseMediaWatcherService } from "@fuse/services/media-watcher";
import { AuthService } from "app/core/auth/auth.service";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "settings",
  templateUrl: "./settings.component.html",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit, OnDestroy {
  @ViewChild("drawer") drawer: MatDrawer;
  drawerMode: "over" | "side" = "side";
  drawerOpened: boolean = true;
  panels: any[] = [];
  user: any = {};
  data: any;
  loading: boolean = false;
  queryParamType: string = "account";
  selectedPanel: string;
  selectedText: string;

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  /**
   * Constructor
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _fuseMediaWatcherService: FuseMediaWatcherService,
    private auth: AuthService,
    private route: ActivatedRoute,
  ) {
    this.user = JSON.parse(this.auth.user);
    console.log(this.user);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    console.log(history);

    let accountPanel = [
      {
        id: "account",
        icon: "heroicons_outline:user-circle",
        title: "Update Profile",
        description: "Manage your public profile and private information",
      },
      //   {
      //     id: "apointment",
      //     icon: "mat_outline:schedule",
      //     title: "Schedule Timings",
      //     hide:
      //       this.user.role_id == 5 &&
      //       this.user.admin_account !== this.user.user_id
      //         ? false
      //         : true,
      //     description: "Doctor can give their own schedule as their wish",
      //   },

      {
        id: "security",
        icon: "heroicons_outline:lock-closed",
        title: "Change Password",
        hide: false,
        description: "Manage your password securely",
      },
      //   {
      //     id: "signature",
      //     icon: "heroicons_outline:clipboard-list",
      //     title: "Digital Signature",
      //     hide:
      //       this.user.role_id == 5 && !this.user.isadmin_account ? false : true,
      //     description: "Upload Digital Signature",
      //   },
    ];

    let settingsPanel = [
      {
        id: "adminaccount",
        icon: "mat_outline:manage_accounts",
        title: "User Management",
        hide: false,
        description: "Manage your Staff and Team mates",
        // src:'assets/icons/Usermanagement.svg'
      },

      {
        id: "prescription",
        icon: "heroicons_outline:clipboard-list",
        title: "Prescription",
        hide: this.user.isadmin_account ? false : true,
        description: "Upload Prescription header and footer",
      },
    ];

    if (this.route.snapshot["_routerState"].url == "/pages/account") {
      this.setPanelTypes(accountPanel, "account");
      this.selectedText = "Profile";
    } else if (this.route.snapshot["_routerState"].url == "/pages/settings") { 
        this.setPanelTypes(settingsPanel, "clinicsettings"); 
        this.selectedText = "Profile Settings"; 
      }

    // Subscribe to media changes
    this._fuseMediaWatcherService.onMediaChange$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({ matchingAliases }) => {
        // Set the drawerMode and drawerOpened
        if (matchingAliases.includes("lg")) {
          this.drawerMode = "side";
          this.drawerOpened = true;
        } else {
          this.drawerMode = "over";
          this.drawerOpened = false;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  setPanelTypes(type: any, selectedPanel: string) {
    // Setup available panels
    this.panels = type;
    this.selectedPanel =
      selectedPanel == "patientId"
        ? "patientId"
        : selectedPanel == "clinicsettings"
          ? "adminaccount"
          : selectedPanel == "services"
            ? "services"
            : "account";

    console.log(type);
    this.loading = false;
    this._changeDetectorRef.markForCheck();

    //  this.panels = [
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
   * Navigate to the panel
   *
   * @param panel
   */
  goToPanel(panel: string): void {
    this.selectedPanel = panel;
    console.log(this.selectedPanel);

    // Close the drawer on 'over' mode
    if (this.drawerMode === "over") {
      this.drawer.close();
    }
  }

  /**
   * Get the details of the panel
   *
   * @param id
   */
  getPanelInfo(id: string): any {
    return this.panels.find((panel) => panel.id === id);
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
}

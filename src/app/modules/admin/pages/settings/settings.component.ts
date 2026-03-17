import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { AuthService } from 'app/core/auth/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector       : 'settings',
    templateUrl    : './settings.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush 
})
export class SettingsComponent implements OnInit, OnDestroy
{
    @ViewChild('drawer') drawer: MatDrawer;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    panels: any[] = [];
    user:any = {};
    data:any;
    loading:boolean = false;
    queryParamType:string = 'account';
    selectedPanel: string;
    selectedText:string;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private auth: AuthService,
        private route: ActivatedRoute 
    )
    {
        this.user = JSON.parse(this.auth.user);
        console.log(this.user)
    }   

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        console.log(history)

        // this.route.queryParams.subscribe((params) => {
        //     console.log(params.type);
        //     this.selectedText=params.type;
        //   });

        // if(this.user.admin_account !== 3 && this.user.isadmin_account) {
        //     this.selectedPanel = 'account';
        // }

        let accountPanel = [
            {
                id         : 'account',
                icon       : 'heroicons_outline:user-circle',
                title      : 'Update Profile',
                description: 'Manage your public profile and private information'
            },
            {
                id         : 'apointment',
                icon       : 'mat_outline:schedule', 
                title      : 'Schedule Timings',
                hide : this.user.role_id == 5 &&  (this.user.admin_account !== this.user.user_id) ?   false: true,
                description: "Doctor can give their own schedule as their wish"
            },
            // {
            //     id         : 'leaves', 
            //     icon       : 'event_note', 
            //     title      : 'Apply Leave',
            //     hide : this.user.role_id == 5 &&  (this.user.admin_account !== this.user.user_id) ?   false: true,
            //     description: "Doctor can take their own leaves as their wish"
            // },
            {
                id         : 'security',
                icon       : 'heroicons_outline:lock-closed',
                title      : 'Change Password',
                hide: false,
                description: 'Manage your password securely'
            },
            {
                id         : 'signature',
                icon       : 'heroicons_outline:clipboard-list',
                title      : 'Digital Signature',
                hide: this.user.role_id == 5 &&  !this.user.isadmin_account ?   false: true,
                description: 'Upload Digital Signature' 
            },
            
        ]
        let settingsServicesPanel = [
            {
                id         : 'services',
                icon       : 'heroicons_outline:newspaper',
                title      : 'Lab and Investigation Billing',
                description: 'Manage your all Lab and Investigation billings'
            },
            {
                id         : 'OPServices',
                icon       : 'heroicons_outline:document-text',
                title      : 'OP Billing',
                description: 'Manage your all OP billing',
                hide : this.user.role_id == 474 ?   false: true,
            },
            {
                id         : 'IPServices',
                icon       : 'heroicons_outline:document-report',
                title      : 'IP Billing',
                description: 'Manage your all IP billing',
                hide : this.user.role_id == 474 ?   false: true,
            }
        ]
        let settingsPanel = [ 
            {
                id         : 'adminaccount',
                icon       : 'mat_outline:manage_accounts',
                title      : 'User Management',
                hide: false,
                description: 'Manage your Staff and Team mates',
                // src:'assets/icons/Usermanagement.svg'
            },
            // {
            //     id         : 'clinicProfile',
            //     icon       : 'heroicons_outline:office-building', 
            //     title      : 'Profile',
            //     hide: this.user.isadmin_account ? false: true,
            //     description: 'Manage your user profile information' 
            // },
            // {
            //     id         : 'serviceManagement',
            //     icon       : 'heroicons_outline:office-building', 
            //     title      : 'Service / Subscription Management',
            //     hide: false,
            //     description: 'Manage your subscription'  
            // },
            // {
            //     id         : 'specilities', 
            //     icon       : 'mat_outline:10k',  
            //     title      : 'Specialities',
            //     hide: this.user.isadmin_account ? false: true,
            //     description: 'Add your desired specialities', 
            //     // src:'assets/icons/speialities.svg'
            // },

           
           
            // {
            //     id         : 'patientId',
            //     icon       : 'heroicons_outline:identification',
            //     title      : 'Custom Patient Id',
            //     hide: this.user.isadmin_account ? false: true,
            //     description: 'Create UHID for your patient'
            // },
            {
                id         : 'prescription',
                icon       : 'heroicons_outline:clipboard-list',
                title      : 'Prescription',
                hide: this.user.isadmin_account ? false: true,
                description: 'Upload Prescription header and footer'
            },
            // {
            //     id         : 'services',
            //      icon       : 'mat_outline:receipt_long',
            //     title      : 'Lab and Investigation Billing',
            //     description: 'Manage your all Lab and Investigation billings',
            //     // src:'assets/icons/Labinvestgbilling.svg'
            // },
            // {
            //     id         : 'OPServices',
            //      icon       : 'mat_outline:receipt',
            //     title      : 'OP Billing',
            //     description: 'Manage your all OP billing',
            //     // src:'assets/icons/OPbilling.svg'
               
            // },
            // {
            //     id         : 'IPServices',
            //     icon       : 'mat_outline:airline_seat_individual_suite',
            //     title      : 'IP Billing',
            //     description: 'Manage your all IP billing',
            //     // src:'assets/icons/IPbilling.svg'
              
            // },
            // {
            //     id         : 'other',
            //     icon       : 'heroicons_outline:document-report',
            //     title      : 'Other',
            //     description: 'Manage your free consultation period',
              
            // }
            
        ]

        


        if (this.route.snapshot['_routerState'].url == '/pages/account') {
            this.setPanelTypes(accountPanel, 'account'); 
            this.selectedText = 'Profile';
        } else if(history.state && history.state.patientUniqueId == 'no'){
            console.log(history.state.patientUniqueId);
            
            this.setPanelTypes(settingsPanel, 'patientId');
            this.selectedText = 'patientId';
        }else {

            if (this.user.isadmin_account ||  this.user.role_id == 82580 || this.user.role_id == 5) {

                this.setPanelTypes(settingsPanel, 'clinicsettings'); 
                this.selectedText = 'Profile Settings'; 

            } else {

                this.setPanelTypes(settingsServicesPanel, 'services');
                this.selectedText = 'Settings';
                
            }


        }

    //     this.route.queryParams.subscribe(queryParams => {
    //         this.loading = true;
    //         let type:string;
    
    //         if (this.user.admin_account !== 3 && this.user.isadmin_account) {
    //             type = queryParams.type ? queryParams.type : 'clinicsettings';
    //         } else {
    //             type = queryParams.type ? queryParams.type : 'account';
    //         }

    //         if (type=='clinicsettings') {
    //             this.setPanelTypes(settingsPanel, type);
    //         }else {
    //             this.setPanelTypes(accountPanel, type);
    //         }
            
    //    });

       

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                // Set the drawerMode and drawerOpened
                if ( matchingAliases.includes('lg') )
                {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                }
                else
                {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

            
    }

    setPanelTypes(type:any, selectedPanel:string) {

    // Setup available panels
    this.panels = type; 
    this.selectedPanel = selectedPanel == 'patientId' ? 'patientId' : selectedPanel == 'clinicsettings' ? 'adminaccount' : selectedPanel=='services' ? 'services' : 'account';

    console.log(type);
    this.loading = false;
    this._changeDetectorRef.markForCheck();

//  this.panels = [
            
            
           
           
           
          
//     // {
//     //     id         : 'patientId',
//     //     icon       : 'heroicons_outline:lock-closed',
//     //     title      : 'Custom Patient Id',
//     //     hide: this.user.admin_account !== 3 && this.user.isadmin_account ? false: true,
//     //     description: 'Manage your password and 2-step verification preferences'
//     // }
//     // {
//     //     id         : 'plan-billing',
//     //     icon       : 'heroicons_outline:credit-card',
//     //     title      : 'Plan & Billing',
//     //     description: 'Manage your subscription plan, payment method and billing information'
//     // },
//     // {
//     //     id         : 'notifications',
//     //     icon       : 'heroicons_outline:bell',
//     //     title      : 'Notifications',
//     //     description: 'Manage when you\'ll be notified on which channels'
//     // },
//     // {
//     //     id         : 'team',
//     //     icon       : 'heroicons_outline:user-group',
//     //     title      : 'Team',
//     //     hide: (this.user.role_id == 1 || this.user.role_id==2) ? false: true,
//     //     description: 'Manage your existing team and change roles/permissions'
//     // }
// ];
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Navigate to the panel
     *
     * @param panel
     */
    goToPanel(panel: string): void
    {
        this.selectedPanel = panel;
        console.log(this.selectedPanel)

        // Close the drawer on 'over' mode
        if ( this.drawerMode === 'over' )
        {
            this.drawer.close();
        }
    }

    /**
     * Get the details of the panel
     *
     * @param id
     */
    getPanelInfo(id: string): any
    {
        return this.panels.find(panel => panel.id === id);
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }
}

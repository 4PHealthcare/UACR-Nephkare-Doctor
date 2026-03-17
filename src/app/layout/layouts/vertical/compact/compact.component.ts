import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { Navigation } from 'app/core/navigation/navigation.types';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';

@Component({
    selector     : 'compact-layout',
    templateUrl  : './compact.component.html',
    encapsulation: ViewEncapsulation.None
})
export class CompactLayoutComponent implements OnInit, OnDestroy
{
    isScreenSmall: boolean;
    navigation: Navigation;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
     hospitals:any [ ] = [];
     adminInfo:any;
     clinicId:any;
     user: User;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _navigationService: NavigationService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
        private auth: AuthService,
        private _userService: UserService,
        private _changeDetectorRef: ChangeDetectorRef

    )
    {

        this._userService.user$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((user: User) => {
            if(user) {
                this.user = user;
            } else {
                this.user = {
                    user_id:0
                };
            }
            console.log(this.user)


            // Mark for check
            this._changeDetectorRef.markForCheck();
        });

        if(this.auth.user) {
            this.adminInfo = JSON.parse(this.auth.user);
 
            
            if(this.adminInfo && this.adminInfo.admin_account != 3) {
                this.hospitals.push({
                    clinic_name: this.adminInfo.clinic_name,
                    clinicid: this.adminInfo.admin_account,
                    admin:true
                  })
                  this.clinicId = this.adminInfo.admin_account;
            }

        }


    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for current year
     */
    get currentYear(): number
    {
        return new Date().getFullYear();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        console.log(this.adminInfo);
        // Subscribe to navigation data
        this._navigationService.navigation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((navigation: Navigation) => {

            //hide quue and reports for hellokidney doctor    
            if (this.adminInfo.admin_account == 3) { 
                navigation.compact = navigation.compact.filter(nav => !(nav.id == "repts" || nav.id =="queue"|| nav.id=="requests" )  ); 
                if(this.adminInfo.role_id == 6 ){
                    navigation.compact = navigation.compact.filter(nav => ( nav.id !="pages")  ); 
                }
            }
            if (this.adminInfo.admin_account === this.adminInfo.user_id) {
                navigation.compact = navigation.compact.filter(nav => !(nav.id == "queue" || nav.id == "hospitalFollowup")  ); 
            }
            if (this.adminInfo.role_id == 5) {
                navigation.compact = navigation.compact.filter(nav => !(nav.id == "tests" )  ); 
            }
             // second opionion doctor show request menu   
            if (this.adminInfo.admin_account != 3) {
                navigation.compact = navigation.compact.filter(nav => !(nav.id == "requests" || nav.id =="subscriptions" || nav.id =="kidneyCareSubscriptions")  ); 
            }
            //lab role
            if (this.adminInfo.role_id == 477) {
                navigation.compact = navigation.compact.filter(nav => nav.id == "lablist" || nav.id == "repts" || nav.id == "tests" || nav.id == "pages" || nav.id == "addtests" || nav.id == "labtemplate" ); 
                
                
            } else {
                //frontdesk, doctor or other role
                navigation.compact = navigation.compact.filter(nav => !(nav.id=="lablist" || nav.id == "addtests" || nav.id == "labtemplate"));

                //frontdesk or carecordinator
                if (this.adminInfo.role_id == 474 || this.adminInfo.role_id == 481) { 
                    navigation.compact = navigation.compact.filter(nav =>  (this.adminInfo.role_id == 474 && !(nav.id == "activity") ) || (this.adminInfo.role_id == 481 && nav.id != "activity") );
                }    
            }               
                this.navigation = navigation;

                
            });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                // Check if the screen is small
                this.isScreenSmall = !matchingAliases.includes('md');
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle navigation
     *
     * @param name
     */
    toggleNavigation(name: string): void
    {
        // Get the navigation
        const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(name);

        if ( navigation )
        {
            // Toggle the opened status
            navigation.toggle();
        }
    }
}

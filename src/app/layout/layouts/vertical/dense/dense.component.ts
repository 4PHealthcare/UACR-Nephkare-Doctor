import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { Navigation } from 'app/core/navigation/navigation.types';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector     : 'dense-layout',
    templateUrl  : './dense.component.html',
    encapsulation: ViewEncapsulation.None
})
export class DenseLayoutComponent implements OnInit, OnDestroy
{
    isScreenSmall: boolean;
    navigation: Navigation;
    navigationAppearance: 'default' | 'dense' = 'dense';
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _navigationService: NavigationService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
        private _userService:UserService
    )
    {
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
        let user:any;

        // Subscribe to user changes
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: any) => {
                this.getNavigation(user);
            },
            error => {
                this.getNavigation();
            }
            );

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

    verifyRestrictions(name:string, user:any):boolean {
        let hasAccess = true;
        if(user.user_restrictions && user.user_restrictions.length !==0) {
            for(let i=0;i<user.user_restrictions.length;i++){
                if(user.user_restrictions[i].feature_name == name) {
                    hasAccess = user.user_restrictions[i].has_access;
                    break;
                }

            }
        }
        return hasAccess;
    }

    getNavigation(user?:any) {
        // Subscribe to navigation data
        this._navigationService.navigation$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((navigation: Navigation) => {
            console.log('uahoo');
            if(user && navigation) {

                navigation.default.map((elem) => {
                     return {
                      ...elem,
                      children: elem.children.map((item) => {
                       if (!this.verifyRestrictions(item.key, user)) {
                        item.hidden = true;
                       }
                       return item;
                      }),
                     };
                    
                   });

                  
            this.navigation = navigation;            
            }else {
                this.navigation = navigation;
            }

        });
    }

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

    /**
     * Toggle the navigation appearance
     */
    toggleNavigationAppearance(): void
    {
        this.navigationAppearance = (this.navigationAppearance === 'default' ? 'dense' : 'default');
    }
}

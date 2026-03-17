import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDrawer } from '@angular/material/sidenav';
import { fromEvent, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { Tag, Role } from '../roles.types';
import { RolesService } from '../roles.service';

@Component({
    selector       : 'roles-list',
    templateUrl    : './list.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RolesListComponent implements OnInit, OnDestroy
{
    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;

    drawerMode: 'side' | 'over';
    selectedRole: Role;
    tags: Tag[];
    roles: Role[];
    rolesCount: any = {
        completed : 0,
        incomplete: 0,
        total     : 0
    };
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _rolesService: RolesService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Get the tags
        this._rolesService.tags$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tags: Tag[]) => {
                this.tags = tags;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the roles
        this._rolesService.roles$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((roles: Role[]) => {
                this.roles = roles;

                // Update the counts
                this.rolesCount.total = this.roles.filter(role => role.type === 'task').length;
                this.rolesCount.completed = this.roles.filter(role => role.type === 'task' && role.completed).length;
                this.rolesCount.incomplete = this.rolesCount.total - this.rolesCount.completed;

                // Mark for check
                this._changeDetectorRef.markForCheck();

                // Update the count on the navigation
                setTimeout(() => {

                    // Get the component -> navigation data -> item
                    const mainNavigationComponent = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>('mainNavigation');

                    // If the main navigation component exists...
                    if ( mainNavigationComponent )
                    {
                        const mainNavigation = mainNavigationComponent.navigation;
                        const menuItem = this._fuseNavigationService.getItem('apps.roles', mainNavigation);

                        // Update the subtitle of the item
                        menuItem.subtitle = this.rolesCount.incomplete + ' remaining roles';

                        // Refresh the navigation
                        mainNavigationComponent.refresh();
                    }
                });
            });

        // Get the role
        this._rolesService.role$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((role: Role) => {
                this.selectedRole = role;

                // Mark for check
                this._changeDetectorRef.markForCheck();
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

        // Listen for shortcuts
        fromEvent(this._document, 'keydown')
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter<KeyboardEvent>(event =>
                    (event.ctrlKey === true || event.metaKey) // Ctrl or Cmd
                    && (event.key === '/' || event.key === '.') // '/' or '.' key
                )
            )
            .subscribe((event: KeyboardEvent) => {

                // If the '/' pressed
                if ( event.key === '/' )
                {
                    this.createRole('role');
                }

                // If the '.' pressed
                if ( event.key === '.' )
                {
                    this.createRole('section');
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * On backdrop clicked
     */
    onBackdropClicked(): void
    {
        // Go back to the list
        this._router.navigate(['./'], {relativeTo: this._activatedRoute});

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create role
     *
     * @param type
     */
    createRole(type: 'role' | 'section'): void
    {
        // Create the role
        this._rolesService.createRole(type).subscribe((newRole) => {

            // Go to the new role
            this._router.navigate(['./', newRole.id], {relativeTo: this._activatedRoute});

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * Toggle the completed status
     * of the given role
     *
     * @param role
     */
    toggleCompleted(role: Role): void
    {
        // Toggle the completed status
        role.completed = !role.completed;

        // Update the role on the server
        this._rolesService.updateRole(role.id, role).subscribe();

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Role dropped
     *
     * @param event
     */
    dropped(event: CdkDragDrop<Role[]>): void
    {
        // Move the item in the array
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

        // Save the new order
        this._rolesService.updateRolesOrders(event.container.data).subscribe();

        // Mark for check
        this._changeDetectorRef.markForCheck();
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

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { BlogsService } from '../blogs.service';
import { Label } from '../blogs.types';
import { debounceTime, filter, switchMap, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

@Component({
    selector       : 'blogs-labels',
    templateUrl    : './labels.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogsLabelsComponent implements OnInit, OnDestroy
{
    labels$: Observable<Label[]>;

    labelChanged: Subject<Label> = new Subject<Label>();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _blogsService: BlogsService
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
        // Get the labels
        this.labels$ = this._blogsService.labels$;

        // Subscribe to label updates
        this.labelChanged
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(500),
                filter(label => label.title.trim() !== ''),
                switchMap(label => this._blogsService.updateLabel(label)))
            .subscribe(() => {

                // Mark for check
                this._changeDetectorRef.markForCheck();
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
     * Add label
     *
     * @param title
     */
    addLabel(title: string): void
    {
        this._blogsService.addLabel(title).subscribe();
    }

    /**
     * Update label
     */
    updateLabel(label: Label): void
    {
        this.labelChanged.next(label);
    }

    /**
     * Delete label
     *
     * @param id
     */
    deleteLabel(id: string): void
    {
        this._blogsService.deleteLabel(id).subscribe(() => {

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
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

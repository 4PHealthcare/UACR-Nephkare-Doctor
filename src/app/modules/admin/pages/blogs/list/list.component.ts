import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map, takeUntil, switchMap, take } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { BlogsService } from '../blogs.service';
import { Label, Blog } from '../blogs.types';
import { cloneDeep } from 'lodash-es';
import { Router } from '@angular/router';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({ 
    selector       : 'blogs-list',
    templateUrl    : './list.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
}) 
export class BlogsListComponent implements OnInit, OnDestroy
{
    labels: any[] = [
        {
            name:'Published',
            isPublish: true,
            isDraft: false,
            isArchive: false
        },
        {
            name:'Drafts',
            isPublish: false,
            isDraft: true,
            isArchive: false
        },
        {
            name:'Archive',
            isPublish: false,
            icon:'trash',
            isDraft: false,
            isArchive: true
        }
    ];
    blogs$ = new BehaviorSubject<any>(null);
    filterStatus:string = 'Published';

    selectedCategory: number;

    cars = [
        { id: 1, name: 'Volvo' },
        { id: 2, name: 'Saab' },
        { id: 3, name: 'Opel' },
        { id: 4, name: 'Audi' },
    ];


    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    filter$: BehaviorSubject<string> = new BehaviorSubject('Published');
    searchQuery$: BehaviorSubject<string> = new BehaviorSubject(null);
    masonryColumns: number = 4;
    blogsData:any[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _matDialog: MatDialog,
        private _blogsService: BlogsService,
        private _router: Router
        
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
        // Request the data from the server
        this.getBlogsByStatus(this.filterStatus);
       
        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                // Set the drawerMode and drawerOpened if the given breakpoint is active
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

                // Set the masonry columns
                //
                // This if block structured in a way so that only the
                // biggest matching alias will be used to set the column
                // count.
                if ( matchingAliases.includes('xl') )
                {
                    this.masonryColumns = 4;
                }
                else if ( matchingAliases.includes('lg') )
                {
                    this.masonryColumns = 4;
                }
                else if ( matchingAliases.includes('md') )
                {
                    this.masonryColumns = 3;
                }
                else if ( matchingAliases.includes('sm') )
                {
                    this.masonryColumns = 2;
                }
                else
                {
                    this.masonryColumns = 1;
                }

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

   

    getBlogsByStatus(label:string): void {
        // this.loading = true;
        // filteredBlogs = filteredBlogs.filter(blog => blog.title.toLowerCase().includes(searchQuery) || blog.content.toLowerCase().includes(searchQuery));
        this.blogs$.next(null);
        this.blogsData = [];

        this._blogsService.getBlogs(label)
        .subscribe(
            (res: any) => {
                

                if(res.data && res.isSuccess) {
                    

                    const blogs = res.data.map(function(blog:any) {
                        if(blog.featureimg_filename && blog.featureimg_folderpath) {
                            blog.img = `https://hellokidneydata.s3.ap-south-1.amazonaws.com/${blog.featureimg_folderpath}/${blog.featureimg_filename}`;
                        }
                        return blog;
                    });
                    
                    this.blogsData = blogs;
                    this.blogs$.next(blogs || []);

                }else {
                    this.blogs$.next(res.data || []);
                }

            //   this.membersInfo$.next(res.data.filter(f=>f.role_id === 2));
            },
            (error: any) => {
              this.blogs$.next([]);
              console.warn("error", error);
            }
          );
    }

    /**
     * Open the edit labels dialog
     */
    openEditLabelsDialog(): void
    {
     }

    

    /**
     * Filter by archived
     */
    filterByArchived(): void
    {
        this.filter$.next('archived');
    }

    /**
     * Filter by label
     *
     * @param label
     */
    filterByLabel(label: string): void
    {

        this.filterStatus = label;

        this.getBlogsByStatus(label);
    }

    /**
     * Filter by query
     *
     * @param query
     */
    filterByQuery(query: string): void
    {
        this.blogs$.next(this.blogsData);    


        if(query && query.length > 2 ) {
            const blogs = this.blogsData.filter(blog => blog.title.toLowerCase().includes(query.toLowerCase()));
            this.blogs$.next(blogs);    
        }

    }

    /**
     * Reset filter
     */
    resetFilter(): void
    {
        this.filter$.next('blogs');
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

    openBlogDialog(blog:any) {
        console.log(blog);
       
        this._router.navigateByUrl('/'+blog.id);

    }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, concat, Observable, of, throwError } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { Label, Blog, Task } from './blogs.types';
import { cloneDeep } from 'lodash-es';
import { APIService } from '../../../../core/api/api';

@Injectable({
    providedIn: 'root'
})
export class BlogsService
{
    // Private
    private _labels: BehaviorSubject<Label[] | null> = new BehaviorSubject(null);
    private _blog: BehaviorSubject<Blog | null> = new BehaviorSubject(null);
    private _blogs: BehaviorSubject<Blog[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _api:APIService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for labels
     */
    get labels$(): Observable<Label[]>
    {
        return this._labels.asObservable();
    }

    /**
     * Getter for blogs
     */
    get blogs$(): Observable<Blog[]>
    {
        return this._blogs.asObservable();
    }

    /**
     * Getter for blog
     */
    get blog$(): Observable<Blog>
    {
        return this._blog.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get labels
     */
    getLabels(): Observable<Label[]>
    {
        return this._httpClient.get<Label[]>('api/pages/blogs/labels').pipe(
            tap((response: Label[]) => {
                this._labels.next(response);
            })
        );
    }

    /**
     * Add label
     *
     * @param title
     */
    addLabel(title: string): Observable<Label[]>
    {
        return this._httpClient.post<Label[]>('api/pages/blogs/labels', {title}).pipe(
            tap((labels) => {

                // Update the labels
                this._labels.next(labels);
            })
        );
    }

    /**
     * Update label
     *
     * @param label
     */
    updateLabel(label: Label): Observable<Label[]>
    {
        return this._httpClient.patch<Label[]>('api/pages/blogs/labels', {label}).pipe(
            tap((labels) => {

                // Update the blogs
              //  this.getBlogs().subscribe();

                // Update the labels
                this._labels.next(labels);
            })
        );
    }

    /**
     * Delete a label
     *
     * @param id
     */
    deleteLabel(id: string): Observable<Label[]>
    {
        return this._httpClient.delete<Label[]>('api/pages/blogs/labels', {params: {id}}).pipe(
            tap((labels) => {

                // Update the blogs
               // this.getBlogs().subscribe();

                // Update the labels
                this._labels.next(labels);
            })
        );
    }

    /**
     * Add tags
     * 
     * @param tag

     */
     addTags(tag:any): Observable<Blog[]>
     {
         return this._api.create(`api/Articals/SaveArticleCategory`, tag);
     }


    /**
     * Get tags
     */
     getTags(): Observable<Blog[]>
     {
         return this._api.getAll(`api/Articals/GetArticleCategory`);
     }

    /**
     * Get blogs
     */
    getBlogs(status:string): Observable<Blog[]>
    {
        return this._api.getAll(`api/Articals/GetArticleByStatus?Status=${status}`);
    }

    /**
     * Get blog by id
     */
    getBlogById(id: string): Observable<Blog>
    {

        return this._api.get(`api/Articals/GetArticleById?articleid=`, id);

    }

    /**
     * Add task to the given blog
     *
     * @param blog
     * @param task
     */
    addTask(blog: Blog, task: string): Observable<Blog>
    {
        return this._httpClient.post<Blog>('api/pages/blogs/tasks', {
            blog,
            task
        });
    }

    /**
     * Create blog
     *
     * @param blog
     */
    createBlog(blog: any): Observable<Blog>
    {
        return this._api.create('api/Articals/ManageArticals', blog)
    }

    /**
     * Update the blog
     *
     * @param blog
     */
    updateBlog(blog: any): Observable<Blog>
    {
        // Clone the blog to prevent accidental reference based updates
        const updatedBlog = cloneDeep(blog) as any;

        // Before sending the blog to the server, handle the labels
        if ( updatedBlog.labels.length )
        {
            updatedBlog.labels = updatedBlog.labels.map(label => label.id);
        }

        return this._httpClient.patch<Blog>('api/pages/blogs', {updatedBlog}).pipe(
            tap((response) => {

                // Update the blogs
               // this.getBlogs().subscribe();
            })
        );
    }

    /**
     * Delete the blog
     *
     * @param blog
     */
    deleteBlog(blogId: any) {
        return this._api.get('api/Articals/ArchiveArtical?articleid=', blogId)
    }
}

import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { FuseMockApiService } from '@fuse/lib/mock-api/mock-api.service';
import { labels as labelsData, blogs as blogsData } from './data';
import { FuseMockApiUtils } from '@fuse/lib/mock-api';

@Injectable({
    providedIn: 'root'
})
export class BlogsMockApi
{
    private _labels: any[] = labelsData;
    private _blogs: any[] = blogsData;

    /**
     * Constructor
     */
    constructor(private _fuseMockApiService: FuseMockApiService)
    {
        // Register Mock API handlers
        this.registerHandlers();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Register Mock API handlers
     */
    registerHandlers(): void
    {
        // -----------------------------------------------------------------------------------------------------
        // @ Labels - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet('api/pages/blogs/labels')
            .reply(() => [
                200,
                cloneDeep(this._labels)
            ]);

        // -----------------------------------------------------------------------------------------------------
        // @ Labels - POST
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onPost('api/pages/blogs/labels')
            .reply(({request}) => {

                // Create a new label
                const label = {
                    id   : FuseMockApiUtils.guid(),
                    title: request.body.title
                };

                // Update the labels
                this._labels.push(label);

                return [
                    200,
                    cloneDeep(this._labels)
                ];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Labels - PATCH
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onPatch('api/pages/blogs/labels')
            .reply(({request}) => {

                // Get label
                const updatedLabel = request.body.label;

                // Update the label
                this._labels = this._labels.map((label) => {
                    if ( label.id === updatedLabel.id )
                    {
                        return {
                            ...label,
                            title: updatedLabel.title
                        };
                    }

                    return label;
                });

                return [
                    200,
                    cloneDeep(this._labels)
                ];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Labels - DELETE
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onDelete('api/pages/blogs/labels')
            .reply(({request}) => {

                // Get label id
                const id = request.params.get('id');

                // Delete the label
                this._labels = this._labels.filter(label => label.id !== id);

                // Go through blogs and delete the label
                this._blogs = this._blogs.map(blog => ({
                    ...blog,
                    labels: blog.labels.filter(item => item !== id)
                }));

                return [
                    200,
                    cloneDeep(this._labels)
                ];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Blog Tasks - POST
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onPost('api/pages/blogs/tasks')
            .reply(({request}) => {

                // Get blog and task
                let updatedBlog = request.body.blog;
                const task = request.body.task;

                // Update the blog
                this._blogs = this._blogs.map((blog) => {
                    if ( blog.id === updatedBlog.id )
                    {
                        // Update the tasks
                        if ( !blog.tasks )
                        {
                            blog.tasks = [];
                        }

                        blog.tasks.push({
                            id       : FuseMockApiUtils.guid(),
                            content  : task,
                            completed: false
                        });

                        // Update the updatedBlog with the new task
                        updatedBlog = cloneDeep(blog);

                        return {
                            ...blog
                        };
                    }

                    return blog;
                });

                return [
                    200,
                    updatedBlog
                ];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Blogs - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet('api/pages/blogs/all')
            .reply(() => {

                // Clone the labels and blogs
                const labels = cloneDeep(this._labels);
                let blogs = cloneDeep(this._blogs);

                // Attach the labels to the blogs
                blogs = blogs.map(blog => (
                    {
                        ...blog,
                        labels: blog.labels.map(labelId => labels.find(label => label.id === labelId))
                    }
                ));

                return [
                    200,
                    blogs
                ];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Blogs - POST
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onPost('api/pages/blogs')
            .reply(({request}) => {

                // Get blog
                const blog = request.body.blog;

                // Add an id
                blog.id = FuseMockApiUtils.guid();

                // Push the blog
                this._blogs.push(blog);

                return [
                    200,
                    blog
                ];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Blogs - PATCH
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onPatch('api/pages/blogs')
            .reply(({request}) => {

                // Get blog
                const updatedBlog = request.body.updatedBlog;

                // Update the blog
                this._blogs = this._blogs.map((blog) => {
                    if ( blog.id === updatedBlog.id )
                    {
                        return {
                            ...updatedBlog
                        };
                    }

                    return blog;
                });

                return [
                    200,
                    updatedBlog
                ];
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Blogs - DELETE
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onDelete('api/pages/blogs')
            .reply(({request}) => {

                // Get the id
                const id = request.params.get('id');

                // Find the blog and delete it
                this._blogs.forEach((item, index) => {

                    if ( item.id === id )
                    {
                        this._blogs.splice(index, 1);
                    }
                });

                // Return the response
                return [200, true];
            });
    }
}

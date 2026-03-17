import { Route } from '@angular/router';
import { BlogsComponent } from './blogs.component';
import { BlogsListComponent } from './list/list.component';
import { BlogsAddComponent } from './add/add.component';

export const blogsRoutes: Route[] = [
    {
        path     : '',
        component: BlogsComponent,
        children : [
            {
                path     : '',
                component: BlogsListComponent
            },
            {
                path     : ':id',
                component: BlogsAddComponent
            }
        ],
    }
];

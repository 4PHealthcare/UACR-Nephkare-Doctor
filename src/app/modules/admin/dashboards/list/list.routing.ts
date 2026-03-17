import { Route } from '@angular/router';
import { ListComponent } from 'app/modules/admin/dashboards/list/list.component';
import { ListResolver } from 'app/modules/admin/dashboards/list/list.resolvers';

export const ListRoutes: Route[] = [
    {
        path     : '',
        component: ListComponent,
        resolve  : {
            data: ListResolver
        }
    }
];

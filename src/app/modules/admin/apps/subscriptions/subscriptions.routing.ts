import { Route } from '@angular/router';
import { SubscriptionsDetailsComponent } from './details/details.component';
import { SubscriptionsListComponent } from './list/list.component';
import { SubscriptionsComponent } from './subscriptions.component';
import { SubscriptionsCategoriesResolver, SubscriptionsCourseResolver, SubscriptionsCoursesResolver } from './subscriptions.resolvers';

export const subscriptionsRoutes: Route[] = [
    {
        path     : '',
        component: SubscriptionsComponent,
        resolve  : {
            categories: SubscriptionsCategoriesResolver
        },
        children : [
            {
                path     : '',
                pathMatch: 'full',
                component: SubscriptionsListComponent,
                resolve  : {
                    courses: SubscriptionsCoursesResolver
                }
            },
            {
                path     : ':id',
                component: SubscriptionsDetailsComponent,
                resolve  : {
                    course: SubscriptionsCourseResolver
                }
            }
        ]
    }
];

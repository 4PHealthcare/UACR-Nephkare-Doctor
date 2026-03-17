import { Route } from '@angular/router';
import { HistoriesComponent } from 'app/modules/admin/apps/history-popups/histories.component';

export const historiesRoutes: Route[] = [
    {
        path     : '',
        component: HistoriesComponent
    }
];

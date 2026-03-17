import { Route } from '@angular/router';
import { CanDeactivateTasksDetails } from './roles.guards';
import { RolesResolver, RolesTagsResolver, RolesRoleResolver } from './roles.resolvers';
import { RolesComponent } from './roles.component';
import { TasksListComponent } from 'app/modules/admin/apps/tasks/list/list.component';
import { TasksDetailsComponent } from 'app/modules/admin/apps/tasks/details/details.component';

export const RolesRoutingModule: Route[] = [
  {
      path     : '',
      component: RolesComponent,
      resolve  : {
          tags: RolesTagsResolver
      },
      children : [
          {
              path     : '',
              component: TasksListComponent,
              resolve  : {
                  tasks: RolesResolver
              },
              children : [
                  {
                      path         : ':id',
                      component    : TasksDetailsComponent,
                      resolve      : {
                          task: RolesRoleResolver
                      },
                      canDeactivate: [CanDeactivateTasksDetails]
                  }
              ]
          }
      ]
  }
];
import { Route } from '@angular/router';
import { UsersComponent } from 'app/modules/admin/apps/users/users.component';
import { InventoryBrandsResolver, InventoryCategoriesResolver, InventoryProductsResolver, InventoryTagsResolver, InventoryVendorsResolver } from 'app/modules/admin/apps/users/users.resolvers';

export const usersRoutes: Route[] = [
    {
        path      : '',
        pathMatch : 'full',
        component: UsersComponent,
        children : [
            {
                path     : '',
                component: UsersComponent,
                resolve  : {
                    brands    : InventoryBrandsResolver,
                    categories: InventoryCategoriesResolver,
                    products  : InventoryProductsResolver,
                    tags      : InventoryTagsResolver,
                    vendors   : InventoryVendorsResolver
                }
            }
        ]
    }
    
];

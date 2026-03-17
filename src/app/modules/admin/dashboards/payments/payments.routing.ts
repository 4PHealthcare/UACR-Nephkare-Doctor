import { Route } from '@angular/router';
import { PaymentsComponent } from './payments.component';
import { InventoryBrandsResolver, InventoryCategoriesResolver, InventoryProductsResolver, InventoryTagsResolver, InventoryVendorsResolver } from './payments.resolvers';

export const financeRoutes: Route[] = [
    {
        path     : '',
        component: PaymentsComponent,
        children : [
            {
                path     : '',
                component: PaymentsComponent,
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

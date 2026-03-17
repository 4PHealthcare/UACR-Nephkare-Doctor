import { Route } from '@angular/router';
import { CustomerSupportComponent } from './customer-support.component';
import { InventoryBrandsResolver, InventoryCategoriesResolver, InventoryProductsResolver, InventoryTagsResolver, InventoryVendorsResolver } from 'app/modules/admin/apps/users/users.resolvers';
import { ContactsCountriesResolver } from 'app/modules/admin/apps/contacts/contacts.resolvers';

export const CustomerSupportRoutes: Route[] = [
    {
        path      : '',
        pathMatch : 'full',
        component: CustomerSupportComponent,
        children : [
            {
                path     : '',
                component: CustomerSupportComponent,
                resolve  : {
                    brands    : InventoryBrandsResolver,
                    categories: InventoryCategoriesResolver,
                    products  : InventoryProductsResolver,
                    tags      : InventoryTagsResolver,
                    vendors   : InventoryVendorsResolver,
                    countries : ContactsCountriesResolver
                }
            }
        ]
    }
    
];

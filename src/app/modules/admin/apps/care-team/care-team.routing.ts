import { Route } from '@angular/router';
import { CareTeamComponent } from './care-team.component';
import { BrandsResolver, InventoryCategoriesResolver, CareTeamsResolver, TagsResolver, VendorsResolver } from 'app/modules/admin/apps/care-team/care-team.resolvers';
import { ContactsCountriesResolver } from 'app/modules/admin/apps/contacts/contacts.resolvers';

export const CustomerSupportRoutes: Route[] = [
    {
        path      : '',
        pathMatch : 'full',
        component: CareTeamComponent,
        children : [
            {
                path     : '',
                component: CareTeamComponent,
                resolve  : {
                    brands    : BrandsResolver,
                    categories: InventoryCategoriesResolver,
                    products  : CareTeamsResolver,
                    tags      : TagsResolver,
                    vendors   : VendorsResolver,
                    countries : ContactsCountriesResolver
                }
            }
        ]
    }
    
];

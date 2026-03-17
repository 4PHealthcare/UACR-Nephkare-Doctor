import { Route } from '@angular/router';
import { DoctorsComponent } from './doctors.component';
import { BrandsResolver, InventoryCategoriesResolver, DoctorsResolver, TagsResolver, VendorsResolver } from './doctors.resolvers';
import { ContactsCountriesResolver } from 'app/modules/admin/apps/contacts/contacts.resolvers';

export const DoctorRoutes: Route[] = [
    {
        path      : '',
        pathMatch : 'full', 
        component: DoctorsComponent,
        children : [
            {
                path     : '',
                component: DoctorsComponent,
                resolve  : {
                    brands    : BrandsResolver,
                    categories: InventoryCategoriesResolver,
                    products  : DoctorsResolver,
                    tags      : TagsResolver,
                    vendors   : VendorsResolver,
                    countries : ContactsCountriesResolver
                }
            }
        ]
    }
    
];

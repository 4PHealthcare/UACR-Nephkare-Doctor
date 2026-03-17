import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UsersService } from 'app/modules/admin/apps/users/users.service';
import { InventoryBrand, InventoryCategory, InventoryPagination, InventoryProduct, InventoryTag, InventoryVendor } from 'app/modules/admin/apps/users/users.types';

@Injectable({
    providedIn: 'root'
})
export class InventoryBrandsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _usersService: UsersService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<InventoryBrand[]>
    {
        return this._usersService.getBrands();
    }
}

@Injectable({
    providedIn: 'root'
})
export class InventoryCategoriesResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _usersService: UsersService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<InventoryCategory[]>
    {
        return this._usersService.getCategories();
    }
}

@Injectable({
    providedIn: 'root'
})
export class InventoryProductResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _usersService: UsersService,
        private _router: Router
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<InventoryProduct>
    {
        return this._usersService.getProductById(route.paramMap.get('id'))
                   .pipe(
                       // Error here means the requested product is not available
                       catchError((error) => {

                           // Log the error
                           console.error(error);

                           // Get the parent url
                           const parentUrl = state.url.split('/').slice(0, -1).join('/');

                           // Navigate to there
                           this._router.navigateByUrl(parentUrl);

                           // Throw an error
                           return throwError(error);
                       })
                   );
    }
}

@Injectable({
    providedIn: 'root'
})
export class InventoryProductsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _usersService: UsersService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: InventoryPagination; products: InventoryProduct[] }>
    {
        return this._usersService.getProducts();
    }
}

@Injectable({
    providedIn: 'root'
})
export class InventoryTagsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _usersService: UsersService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<InventoryTag[]>
    {
        return this._usersService.getTags();
    }
}

@Injectable({
    providedIn: 'root'
})
export class InventoryVendorsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _usersService: UsersService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<InventoryVendor[]>
    {
        return this._usersService.getVendors();
    }
}

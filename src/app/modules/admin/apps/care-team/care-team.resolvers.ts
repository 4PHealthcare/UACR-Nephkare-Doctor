import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CareTeamService } from 'app/modules/admin/apps/care-team/care-team.service';
import { Brand, Category, Pagination, CareTeam, Tag, Vendor } from 'app/modules/admin/apps/care-team/care-team.types';

@Injectable({
    providedIn: 'root'
})
export class BrandsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _careTeamService: CareTeamService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Brand[]>
    {
        return this._careTeamService.getBrands();
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
    constructor(private _careTeamService: CareTeamService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Category[]>
    {
        return this._careTeamService.getCategories();
    }
}

@Injectable({
    providedIn: 'root'
})
export class CareTeamResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _careTeamService: CareTeamService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CareTeam>
    {
        return this._careTeamService.getProductById(route.paramMap.get('id'))
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
export class CareTeamsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _careTeamService: CareTeamService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: Pagination; products: CareTeam[] }>
    {
        return this._careTeamService.getProducts();
    }
}

@Injectable({
    providedIn: 'root'
})
export class TagsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _careTeamService: CareTeamService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Tag[]>
    {
        return this._careTeamService.getTags();
    }
}

@Injectable({
    providedIn: 'root'
})
export class VendorsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _careTeamService: CareTeamService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Vendor[]>
    {
        return this._careTeamService.getVendors();
    }
}

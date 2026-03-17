import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DoctorService } from './doctors.service';
import { Brand, Category, Pagination, Doctor, Tag, Vendor } from './doctors.types';

@Injectable({
    providedIn: 'root'
}) 
export class BrandsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _doctorService: DoctorService)
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
        return this._doctorService.getBrands();
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
    constructor(private _doctorService: DoctorService)
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
        return this._doctorService.getCategories();
    }
}

@Injectable({
    providedIn: 'root'
})
export class DoctorResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _doctorService: DoctorService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Doctor>
    {
        return this._doctorService.getProductById(route.paramMap.get('id'))
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
export class DoctorsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _doctorService: DoctorService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: Pagination; products: Doctor[] }>
    {
        return this._doctorService.getProducts();
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
    constructor(private _doctorService: DoctorService)
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
        return this._doctorService.getTags();
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
    constructor(private _doctorService: DoctorService)
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
        return this._doctorService.getVendors();
    }
}

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ListService } from 'app/modules/admin/dashboards/list/list.service';

@Injectable({
    providedIn: 'root'
})
export class ListResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _listService: ListService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        return this._listService.getData();
    }
}

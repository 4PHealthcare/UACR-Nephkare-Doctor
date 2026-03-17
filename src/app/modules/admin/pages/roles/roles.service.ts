import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { Tag, Role } from './roles.types';

@Injectable({
    providedIn: 'root'
})
export class RolesService
{
    // Private
    private _tags: BehaviorSubject<Tag[] | null> = new BehaviorSubject(null);
    private _role: BehaviorSubject<Role | null> = new BehaviorSubject(null);
    private _roles: BehaviorSubject<Role[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for tags
     */
    get tags$(): Observable<Tag[]>
    {
        return this._tags.asObservable();
    }

    /**
     * Getter for role
     */
    get role$(): Observable<Role>
    {
        return this._role.asObservable();
    }

    /**
     * Getter for roles
     */
    get roles$(): Observable<Role[]>
    {
        return this._roles.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get tags
     */
    getTags(): Observable<Tag[]>
    {
        return this._httpClient.get<Tag[]>('api/apps/tasks/tags').pipe(
            tap((response: any) => {
                this._tags.next(response);
            })
        );
    }

    /**
     * Crate tag
     *
     * @param tag
     */
    createTag(tag: Tag): Observable<Tag>
    {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.post<Tag>('api/apps/tasks/tag', {tag}).pipe(
                map((newTag) => {

                    // Update the tags with the new tag
                    this._tags.next([...tags, newTag]);

                    // Return new tag from observable
                    return newTag;
                })
            ))
        );
    }

    /**
     * Update the tag
     *
     * @param id
     * @param tag
     */
    updateTag(id: string, tag: Tag): Observable<Tag>
    {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.patch<Tag>('api/apps/tasks/tag', {
                id,
                tag
            }).pipe(
                map((updatedTag) => {

                    // Find the index of the updated tag
                    const index = tags.findIndex(item => item.id === id);

                    // Update the tag
                    tags[index] = updatedTag;

                    // Update the tags
                    this._tags.next(tags);

                    // Return the updated tag
                    return updatedTag;
                })
            ))
        );
    }

    /**
     * Delete the tag
     *
     * @param id
     */
    deleteTag(id: string): Observable<boolean>
    {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.delete('api/apps/tasks/tag', {params: {id}}).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted tag
                    const index = tags.findIndex(item => item.id === id);

                    // Delete the tag
                    tags.splice(index, 1);

                    // Update the tags
                    this._tags.next(tags);

                    // Return the deleted status
                    return isDeleted;
                }),
                filter(isDeleted => isDeleted),
                switchMap(isDeleted => this.roles$.pipe(
                    take(1),
                    map((roles) => {

                        // Iterate through the roles
                        roles.forEach((role) => {

                            const tagIndex = role.tags.findIndex(tag => tag === id);

                            // If the role has a tag, remove it
                            if ( tagIndex > -1 )
                            {
                                role.tags.splice(tagIndex, 1);
                            }
                        });

                        // Return the deleted status
                        return isDeleted;
                    })
                ))
            ))
        );
    }

    /**
     * Get roles
     */
    getRoles(): Observable<Role[]>
    {
        return this._httpClient.get<Role[]>('api/apps/tasks/all').pipe(
            tap((response) => {
                this._roles.next(response);
            })
        );
    }

    /**
     * Update roles orders
     *
     * @param roles
     */
    updateRolesOrders(roles: Role[]): Observable<Role[]>
    {
        return this._httpClient.patch<Role[]>('api/apps/tasks/order', {roles});
    }

    /**
     * Search roles with given query
     *
     * @param query
     */
    searchRoles(query: string): Observable<Role[] | null>
    {
        return this._httpClient.get<Role[] | null>('api/apps/tasks/search', {params: {query}});
    }

    /**
     * Get role by id
     */
    getRoleById(id: string): Observable<Role>
    {
        return this._roles.pipe(
            take(1),
            map((roles) => {

                // Find the role
                const role = roles.find(item => item.id === id) || null;

                // Update the role
                this._role.next(role);

                // Return the role
                return role;
            }),
            switchMap((role) => {

                if ( !role )
                {
                    return throwError('Could not found role with id of ' + id + '!');
                }

                return of(role);
            })
        );
    }

    /**
     * Create role
     *
     * @param type
     */
    createRole(type: string): Observable<Role>
    {
        return this.roles$.pipe(
            take(1),
            switchMap(roles => this._httpClient.post<Role>('api/apps/tasks/role', {type}).pipe(
                map((newRole) => {

                    // Update the roles with the new role
                    this._roles.next([newRole, ...roles]);

                    // Return the new role
                    return newRole;
                })
            ))
        );
    }

    /**
     * Update role
     *
     * @param id
     * @param role
     */
    updateRole(id: string, role: Role): Observable<Role>
    {
        return this.roles$
                   .pipe(
                       take(1),
                       switchMap(roles => this._httpClient.patch<Role>('api/apps/tasks/role', {
                           id,
                           role
                       }).pipe(
                           map((updatedRole) => {

                               // Find the index of the updated role
                               const index = roles.findIndex(item => item.id === id);

                               // Update the role
                               roles[index] = updatedRole;

                               // Update the roles
                               this._roles.next(roles);

                               // Return the updated role
                               return updatedRole;
                           }),
                           switchMap(updatedRole => this.role$.pipe(
                               take(1),
                               filter(item => item && item.id === id),
                               tap(() => {

                                   // Update the role if it's selected
                                   this._role.next(updatedRole);

                                   // Return the updated role
                                   return updatedRole;
                               })
                           ))
                       ))
                   );
    }

    /**
     * Delete the role
     *
     * @param id
     */
    deleteRole(id: string): Observable<boolean>
    {
        return this.roles$.pipe(
            take(1),
            switchMap(roles => this._httpClient.delete('api/apps/tasks/role', {params: {id}}).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted role
                    const index = roles.findIndex(item => item.id === id);

                    // Delete the role
                    roles.splice(index, 1);

                    // Update the roles
                    this._roles.next(roles);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }
}

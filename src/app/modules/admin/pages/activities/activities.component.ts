import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as moment from 'moment';
import { Activit, Activity } from 'app/modules/admin/pages/activities/activities.types';
import { ActivitiesService } from 'app/modules/admin/pages/activities/activities.service';
import { APIService } from 'app/core/api/api';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector       : 'activity',
    templateUrl    : './activities.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivitiesComponent implements OnInit
{
    // activities$: Observable<Activity[]>;
    allActivities$: BehaviorSubject<Activit> = new BehaviorSubject(null);
    isSuperAdmin = false;
    userInfo: any;
    constructor(public _activityService: ActivitiesService, private httpService: APIService,private auth: AuthService)
    {
        this.userInfo = JSON.parse(this.auth.user);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        if (this.userInfo.role_id == 1)
        {
            this.isSuperAdmin = true;
        }
        this.GetAllActivities();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Returns whether the given dates are different days
     *
     * @param current
     * @param compare
     */
    isSameDay(current: string, compare: string): boolean
    {
        return moment(current, moment.ISO_8601).isSame(moment(compare, moment.ISO_8601), 'day');
    }

    /**
     * Get the relative format of the given date
     *
     * @param date
     */
    getRelativeFormat(date: string): string
    {
        const today = moment().startOf('day');
        const yesterday = moment().subtract(1, 'day').startOf('day');

        // Is today?
        if ( moment(date, moment.ISO_8601).isSame(today, 'day') )
        {
            return 'Today';
        }

        // Is yesterday?
        if ( moment(date, moment.ISO_8601).isSame(yesterday, 'day') )
        {
            return 'Yesterday';
        }

        return moment(date, moment.ISO_8601).fromNow();
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    GetAllActivities() {
        const url = `api/PatientRegistration/GetAppActivities?userid=`+this.userInfo.user_id;
        this.httpService.getAll(url).subscribe((res: any) => {
            if(res?.isSuccess && res.data) {
                this.allActivities$.next(res.data);
            }
        },(error: any) => {
                console.log('error', error);
            });
    }
}

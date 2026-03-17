import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'subscriptions',
    templateUrl    : './subscriptions.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscriptionsComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}

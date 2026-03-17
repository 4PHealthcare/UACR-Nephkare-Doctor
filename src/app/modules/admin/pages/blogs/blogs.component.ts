import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'blogs',
    templateUrl    : './blogs.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogsComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}

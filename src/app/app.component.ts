import { Component } from '@angular/core';
import {
    Router,
    NavigationEnd,
    
  } from "@angular/router";

  import { filter } from "rxjs/operators";
import { NotificationsService } from './layout/common/notifications/notifications.service';

@Component({
    selector   : 'app-root',
    templateUrl: './app.component.html',
    styleUrls  : ['./app.component.scss']
})
export class AppComponent
{
    /**
     * Constructor
     */
    constructor(
      public router: Router,
      private _notificationsService: NotificationsService
    )
    {
       
    }
    ngOnInit(): void
    {
        
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event) => {
            if(!event['url'].includes('/chat')) {
              if(window['HubSpotConversations']){ 
                window['HubSpotConversations'].widget.remove();
              }
            }
        });

        this._notificationsService.initiateSignalRConnection();
    }
}

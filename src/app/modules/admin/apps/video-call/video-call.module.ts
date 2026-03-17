import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VideoCallRoutingModule } from './video-call-routing.module';
import { VideoCallComponent } from './video-call.component';
import { PublisherComponent } from './publisher/publisher.component';
import { SubscriberComponent } from './subscriber/subscriber.component';
import { OpentokService } from './opentok.service';

@NgModule({
  declarations: [
    VideoCallComponent,
    PublisherComponent,
    SubscriberComponent
  ],
  providers: [OpentokService],
  imports: [
    CommonModule,
    VideoCallRoutingModule
  ]
})
export class VideoCallModule { }

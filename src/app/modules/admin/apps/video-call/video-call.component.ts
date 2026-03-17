import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import * as OT from '@opentok/client';
import { OpentokService } from './opentok.service';

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.scss']
})
export class VideoCallComponent implements OnInit, OnDestroy {

  title = 'Angular Basic Video Chat';
  session: OT.Session;
  streams: Array<OT.Stream> = [];
  data:any;
  changeDetectorRef: ChangeDetectorRef;

  constructor(
    private ref: ChangeDetectorRef, 
    private opentokService: OpentokService
  ) { }

  ngOnInit(): void {
   let obj = this;
   
   if(history.state && history.state.videoSession) {
    this.data = history.state.videoSession;
   }
    
  }
  initSession(sessionId:string, token:string) {
    let obj = this;
    
    this.opentokService.initSession(sessionId, token).then((session: OT.Session) => {
      this.session = session;
    
      this.session.on('connectionCreated', (event) => {
        console.log('yahooo');
        console.log(event);
      });
      this.session.on('streamCreated', (event) => {
        console.log('yahooo');
        obj.streams.push(event.stream);
        obj.ref.detectChanges();
      });
      this.session.on('streamDestroyed', (event) => {
        const idx = this.streams.indexOf(event.stream);
        if (idx > -1) {
          this.streams.splice(idx, 1);
          this.ref.detectChanges();
        }
      });
    })
    .then(() => this.opentokService.connect())
     .catch((err) => {
      console.error(err);
      alert('Unable to connect. Make sure you have updated the config.ts file with your OpenTok details.');
    });
  }

  ngOnDestroy() {
    if(this.session) this.session.disconnect()
  }


}

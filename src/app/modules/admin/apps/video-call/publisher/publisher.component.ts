import { Component, ElementRef, AfterViewInit, ViewChild, Input } from '@angular/core';
import { OpentokService } from '../opentok.service';

const publish = () => {

};

@Component({
  selector: 'app-publisher',
  templateUrl: './publisher.component.html',
  styleUrls: ['./publisher.component.css']
})

export class PublisherComponent implements AfterViewInit {
  @ViewChild('publisherDiv') publisherDiv: ElementRef;
  @Input() session: OT.Session;
  publisher: OT.Publisher;
  publishing: Boolean;

  constructor(private opentokService: OpentokService) {
    this.publishing = false;
  }

  ngAfterViewInit() {
    
    let publisherOptions:any = {
      insertMode: 'append',
      width: '100%',
      height: '100%',    
      name:'ADMIN',
      publishAudio: true,
      publishVideo: true,
      showControls:true
    };


    const OT = this.opentokService.getOT();
    
    this.publisher = OT.initPublisher(this.publisherDiv.nativeElement, publisherOptions);
    console.log(this.publisher);
    if (this.session) {
      if (this.session['isConnected']()) {
       this.publish();
      }
      this.session.on('sessionConnected', () => this.publish());
    }
  }

  publish() {
    this.session.publish(this.publisher, (err) => {
      if (err) {
        alert(err.message);
      } else {
        console.log('published');
        this.publishing = true;
      }
    });
  }

  ngOnDestroy() {
   // this.session.unpublish(this.publisher);

  }

  

}

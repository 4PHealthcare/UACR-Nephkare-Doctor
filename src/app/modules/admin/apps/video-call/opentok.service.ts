import { Injectable } from '@angular/core';

import * as OT from '@opentok/client';

@Injectable()
export class OpentokService {

  session: OT.Session;
  token: string;
  API_KEY:string= '47495811';
  constructor() { 
    
  }

  getOT() {
    return OT;
  }

  initSession(sessionId:string, token:string) {
    if (this.API_KEY && token && sessionId) {
      this.session = this.getOT().initSession(this.API_KEY, sessionId);
      this.token = token;
      return Promise.resolve(this.session);
    }
    
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.session.connect(this.token, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(this.session);
        }
      });
    });
  }
}

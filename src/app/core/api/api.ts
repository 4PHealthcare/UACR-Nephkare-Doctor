import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Api is a generic REST Api handler. Set your API url first.
 */
@Injectable({
  providedIn: 'root'
})
export class APIService {

  baseUrl = environment.apiURL;
  constructor(private http: HttpClient) {

 }

  getAll(endpoint:string): Observable<any> {
    return this.http.get(`${this.baseUrl}${endpoint}`) as Observable<any>;
  }

  get(endpoint:string, id: any): Observable<any> {
    return this.http.get(`${this.baseUrl}${endpoint}${id}`) as Observable<any>;
  }

  create(endpoint:string, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}${endpoint}`, data);
  }

  update(endpoint:string, id: any, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}${endpoint}/${id}`, data);
  }

  delete(endpoint:string, id: any): Observable<any> {
    return this.http.delete(`${this.baseUrl}${endpoint}/${id}`);
  }

  deleteAll(endpoint:string,): Observable<any> {
    return this.http.delete(`${this.baseUrl}${endpoint}`);
  }



}
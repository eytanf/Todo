import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  uri = 'http://localhost:4100';

  constructor(private http: HttpClient , private cookieService: CookieService) { }


  

}

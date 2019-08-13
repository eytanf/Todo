import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from './user';
import { Observable } from 'rxjs';
import { catchError, flatMap } from 'rxjs/operators'
import { CookieService } from 'ngx-cookie-service';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {


  uri = 'http://localhost:4100';

  constructor(private http: HttpClient , private cookieService: CookieService , private router:Router , private zone: NgZone) { }

  //General Api for all requests
 generalApi(endUrl , element , hasHeader , requestType , byId){
   //check if the request is post
   if(requestType === 'post'){
    return this.httpPostRequest(`${this.uri}/${endUrl}`,element , hasHeader , byId).pipe(catchError((err) => {
      //Auth error log the user out and send back to signin page
      if(err.status === 401){
        this.router.navigate(['/signin']);
      }
      return err;
    }))
   }
   //check if the request is get
   else if(requestType === 'get'){
    return this.httpGetRequest(`${this.uri}/${endUrl}` ,element , hasHeader , byId).pipe(catchError((err) => {
      return err;
    }))
   }
   return null;
  }

  //Get requests from the server
  httpGetRequest(url , element ,hasHeader , byId){
    //Check if need to put cookie in the header
    if(hasHeader === true){
      //Check if need to add the id for the target
      if(byId === null){
        return this.http.get(url , {
          headers: {
            'auth-token': this.cookieService.get('token')
            }
          })
      }
      //Add the id to the end of the url
      else{
        return this.http.get(url+`/${byId}` , {
          headers: {
            'auth-token': this.cookieService.get('token')
            }
          })
      }
    }
    //request without putting cookie in the header
    else{
      return this.http.get(url)
    }
  }

  //Post requests from the server
  httpPostRequest(url , element , hasHeader ,byId){
    //Check if need to put cookie in the header
    if(hasHeader === true){
      //Check if need to add the id for the target
      if(byId === null){
        return this.http.post(url , element , {
          headers: {
            'auth-token': this.cookieService.get('token')
            }
          })
      }
      //Add the id to the end of the url
      else{
        return this.http.post(url+`/${byId}` , element , {
          headers: {
            'auth-token': this.cookieService.get('token')
            }
          })
      }
    }
    //Add the id to the end of the url
    else{
      return this.http.post(url , element)
    }
  }

  //Error handler
  errorHandler(err){
    return throwError(401);
  }
}

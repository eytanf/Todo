import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from './user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  uri = 'http://localhost:4100';

  constructor(private http: HttpClient) { }

  //Create a new user and save it in our database by sending to the server
  addUser(email , password){
    const userToAdd = {
      email: email,
      password: password
    }
    return this.http.post(`${this.uri}/signup`,userToAdd);
  }

  //Get response from the server if the email and password are valid
  login(email , password):Observable<User>{
    var ans = false;
    const userToValid = {
      email: email,
      password: password
    }
    return this.http.post<User>(`${this.uri}/signin`,userToValid);
  }

  //Register token in database collection for given id
  registerToken(token , _id){
    const tokenToStore = {
      token: token,
      userId: _id
    }
    
    this.http.post(`${this.uri}/token`,tokenToStore).subscribe((res:any) => {
      console.log(true)
    });
  }
}

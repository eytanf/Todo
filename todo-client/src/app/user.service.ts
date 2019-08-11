import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from './user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  currentUser = '';

  uri = 'http://localhost:4100';

  constructor(private http: HttpClient) { }

  //Create a new user and save it in our database by sending to the server
  addUser(email , password , color){
    const userToAdd = {
      email: email,
      password: password,
      color: color
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
    this.currentUser = email;
    return this.http.post<User>(`${this.uri}/signin`,userToValid);
  }

  //Register token in database collection for given id
  registerToken(token , _id){
    const tokenToStore = {
      token: token,
      userId: _id
    }
    this.http.post(`${this.uri}/token`,tokenToStore).subscribe((res:any) => {
    });
  }

  //Get the user data by token
  getUserByToken(token){
    const tokenToSend = {
      token: token
    }
    return this.http.post(`${this.uri}/userByToken`, tokenToSend);
  }

  //Save the color choice from the user
  updateColor(color , token){
    this.getUserByToken(token).subscribe((res : any) => {
      const userColor = {
        userId: res[0]._id,
        color: color
      };
      this.http.post(`${this.uri}/color`, userColor).subscribe((res:any) => {});
    })
  }
  //Save the font choice from the user
  updateFont(font , token){
    this.getUserByToken(token).subscribe((res : any) => {
      const userFont = {
        userId: res[0]._id,
        font: font
      };
      this.http.post(`${this.uri}/font`, userFont).subscribe((res:any) => {});
    })
  }
}

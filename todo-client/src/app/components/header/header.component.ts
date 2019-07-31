import { Component, OnInit, Output } from '@angular/core';
import { UserService } from '../../user.service';
import { Router } from '@angular/router';
import { TodoListComponent } from '../todo-list/todo-list.component';
import { CookieService } from 'ngx-cookie-service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  
  logInput: string = "";
  regInput: string = "";
  regPassword: string ="";
  checkPass: string ="";
  logPassword: string="";
  isClicked: boolean = false;
  isUserValid: boolean = false;
  isUserExist: boolean = false;

  constructor(private userService: UserService , private router:Router , private todo: TodoListComponent , private cookieService: CookieService) {}
   
  
  @Output() userName: string = '';

  ngOnInit() {
      if(this.cookieService.get("token")){
      this.router.navigate(['/main']);
    }
  }
  //Send login request to the server and store the token in our locastorage
  //set loggedIn as true and save userName to display
  login(email , password){
    this.isClicked = true;
    this.isUserValid = true; 
    this.userService.login(email , password).subscribe((res: any) => {
      this.userService.registerToken(res.token , res._id);
      this.cookieService.set("token",res.token);
      this.userName = res.email;
      document.getElementById('signInModal').style.display='none';
      this.ngOnInit();
      
    },error => this.isUserValid = false);
    
  }
  //Called when focused on inputs to reset errors
  isClickedFunc(){
    this.isClicked = false;
  }

  //Check if the user is valid and if button is clicked
  isUserValidFunc(password){
    if(password < 1 && this.isClicked){
      return false;
    }
    if(this.isClicked){
      return this.isUserValid;
    }
    else{
      return true;
    }
  }

  //Check if boths passwords are the same
  isPassMatch(password , checkPassword){
    if(this.isClicked){
      if(password === checkPassword){
        return true;
      }
      else{
        return false;
      }
    }
    return true;
  }

  //Check if the password is not null and if button is clicked
  isPassValid(password){
    if(password.length < 1 && this.isClicked){
      return false;
    }
    return true;
  }
  //Check if the user already exist
  isUserExistFunc(){
    return this.isUserExist;
  }

  resetIsExists(){
    this.isUserExist = false;
  }
  
  //Send a register request to the server after validating the password match the check password
  register(email , password , checkPassword){
    this.isClicked = true;
    if(password.length > 0 && password === checkPassword && this.validateEmail(email)){
      this.userService.addUser(email , password).subscribe(() => {
        this.login(email , password);
        document.getElementById('signUpModal').style.display='none';
      },(error) => {
        if(error.status == 409){
          this.isUserExist = true;
        }
        this.isClicked = false;
      });
    }
  }
  //Check if email is valid
  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase()) || email.length == 0;
}

//Clean all text input when closing login or register form
clean(){
  this.logInput = "";
  this.regInput = "";
  this.checkPass = "";
  this.regPassword = "";
  this.logPassword = "";
  this.isClicked = false;
  this.isUserValid = false;
}
}

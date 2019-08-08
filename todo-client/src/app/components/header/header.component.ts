import { Component, OnInit, Output, Inject } from '@angular/core';
import { UserService } from '../../user.service';
import { Router } from '@angular/router';
import { TodoListComponent } from '../todo-list/todo-list.component';
import { FormControl, FormGroupDirective, NgForm, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import {ErrorStateMatcher} from '@angular/material/core';
import { MatDialog} from '@angular/material';


export class MyErrorStateMatcher implements ErrorStateMatcher  {
  realIsSubmitted = false;
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted && this.realIsSubmitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  registerForm: FormGroup;
  loginForm: FormGroup;
  logInput: string = "";
  regInput: string = "";
  regPassword: string ="";
  checkPass: string ="";
  logPassword: string="";
  isClicked: boolean = false;
  isUserValid: boolean = false;
  isUserExist: boolean = false;
  matcher = new MyErrorStateMatcher();

  constructor(private userService: UserService 
    , private router:Router 
    , private todo: TodoListComponent 
    , private cookieService: CookieService 
    , private fb: FormBuilder
    , private dialog: MatDialog) {}
   
  
  @Output() userName: string = '';

  ngOnInit() {
      if(this.cookieService.get("token")){
      this.router.navigate(['/main']);
    }
    this.registerForm = this.fb.group({
      regInput: [null, Validators.required],
      regPassword: [null, Validators.required],
      checkPass: [null, Validators.required]
    })
    this.loginForm = this.fb.group({
      logInput: [null , Validators.required],
      logPassword: [null , Validators.required]
    })
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
    this.matcher.realIsSubmitted = true;
    
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
    if(password.length > 0 && password === checkPassword && this.validateEmailReg()){
      this.userService.addUser(email , password).subscribe(() => {
        this.login(email , password);
        document.getElementById('signUpModal').style.display='none';
      },(error) => {
        if(error.status == 409){
          this.isUserExist = true;
          
        }
        this.matcher.realIsSubmitted = true;
        this.isClicked = false;
      });
    }
    this.matcher.realIsSubmitted = true;
  }

  //Check if email is valid
  validateEmailReg() {
    if(this.registerForm.get('regInput').value){
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(this.registerForm.get('regInput').value).toLowerCase()) && this.registerForm.get('regInput').value.length != 0;
    }
    return true;
  } 

  validateEmailLog() {
    if(this.loginForm.get('logInput').value){
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(this.loginForm.get('logInput').value).toLowerCase()) && this.loginForm.get('logInput').value.length != 0;
    }
    return true;
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
  this.isUserExist = false;
  this.registerForm.reset();
  this.loginForm.reset();
  this.matcher.realIsSubmitted = false;
}


}


import { Component, OnInit , Input} from '@angular/core';
import { TaskService } from '../../task.service';
import { Task } from '../../task.model'
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {FormControl, Validators} from '@angular/forms';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';


@Component({
  selector: '[app-todo-list]',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css']
})
export class TodoListComponent implements OnInit {
  getYouTubeID = require('get-youtube-id');
  todos: Task[]; //Task's to do
  donedos: Task[];//Task's that are done
  value: string = '';//Input field string
  youtubeUrl: string ='';
  todoDisplayedColumns: string[] = ['select', 'task' ,'done' , 'delete' , 'update' , 'youtube'];
  todoDataSource;
  todoSelection = new SelectionModel<Task>(true, []);
  donedoDisplayedColumns: string[] = ['select', 'task' ,'done' , 'delete' , 'youtube'];
  donedoDataSource;
  donedoSelection = new SelectionModel<Task>(true, []);
  emptyTask: boolean = false;
  showUrl: boolean = false;
  urlInput = '';
  playerVars = {
    cc_lang_pref: 'en'
  };
  youtubeId = '';
  player: YT.Player;

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);
  constructor(private taskService: TaskService , private router:Router, private cookieService: CookieService ){}
  //Invoked when the website is launched
  //Initialize our fields and bring tasks from database
  //Insert in todos the tasks to do
  //Insert in donedoes the tasks which are done
  ngOnInit() {
    if(this.cookieService.get("token")){
      this.todos = [];
      this.donedos = []; 
      this.updateDonedosFromDataBase();
      this.updateTodoFromDataBase();
      this.changeToNormal();
    }
    else{
      this.router.navigate(['/signin']);
    }
  }

  // Youtube url checker
  isValidUrl(url) {
    var re = /^(http(s)?:\/\/)?((w){3}\.)?youtu(be|.be)?(\.com)?\/.+/;
      return re.test(String(url).toLowerCase()) || url.length == 0 ;
  }

  //Bring from the database the Tasks to do to todos
  updateTodoFromDataBase(){
    this.taskService.getTasksToDo().subscribe((tasks : Task[]) => {
      this.todos = tasks;
      this.todoDataSource = new MatTableDataSource<Task>(this.todos);
    })
  }

  //Bring from the database the Tasks that are done to donedos
  updateDonedosFromDataBase(){
    this.taskService.getDoneTasks().subscribe((task: Task[]) => {
      this.donedos = task;
      this.donedoDataSource = new MatTableDataSource<Task>(this.donedos);
    });
  }
  
  resetEmptyTask(){
    this.emptyTask = false;
  }

  //Add a new task to our database with default false in complete and toRemove fields
  //Check the task is valid (not null)
  add(task: string , url: string){
    if(!task){
      this.emptyTask = true;
      return null;
    }
    if(!this.isValidUrl(url)){
      return null
    }
    this.urlInput = '';
    this.value = '';
    //Add a new task to the database calling api functions
    this.taskService.addTask(task , false , url).subscribe((_id:string) => {
      const taskToPush = new Task(_id , task , false , url);
      this.todos.push(taskToPush);
      this.todoDataSource.data = this.todos;
    });
  }

  //Remove the task given an id and update todo and donedos
  remove(task){
    this.taskService.deleteTask(task._id).subscribe(() => {
      if(task.complete == true){
        this.donedos = this.donedos.filter(taskToDelete => taskToDelete!= task);
        this.donedoDataSource.data = this.donedos;
      }else{
        this.todos = this.todos.filter(taskToDelete => taskToDelete!= task);
        this.todoDataSource.data = this.todos;
      }
    })
  }

  //Find task in todo and remove it
  removeFromTodo(task){
    //Find the task in our todos
    for(let taskToChange of this.todos){
      if(task._id == taskToChange._id){
        this.remove(task);
      }
    }
  }
  
  //Update the complete field to true then Update the database
  moveToDone(task){
    //Find the task in our todos
    for(let taskToChange of this.todos){
      if(task._id == taskToChange._id){
        this.taskService.updateTask(task._id , task.task, true).subscribe(() => {
          //Update todos and donedos
          this.todos = this.todos.filter(taskToDelete => taskToDelete!= task);
          taskToChange.complete = true;
          this.donedos.push(taskToChange);
          this.todoDataSource.data = this.todos;
          this.donedoDataSource.data = this.donedos;
        })
      }
    }
  }

  //Find task in donedos and remove it
  removeFromDone(task){
    //Find the task in our donedos
    for(let taskToChange of this.donedos){
      if(task._id == taskToChange._id){
        this.remove(task);
      }
    }
  }

  //Update the complete field to false then Update the database
  moveToUndone(task){
    //Find the task in our donedos
    for(let taskToChange of this.donedos){
      if(task._id == taskToChange._id){
        this.taskService.updateTask(task._id , task.task, false).subscribe(() => {
          //Update todos and donedos
          this.donedos = this.donedos.filter(taskToDelete => taskToDelete!= task);
          taskToChange.complete = false;
          this.todos.push(taskToChange);
          this.todoDataSource.data = this.todos;
          this.donedoDataSource.data = this.donedos;
        })
      }
    }
  }

  //Update a task that is not done yet in our database
  updateField(task){
    //Find the task in our todos
    for(let taskToChange of this.todos){
      if(task._id == taskToChange._id){
        this.taskService.updateTask(task._id , task.task, task.complete).subscribe(() => {
          //Update todos and donedos
          taskToChange._id = task._id;
          taskToChange.task = task.task;
          taskToChange.complete = task.complete;
          this.todoDataSource.data = this.todos;
        })
      }
    }
  }
  //Clear on logout and delete cookies
  logout(){
    this.todos = [];
    this.donedos = [];
    this.cookieService.delete("token");
    this.ngOnInit();
    }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelectedTodo() {
    const numSelected = this.todoSelection.selected.length;
    const numRows = this.todos.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggleTodo() {
    this.isAllSelectedTodo() ?
        this.todoSelection.clear() :
        this.todoDataSource.data.forEach(row => this.todoSelection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabelTodo(row?: Task): string {
    if (!row) {
      return `${this.isAllSelectedTodo() ? 'select' : 'deselect'} all`;
    }
    return `${this.todoSelection.isSelected(row) ? 'deselect' : 'select'} row ${row.task + 1}`;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelectedDonedo() {
    const numSelected = this.donedoSelection.selected.length;
    const numRows = this.donedos.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggleDonedo() {
    this.isAllSelectedDonedo() ?
        this.donedoSelection.clear() :
        this.donedoDataSource.data.forEach(row => this.donedoSelection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabelDonedo(row?: Task): string {
    if (!row) {
      return `${this.isAllSelectedDonedo() ? 'select' : 'deselect'} all`;
    }
    return `${this.todoSelection.isSelected(row) ? 'deselect' : 'select'} row ${row.task + 1}`;
  }
  //Move selected by box to donedo
  moveToDoneSelectedTodo(){
    this.todoDataSource.data.forEach((row) => {
      if(this.todoSelection.isSelected(row)){
        this.moveToDone(row);
      }
    })
    this.todoSelection.clear();
  }

  //Delete selected by box in table from todo
  deleteSelectedTodo(){
    this.todoDataSource.data.forEach((row) => {
      if(this.todoSelection.isSelected(row)){
        this.removeFromTodo(row);
      }
    });
    this.todoSelection.clear();
  }

   //Move selected by box to todo
   moveToToDoSelectedTodo(){
    this.donedoDataSource.data.forEach((row) => {
      if(this.donedoSelection.isSelected(row)){
        this.moveToUndone(row);
      }
    })
    this.donedoSelection.clear();
  }
  //Delete selected by box in table from donedo 
  deleteSelectedDonedo(){
    this.donedoDataSource.data.forEach((row) => {
      if(this.donedoSelection.isSelected(row)){
        this.removeFromDone(row);
      }
    });
    this.donedoSelection.clear();
  }

  //Prepare the url pop up and set the video to show
  setUrlToTrue(task){
    this.showUrl = true;
    this.youtubeId = this.getYouTubeID(task.url);
    if(this.player){
      this.player.loadVideoById(this.youtubeId);
      this.player.stopVideo();
    }
  }

  //Check if the task has an url to set button
  hasUrl(task){
    if(task.url.length == 0){
      return false;
    }
    else{
      return true;
    }
  }
  //Reset url
  resetUrl(){
    this.youtubeId = '';
    this.player.stopVideo();
  }

  savePlayer(player) {
    this.player = player;
  }

  changeToGreen(){
    document.getElementsByName('changeColor').forEach((obj) => {
      obj.style.color = 'lightgreen';
      obj.style.fontFamily = 'Serif'
    }) 
    document.getElementsByName('changeBackgroundColor').forEach((obj) => {
      obj.style.backgroundColor = 'lightgreen';
      obj.style.fontFamily = 'Serif'
    })
  }

  changeToYellow(){
    document.getElementsByName('changeColor').forEach((obj) => {
      obj.style.color = 'yellow';
      obj.style.fontFamily = 'Georgia'
    }) 
    document.getElementsByName('changeBackgroundColor').forEach((obj) => {
      obj.style.backgroundColor = 'yellow';
      obj.style.fontFamily = 'Georgia'
    })
  }

  changeToRed(){
    document.getElementsByName('changeColor').forEach((obj) => {
      obj.style.color = 'red';
      obj.style.fontFamily = 'cursive'
    }) 
    document.getElementsByName('changeBackgroundColor').forEach((obj) => {
      obj.style.backgroundColor = 'red';
      obj.style.fontFamily = 'cursive'
    })
  }

  changeToNormal(){
    document.getElementsByName('changeColor').forEach((obj) => {
      obj.style.color = '#3F51B5';
      obj.style.fontFamily = 'Sans-serif'
    }) 
    document.getElementsByName('changeBackgroundColor').forEach((obj) => {
      obj.style.backgroundColor = '#3F51B5';
      obj.style.fontFamily = 'Sans-serif'
    })
  }

  
  
  


  
  
}

import { Component, OnInit , Input, ViewChild} from '@angular/core';
import { TaskService } from '../../task.service';
import { Task } from '../../task.model'
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {FormControl, Validators} from '@angular/forms';
import { UserService } from 'src/app/user.service';
import {MatSort} from '@angular/material/sort';
import { MatPaginator } from '@angular/material';
import { Observable } from 'rxjs';
import { throwError } from 'rxjs';
import { flatMap } from 'rxjs/operators';


@Component({
  selector: '[app-todo-list]',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css']
})
export class TodoListComponent implements OnInit {
  //Sorting vars for the tables
  @ViewChild(MatPaginator, {static: true}) paginatorUndone: MatPaginator;
  @ViewChild('sortUndone', {static: true}) sortUndone: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginatorDone: MatPaginator;
  @ViewChild('sortDone', {static: true}) sortDone: MatSort;
  todoSortDate: boolean = false; //boolean to sort by date
  donedoSortDate: boolean = false; //boolean to sort by date
  todoSortUpdate: boolean = false; //boolean to sort by updated
  doneSortUpdate: boolean = false; //boolean to sort by updated
  //Youtube vars
  getYouTubeID = require('get-youtube-id');
  showUrl: boolean = false; // true when modal pop out
  youtubeId = '';
  player: YT.Player;
  //Youtube boolean filter
  showAll: boolean = true;
  showAllDone: boolean = true;
  //Style vars
  color = '#3F51B5'
  fontFamily = 'Sans-serif'
  //Tasks data
  todos: Task[]; //Task's to do
  donedos: Task[];//Task's that are done
  todoDisplayedColumns: string[] = ['select', 'task' ,'done' , 'delete' , 'update' , 'youtube'];
  todoDataSource;
  todoSelection = new SelectionModel<Task>(true, []);
  donedoDisplayedColumns: string[] = ['select', 'task' ,'done' , 'delete' , 'youtube'];
  donedoDataSource;
  donedoSelection = new SelectionModel<Task>(true, []);
  //Task and Url input and validators
  value: string = '';//Input field string
  urlInput = '';
  emptyTask: boolean = false; // raise error if false and try to insert a task
  
  constructor(private taskService: TaskService , private router:Router, private cookieService: CookieService  , private userService: UserService ){}
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
      const tokenToSend = {
        token: this.cookieService.get("token")
      }
      this.userService.generalApi('userByToken',tokenToSend , true , 'post' , null).subscribe(
        (res) =>{
        this.changeColorAndFont(res[0].color , res[0].font)
      })
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
    this.userService.generalApi('tasks' , null , true , 'get' , null).subscribe(
      (tasks : Task[]) => {
      this.todos = tasks;
      this.todoDataSource = new MatTableDataSource<Task>(this.todos);
      this.todoDataSource.sort = this.sortUndone;
      this.todoDataSource.paginator = this.paginatorUndone;     
    })
  }

  //Bring from the database the Tasks that are done to donedos
  updateDonedosFromDataBase(){
    this.userService.generalApi('tasksDone' , null , true , 'get' , null).subscribe(
      (task: Task[]) => {
      this.donedos = task;
      this.donedoDataSource = new MatTableDataSource<Task>(this.donedos);
      this.donedoDataSource.sort = this.sortDone;
      this.donedoDataSource.paginator = this.paginatorDone;
    });
  }
  //Reset the empty task error
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
    var time = new Date();
    const taskToAdd = {
      task: task,
      complete: false,
      url: url,
      createdTime: time,
      updatedTime: time
    }
    //Add a new task to the database calling api functions
    this.userService.generalApi('tasks/add' , taskToAdd , true , 'post' , null).subscribe(
      (_id:string) => {
      const taskToPush = new Task(_id , task , false , url , time , time);
      this.todos.push(taskToPush);
      this.todoDataSource.data = this.todos;
    });
    
  }

  //Remove the task given an id and update todo and donedos
  remove(task){
    this.userService.generalApi('tasks/delete' , null , true , 'post' , task._id).subscribe(() => {
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
    var time = new Date();
    //Find the task in our todos
    for(let taskToChange of this.todos){
      if(task._id == taskToChange._id){
        const taskToUpdate = {
          _id: task._id,
          task: task.task,
          complete: true,
          updatedTime: time
        }
        this.userService.generalApi('tasks/update' , taskToUpdate, true , 'post' , task.id).subscribe(() => {
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
    var time = new Date();
    //Find the task in our donedos
    for(let taskToChange of this.donedos){
      if(task._id == taskToChange._id){
        const taskToUpdate = {
          _id: task._id,
          task: task.task,
          complete: false,
          updatedTime: time
        }
        this.userService.generalApi('tasks/update' , taskToUpdate, true , 'post' , task._id).subscribe(() => {
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
    var time = new Date();
    //Find the task in our todos
    for(let taskToChange of this.todos){
      if(task._id == taskToChange._id){
        const taskToUpdate = {
          _id: task._id,
          task: task.task,
          complete: task.complete,
          updatedTime: time
        }
        this.userService.generalApi('tasks/update' , taskToUpdate, true , 'post' , task._id).subscribe(() => {
          //Update todos and donedos
          taskToChange._id = task._id;
          taskToChange.task = task.task;
          taskToChange.complete = task.complete;
          taskToChange.updatedTime = time;
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
    this.router.navigate(['/signin'])
    }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelectedTodo() {
    const numSelected = this.todoSelection.selected.length;
    var numRows;
    if(this.todoDataSource != null){
      numRows = this.todoDataSource.data.length;
    }
    else{
      numRows = this.todos.length;
    }
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
    var numRows;
    if(this.donedoDataSource != null){
      numRows = this.donedoDataSource.data.length;
    }else{
      numRows = this.donedos.length;
    }
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
  //Save youtube player
  savePlayer(player) {
    this.player = player;
  }
  //Change the color and font and save in database
  changeColorAndFont(color , font){
    this.color = color;
    this.fontFamily = font;
    const tokenToSend = {
      token: this.cookieService.get('token')
    }
    this.userService.generalApi('userByToken' , tokenToSend , true , 'post' , null).pipe(
      flatMap((res) => {
        const userColor = {
          userId: res[0]._id,
          color: color
        };
        return this.userService.generalApi('color' , userColor , true , 'post' , null)
      })
    ).subscribe(
      (res) =>{}
    )

    //Font api
    this.userService.generalApi('userByToken' , tokenToSend , true , 'post' , null).pipe(
      flatMap((res) => {
        const userFont = {
          userId: res[0]._id,
          font: font
        };
        return this.userService.generalApi('font' , userFont , true , 'post' , null)
      })
    ).subscribe(
      (res) =>{}
    )
  }
 //Hide/Show tasks without youtube url
  filterTasks(){
    if(this.showAll){
      this.showAll = false;
      this.todoDataSource.data = this.todoDataSource.data.filter(task => task.url != '')
    }
    else{
      this.showAll = true;
      this.todoDataSource.data =  this.todos;
    }
  }
  //Hide/Show done tasks without youtube url
  filterDoneTasks(){
    if(this.showAllDone){
      this.showAllDone = false;
      this.donedoDataSource.data = this.donedoDataSource.data.filter(task => task.url != '')
    }
    else{
      this.showAllDone = true;
      this.donedoDataSource.data =  this.donedos;
    }
  }
  //Sort todo tasks by created time
  sortDateTodo() {
    let temp = this.todos;
    this.clearSortTodo();
    //Sort new to old
    if(this.todoSortDate){
      this.todoSortDate = !this.todoSortDate;
      this.todoDataSource.data = temp.sort((a, b) => {
        return new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime();
      });
    }else{
      //Sort old to new
      this.todoSortDate = !this.todoSortDate;
      this.todoDataSource.data = temp.sort((a, b) => {
        return new Date(a.createdTime).getTime() - new Date(b.createdTime).getTime();
      });
    }
  }
//Sort done tasks by created time
  sortDateDonedo(){
    let temp = this.donedos;
    this.clearSortDone();
    //Sort new to old
    if(this.donedoSortDate){
      this.donedoSortDate = !this.donedoSortDate;
      this.donedoDataSource.data = temp.sort((a , b) => {
        return new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime();
      });
    }else{
      //Sort old to new
      this.donedoSortDate = !this.donedoSortDate;
      this.donedoDataSource.data = temp.sort((a , b) => {
        return new Date(a.createdTime).getTime() - new Date(b.createdTime).getTime();
      });
    }
  }

  //Reset the sorting from todo table
  clearSortTodo() {
    this.sortUndone.sort({id: '', start: 'asc', disableClear: false});
  }

  //Reset the sorting from done table
  clearSortDone() {
    this.sortDone.sort({id: '', start: 'asc', disableClear: false});
  }

  //Sort todo tasks by updated time
  sortUpdateTodo() {
    let temp = this.todos;
    this.clearSortTodo();
    //Sort new to old
    if(this.todoSortUpdate){
      this.todoSortUpdate = !this.todoSortUpdate;
      this.todoDataSource.data = temp.sort((a, b) => {
        return new Date(b.updatedTime).getTime() - new Date(a.updatedTime).getTime();
      });
    }else{
      //Sort old to new
      this.todoSortUpdate = !this.todoSortUpdate;
      this.todoDataSource.data = temp.sort((a, b) => {
        return new Date(a.updatedTime).getTime() - new Date(b.updatedTime).getTime();
      });
    }
  }

  //Sort done tasks by updated time
  sortUpdateDonedo(){
    let temp = this.donedos;
    this.clearSortDone();
    //Sort new to old
    if(this.doneSortUpdate){
      this.doneSortUpdate = !this.doneSortUpdate;
      this.donedoDataSource.data = temp.sort((a , b) => {
        return new Date(b.updatedTime).getTime() - new Date(a.updatedTime).getTime();
      });
    }else{
      //Sort old to new
      this.doneSortUpdate = !this.doneSortUpdate;
      this.donedoDataSource.data = temp.sort((a , b) => {
        return new Date(a.updatedTime).getTime() - new Date(b.updatedTime).getTime();
      });
    }
  }

  
  


  
  
}

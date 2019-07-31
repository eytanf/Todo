import { Component, OnInit , Input} from '@angular/core';
import { TaskService } from '../../task.service';
import { Task } from '../../task.model'
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { TmplAstElement } from '@angular/compiler';

@Component({
  selector: '[app-todo-list]',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css']
})
export class TodoListComponent implements OnInit {
  @Input() userName: string;
  todos: Task[]; //Task's to do
  donedos: Task[];//Task's that are done
  value: string = '';//Input field string
  currentUser: string = '';
  constructor(private taskService: TaskService , private router:Router, private cookieService: CookieService)  { }

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
    }
    else{
      this.router.navigate(['/signin']);
    }
  }

  //Bring from the database the Tasks to do to todos
  updateTodoFromDataBase(){
    this.taskService.getTasksToDo().subscribe((tasks : Task[]) => {
      this.todos = tasks;
    })
  }

  //Bring from the database the Tasks that are done to donedos
  updateDonedosFromDataBase(){
    this.taskService.getDoneTasks().subscribe((task: Task[]) => {
      this.donedos = task;
    });
  }

  //Add a new task to our database with default false in complete and toRemove fields
  //Check the task is valid (not null)
  add(task: string){
    this.value = '';
    if(!task){
      return null;
    }
    //Add a new task to the database calling api functions
    this.taskService.addTask(task , false).subscribe((_id:number) => {
      const taskToPush = new Task(_id , task , false);
      this.todos.push(taskToPush);
    });
  }

  //Remove the task given an id and update todo and donedos
  remove(task){
    console.log(task.complete)
    this.taskService.deleteTask(task._id).subscribe(() => {
      if(task.complete == true){
        this.donedos = this.donedos.filter(taskToDelete => taskToDelete!= task);
      }else{
        this.todos = this.todos.filter(taskToDelete => taskToDelete!= task);
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
        this.taskService.updateTask(task.id , task.task, false).subscribe(() => {
          //Update todos and donedos
          this.donedos = this.donedos.filter(taskToDelete => taskToDelete!= task);
          taskToChange.complete = false;
          this.todos.push(taskToChange);
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
        })
      }
    }
  }

  logout(){
    this.todos = [];
    this.donedos = [];
    this.cookieService.delete("token");
    this.ngOnInit();
    }


}

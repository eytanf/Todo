import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  uri = 'http://localhost:4100';

  constructor(private http: HttpClient , private cookieService: CookieService) { }

  //Return the tasks to do from the server
  getTasksToDo(){
    return this.http.get(`${this.uri}/tasks`, {
      headers: {
        'auth-token': this.cookieService.get('token')
      }
    });
  }

  //Return the done tasks from the server
  getDoneTasks(){
    return this.http.get(`${this.uri}/tasksDone`, {
      headers: {
        'auth-token': this.cookieService.get('token')
      }
    });
  }

  //Return a task by its id
  getTaskById(id){
    return this.http.get(`${this.uri}/tasks/${id}`);
  }

  //Add a new task to our database and returns it
  addTask(task , complete , youtubeUrl , time){
    const taskToAdd = {
      task: task,
      complete: complete,
      url: youtubeUrl,
      createdTime: time,
      updatedTime: time
    }
    return this.http.post(`${this.uri}/tasks/add`,taskToAdd , {
      headers: {
        'auth-token': this.cookieService.get('token')
      }
    });
  }

  //Update a Task from the server if its exists
  updateTask(_id , task , complete , time){
    const taskToUpdate = {
      _id: _id,
      task: task,
      complete: complete,
      updatedTime: time
    }
    return this.http.post(`${this.uri}/tasks/update/${_id}`,taskToUpdate, {
      headers: {
        'auth-token': this.cookieService.get('token')
      }
    });
  }

  //Delete a task by id in our database
  deleteTask(id){
    return this.http.get(`${this.uri}/tasks/delete/${id}`, {
      headers: {
        'auth-token': this.cookieService.get('token')
      }
    });
  }

}

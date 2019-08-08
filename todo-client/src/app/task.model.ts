export class Task{
  _id: string;
  task: string;
  complete: boolean;
  url: string;
  
  
  constructor(_id:string, task: string , complete: boolean , url: string ){
    this._id = _id;
    this.task = task;
    this.complete = complete;
    this.url = url;
  }
  
}
export class Task{
  _id: string;
  task: string;
  complete: boolean;
  url: string;
  createdTime: Date;
  updatedTime: Date;
  
  
  constructor(_id:string, task: string , complete: boolean , url: string ,createdTime: Date ,updatedTime: Date){
    this._id = _id;
    this.task = task;
    this.complete = complete;
    this.url = url;
    this.createdTime = createdTime;
    this.updatedTime = updatedTime;
  }
  
}
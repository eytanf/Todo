export class Task{
  _id: string;
  task: string;
  complete: boolean;

  constructor(_id:string, task: string , complete: boolean ){
    this._id = _id;
    this.task = task;
    this.complete = complete;
  }
}
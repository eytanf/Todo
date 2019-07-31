export class Task{
  _id: number;
  task: string;
  complete: boolean;

  constructor(_id:number, task: string , complete: boolean ){
    this._id = _id;
    this.task = task;
    this.complete = complete;
  }
}
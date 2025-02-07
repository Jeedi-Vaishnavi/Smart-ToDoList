import { Component,Inject,PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TaskModel } from './Model/Task';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone:true,
  imports: [RouterOutlet,ReactiveFormsModule,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
 
})


export class AppComponent {
  taskForm: FormGroup=new FormGroup({});
  taskObj: TaskModel=new TaskModel();
  taskList:TaskModel[]=[];
  isBrowser:boolean;


  constructor(@Inject(PLATFORM_ID) private platformId:object){
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.createForm();
    if(this.isBrowser){
      const oldData=localStorage.getItem("TaskData");
      if(oldData)
      {
      this.taskList=JSON.parse(oldData);
      this.checkDeadlines();
      }
    }
  }

  createForm(){
    this.taskForm=new FormGroup({
      id:new FormControl(this.taskObj.id),
      TaskName:new FormControl(this.taskObj.TaskName),
      Deadline:new FormControl(this.taskObj.Deadline),
      Priority:new FormControl(this.taskObj.Priority),

      Dependencies: new FormControl([]), 
      isSubtask: new FormControl(false), 
      ParentTask: new FormControl(null)
    })
  }




  onSave() {
    if (this.isBrowser) {
      const formData = this.taskForm.value;
      formData.Priority = this.suggestPriority(formData.Deadline); // AI-generated priority

      const oldData = localStorage.getItem("TaskData");
      if (oldData) {
        const parseData = JSON.parse(oldData);
        formData.id = parseData.length + 1;
        this.taskList = [formData, ...parseData];
      } else {
        formData.id = 1;
        this.taskList = [formData];
      }

      localStorage.setItem("TaskData", JSON.stringify(this.taskList));
      this.taskForm.reset();
    }
  }

  suggestPriority(deadline: string): string {
    if (!deadline) return "Low"; 

    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const taskDeadline = new Date(deadline);
    taskDeadline.setHours(0, 0, 0, 0);

    const timeDifference = taskDeadline.getTime() - today.getTime();
    const daysRemaining = timeDifference / (1000 * 3600 * 24); 

    if (daysRemaining <= 2) {
      return "High"; // 
    } else if (daysRemaining <= 5) {
      return "Medium"; // 
    } else {
      return "Low"; // 
    }
  }

  onDelete(id:number){
    const isDelete=confirm("Are you sure,do you want to delete?")
    if(isDelete){
      const index=this.taskList.findIndex(m=>m.id==id);
      this.taskList.splice(index,1);
      localStorage.setItem("TaskData",JSON.stringify(this.taskList));
   
     
    }
  }

  checkDeadlines() {
    const today = new Date();
    this.taskList.forEach(task => {
      const taskDeadline = new Date(task.Deadline);
      const timeDifference = taskDeadline.getTime() - today.getTime();
      const daysRemaining = Math.ceil(timeDifference / (1000 * 3600 * 24)); 
  
      if (daysRemaining <= 2) { 
        alert(`Reminder: The task "${task.TaskName}" is due in 2 days!`);
      }
    }) 
}


}
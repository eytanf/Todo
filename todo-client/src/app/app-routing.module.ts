import { NgModule } from '@angular/core';
import { Routes, RouterModule} from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { TodoListComponent } from './components/todo-list/todo-list.component';
import { AuthGuardService as AuthGuard } from './auth/auth-guard.service';

export const routingComponents = [HeaderComponent , TodoListComponent]

const routes: Routes = [
  {path: 'signin' , component: HeaderComponent },
  {path: 'main' , component: routingComponents[1] , canActivate:[AuthGuard] },
  {path:  '**' , redirectTo: 'main' , pathMatch:'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }



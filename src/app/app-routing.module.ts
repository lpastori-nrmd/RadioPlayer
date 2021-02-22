import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RadioComponent } from './radio/radio.component';
import { AdminComponent} from './admin/admin.component';
import { AddChannelsComponent} from './add-channels/add-channels.component';
import { EditChannelsComponent} from './edit-channels/edit-channels.component';

const routes: Routes = [
  { path: 'radio' , component: RadioComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'newChannel', component: AddChannelsComponent },
  { path: 'editChannel/:name', component: EditChannelsComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

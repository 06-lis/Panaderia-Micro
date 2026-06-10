import { CommonModule } from '@angular/common';
import { Component} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthComponent } from "./modules/auth/auth.component";
import LoginComponent  from "./modules/auth/login/login.component";
import { SidebarComponent } from "./shared/components/sidebar/sidebar.component";


@Component({
  selector: 'app-root',
  imports: [
    CommonModule, RouterOutlet
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'app-master-detail';
  onGeneratePDF(){

  }
}

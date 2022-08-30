import { Component, OnInit } from '@angular/core';
import { User } from './pages/auth/user.model';
import { BackendService } from './services/backend.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'pomodoras';

  constructor(private backendService: BackendService) {}
  
  ngOnInit() {
   //TODO: Move code below to separated method - autoLogin in backend service
   const userData = JSON.parse(localStorage.getItem('userData')!);

   if (userData) {
     const user = new User(userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate));

     if (user.token) {
      this.backendService.user.next(user);
      const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
      this.backendService.autoLogout(expirationDuration);
     }
   }
  }
}

import { Component, OnInit } from '@angular/core';
import { User } from './pages/auth/user.model';
import { BackendService } from './services/backend.service';
import { Meta } from "@angular/platform-browser";
import packageInfo from '../../package.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'pomodoras';
  version = packageInfo.version;

  constructor(private backendService: BackendService, private meta: Meta) {}
  
  ngOnInit() {
   this.meta.addTag({
    name: 'version',
    content: this.version
  });

   //TODO: Move code below to separated method - autoLogin in backend service
   const userData = JSON.parse(localStorage.getItem('userData')!);

   if (userData) {
     const user = new User(userData.email, userData.id, userData._token, userData._refreshToken ,new Date(userData._tokenExpirationDate));

     if (user.token) {
      this.backendService.user.next(user);
      const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
      this.backendService.autoLogout(expirationDuration);
     }
   }
  }
}

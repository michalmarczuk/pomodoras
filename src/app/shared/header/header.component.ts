import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated: boolean = false;
  private userSub!: Subscription; //https://stackoverflow.com/questions/64874221/property-has-no-initializer-and-is-not-definitely-assigned-in-the-constructor

  constructor(private backendService: BackendService) { }

  ngOnInit(): void {
    this.userSub = this.backendService.user.subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }

  onClickLogoutButton() {
    this.backendService.logout();
  }

}

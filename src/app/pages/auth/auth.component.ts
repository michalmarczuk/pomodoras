import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  isLoading: boolean = false;
  error: string = "";

  constructor(private backendService: BackendService, private router: Router) { }

  ngOnInit(): void { }

  async onSubmit(form: NgForm) {
    this.isLoading = true;

    this.backendService.login({ email: form.value.email, password: form.value.password }).subscribe(
      response => {
        this.router.navigate(['/timer']);
      },
      error => {
        this.error = error;
      }
    );

    form.reset();

    this.isLoading = false;
  }
}

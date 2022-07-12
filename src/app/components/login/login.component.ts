import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private socket: Socket, private router: Router) { }
  username = '';
  errorMessage?: string;
  ngOnInit(): void {
  }


  connectServer() {
    this.socket.connect()
    this.socket.emit('send_username', this.username);
    this.socket.on('success_login', (data: any) => {
      this.router.navigate(['chat']);
    })
    this.socket.on('login_error', (error:string) =>{
      this.errorMessage = error;
      return;
    })
  }
}

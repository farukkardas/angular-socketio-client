import { Component, OnInit } from '@angular/core';
import { inject } from '@angular/core/testing';
import { Route, Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'angular-socketio-client';

}

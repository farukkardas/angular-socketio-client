import { ThisReceiver } from '@angular/compiler';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, of } from 'rxjs';

interface User {
  id: string;
  username: string[];
}

interface Message {
  message: string;
  username: string,
  id: string;
  sentTime: Date;
}


interface MessageList {
  messages?: Message[];
  user?: User;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  @ViewChild('allChatButton') allChatButton!: ElementRef;
  userList: User[] = []
  activeTabMessages: Message[] = []
  messageList: Message[] = []
  specialMessages: MessageList[] = []
  messageInput?: string;
  privateMessageInput?: string;
  activeUser?: User;
  myId = this.socket.ioSocket.id
  constructor(public socket: Socket) { }
  ngOnInit(): void {

    this.socket.emit('get_user_list')
    this.socket.on('user_list', (data: User[]) => {
      this.userList = data
    })
    this.socket.on('chat message', (data: Message) => {
      this.messageList.push(data)
    })

    this.socket.on(
      'user_disconnected',
      (socketId: string) => {
        if (this.activeUser?.id == socketId)
          this.activeUser = undefined
      }
    )
    this.socket.on('get_private_message', (data: any) => {
      if (data.receiverId == this.socket.ioSocket.id) {
        let item = this.specialMessages.find(message => message.user?.id === data.senderId)
        if (item == undefined) {
          let user: User = {
            id: data.senderId,
            username: data.username
          }
          this.createNewPrivateMessageTab(user)
          let msgData = this.specialMessages.find(message => message.user!.id === data.senderId)
          let message: Message = {
            message: data.message,
            id: data.senderId,
            username: data.username,
            sentTime: data.sentTime
          }
          msgData!.messages = new Array<Message>(
            message
          )
        }
        else {
          let message: Message = {
            message: data.message,
            id: data.senderId,
            username: data.username,
            sentTime: data.sentTime
          }
          item.messages!.push(message)
        }
      }
      else {
        let msgData = this.specialMessages.find(message => message.user!.id === data.receiverId)
        let message: Message = {
          message: data.message,
          id: data.senderId,
          username: data.username,
          sentTime: data.sentTime
        }
        if (msgData?.messages == undefined) {
          msgData!.messages = new Array<Message>(
            message
          )
          this.activeTabMessages = msgData!.messages!
        }
        else {
          msgData!.messages!.push(message)
          this.activeTabMessages = msgData!.messages!
        }
      }
    })
  }
  sendMessage(): void {
    this.socket.emit('chat message', this.messageInput)
    this.messageInput = ''
  }
  sendPrivateMessage(): void {
    if (this.activeUser?.id === this.socket.ioSocket.id)
      return;
    let message = { 'receiverId': this.activeUser!.id, 'senderId': this.socket.ioSocket.id, 'message': this.privateMessageInput, }
    this.socket.emit('private_message', message)
    this.privateMessageInput = ''
  }
  setActiveUser(user: User): void {
    this.activeUser = user
    let specialMessage = this.specialMessages.find(message => message.user!.id === user.id)
    this.activeTabMessages = specialMessage!.messages!
  }

  createNewPrivateMessageTab(user: User): void {
    if (this.specialMessages.find(message => message.user!.id === user.id) == undefined) {
      this.specialMessages.push({ user })
    }
  }
  closePrivateChat(message: any) {
    this.specialMessages.splice(this.specialMessages.indexOf(message), 1)
    this.allChatButton.nativeElement.click()
    this.activeUser = undefined
  }

  isDisconnected(): boolean {
    return this.userList.find(user => user.id === this.activeUser?.id) == undefined
  }
}

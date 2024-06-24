import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebsocketChatService } from 'src/app/Service/websocketChat/websocket-chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  public message: string = '';

  constructor(public websocketChatService: WebsocketChatService) { }

  ngOnInit(): void {
    this.websocketChatService.connect();
  }

  sendMessage(): void {
    if (this.message.trim()) {
      this.websocketChatService.sendMessage(this.message);
      const newMessage = {
        sender: 'collaborator', // assuming 'collaborator' as the identifier for the user
        content: this.message,
        timestamp: new Date().toLocaleTimeString()
      };
      this.websocketChatService.publicMessages.push(newMessage);
      this.message = '';
    }
  }

  ngOnDestroy(): void {
    this.websocketChatService.disconnect();
  }
}

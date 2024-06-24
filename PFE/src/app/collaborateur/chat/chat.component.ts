import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebsocketChatService } from 'src/app/Service/websocketChat/websocket-chat.service';
export interface Message {
  sender: string;
  content: string;
  timestamp: string;
}
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  public message: string = '';
  public combinedMessages: Message[] = [];

  constructor(public websocketChatService: WebsocketChatService) { }

  ngOnInit(): void {
    this.websocketChatService.connect();
    this.combinedMessages = this.websocketChatService.publicMessages.concat(this.websocketChatService.privateMessages2);

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
  getCurrentTime(): string {
    return new Date().toLocaleTimeString(); // Example format, adjust as needed
  }
   isCollaboratorMessage(msg: any): boolean {
    // Assuming `publicMessages` is an array of `Message` objects
    return this.websocketChatService.publicMessages.includes(msg);
  }

  isGestionnaireMessage(msg: any): boolean {
    // Assuming `privateMessages2` is an array of strings
    return this.websocketChatService.privateMessages2.includes(msg);
  }
}

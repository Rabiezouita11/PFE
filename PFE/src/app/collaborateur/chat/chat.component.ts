import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebsocketChatService } from 'src/app/Service/websocketChat/websocket-chat.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

export interface Message {
  sender: string;
  content: string;
  timestamp: string;
  fileName?: string; // Include fileName property if you are storing image file names
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  public message: string = '';
  public combinedMessages: Message[] = [];
  fileName!: string;
  userId: any;
  image!: string;
  username: any;

  constructor(private tokenStorage: TokenStorageService, public websocketChatService: WebsocketChatService) { }

  ngOnInit(): void {
    this.websocketChatService.connect();
    this.loadMessages();
    if (this.tokenStorage.getToken()) {
      this.username = this.tokenStorage.getUser().username;
      this.userId = this.tokenStorage.getUser().id;
      this.fileName = this.tokenStorage.getUser().photos;
      this.image = this.getImageUrl();
    }
  }

  loadMessages(): void {
    const userId = this.tokenStorage.getUser().id;
    this.websocketChatService.getPersistedMessages(userId).subscribe((messages) => {
      console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaa",messages)
      this.websocketChatService.privateMessages2 = messages;
      this.combinedMessages = this.websocketChatService.publicMessages.concat(this.websocketChatService.privateMessages2);
    });
  }

  sendMessage(): void {
    if (this.message.trim()) {
      this.websocketChatService.sendMessage(this.message, this.fileName);
      const newMessage: Message = {
        sender: 'collaborator', // assuming 'collaborator' as the identifier for the user
        content: this.message,
        timestamp: new Date().toLocaleTimeString(),
        fileName: this.fileName
      };
      console.log(newMessage);
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

  isCollaboratorMessage(msg: Message): boolean {
    return this.websocketChatService.publicMessages.includes(msg);
  }

  isGestionnaireMessage(msg: Message): boolean {
    return this.websocketChatService.privateMessages2.includes(msg);
  }

  getImageUrl(): string {
    return `http://localhost:8080/api/auth/images/${this.userId}/${this.fileName}`;
  }
}

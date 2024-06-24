import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebsocketChatService } from 'src/app/Service/websocketChat/websocket-chat.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
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
  fileName!: string; // Add fileName property to store the image file name
  userId: any;
  image!: string; // Add image property to store the image URL
  username: any;

  constructor( private tokenStorage: TokenStorageService ,public websocketChatService: WebsocketChatService) { }

  ngOnInit(): void {
    this.websocketChatService.connect();
    this.combinedMessages = this.websocketChatService.publicMessages.concat(this.websocketChatService.privateMessages2);
    if (this.tokenStorage.getToken()) {
      this.username = this.tokenStorage.getUser().username;

      this.userId = this.tokenStorage.getUser().id;
      this.fileName = this.tokenStorage.getUser().photos;
      this.image = this.getImageUrl(); // Call getImageUrl() to construct the image URL

    }
  }

  sendMessage(): void {
    if (this.message.trim()) {
      this.websocketChatService.sendMessage(this.message,this.fileName);
      const newMessage = {
        sender: 'collaborator', // assuming 'collaborator' as the identifier for the user
        content: this.message,
        timestamp: new Date().toLocaleTimeString(),
        fileName: this.fileName
      };
      console.log(newMessage)
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
  getImageUrl(): string {
    // Assuming your backend endpoint for retrieving images is '/api/images/'
    return `http://localhost:8080/api/auth/images/${this.userId}/${this.fileName}`;
  }

}

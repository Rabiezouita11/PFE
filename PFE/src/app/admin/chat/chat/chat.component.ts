import { Component, OnDestroy, OnInit } from '@angular/core';
import { WebsocketChatService } from 'src/app/Service/websocketChat/websocket-chat.service';

interface Message {
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
  public replyMessage: string = '';
  public recipientId: string = '';
  public selectedCollaborator: string | null = null;

  constructor(public websocketChatService: WebsocketChatService) { }

  ngOnInit(): void {
    this.websocketChatService.connect();
  }

  selectCollaborator(collaboratorId: string): void {
    this.selectedCollaborator = collaboratorId;
    this.recipientId = collaboratorId;
  }

  sendReply(): void {
    if (this.replyMessage.trim() && this.recipientId.trim()) {
      const message: Message = {
        sender: 'gestionnaire', // or this.websocketChatService.gestionnaireId
        content: this.replyMessage,
        timestamp: new Date().toLocaleTimeString() // Example, adjust format as needed
      };
      if (!this.websocketChatService.privateMessages[this.recipientId]) {
        this.websocketChatService.privateMessages[this.recipientId] = [];
      }
      this.websocketChatService.privateMessages[this.recipientId].push(message);
      this.websocketChatService.sendReply(this.recipientId, this.replyMessage);
      this.replyMessage = '';
    }
  }

  get collaborateurIds(): string[] {
    return Object.keys(this.websocketChatService.privateMessages);
  }

  getCollaboratorName(collaboratorId: string): string {
    return this.websocketChatService.collaboratorNames[collaboratorId] || 'Unknown Collaborator';
  }

  ngOnDestroy(): void {
    this.websocketChatService.disconnect();
  }
}

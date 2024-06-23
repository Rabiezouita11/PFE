import { Component, OnDestroy, OnInit } from '@angular/core';
import { WebsocketChatService } from 'src/app/Service/websocketChat/websocket-chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy{
  public replyMessage: string = '';
  public recipientId: string = '';
  public selectedCollaborateur: string | null = null;

  constructor(public websocketChatService: WebsocketChatService) { }

  ngOnInit(): void {
    this.websocketChatService.connect();
    this.websocketChatService.subscribeToUserNotifications();
  }

  selectCollaborateur(collaborateurId: string): void {
    this.selectedCollaborateur = collaborateurId;
    this.recipientId = collaborateurId;
  }

  sendReply(): void {
    if (this.replyMessage.trim() && this.recipientId.trim()) {
      this.websocketChatService.sendReply(this.recipientId, this.replyMessage);
      this.replyMessage = '';
    }
  }

  get collaborateurIds(): string[] {
    return Object.keys(this.websocketChatService.privateMessages);
  }

  ngOnDestroy(): void {
    this.websocketChatService.disconnect();
  }
}
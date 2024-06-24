import { Injectable } from '@angular/core';
import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { CollaboratorService } from '../collaborator/collaborator.service';

interface Message {
  sender: string;
  content: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketChatService {
  private stompClient: Stomp.Client | undefined;
  private userId: number | undefined;
  private gestionnaireId: string = "1";
  public publicMessages: Message[] = [];
  public privateMessages: { [collaboratorId: string]: Message[] } = {};
  public collaboratorNames: { [collaboratorId: string]: string } = {};
  public privateMessages2: string[] = [];

  constructor(
    private tokenStorageService: TokenStorageService,
    private collaboratorService: CollaboratorService
  ) {
    this.userId = this.tokenStorageService.getUser().id;
  }

  public connect() {
    const authToken = this.tokenStorageService.getToken();
    const socket = new SockJS('http://localhost:8080/socket');
    this.stompClient = Stomp.over(socket);
    this.stompClient.connect({ Authorization: `Bearer ${authToken}` }, () => {
      console.log('Connected to WebSocket');
      this.subscribeToUserNotifications();
      this.subscribeToPrivateMessages();
    }, (error) => {
      console.error('WebSocket connection error:', error);
    });
  }

  private subscribeToPrivateMessages() {
    if (this.stompClient && this.userId) {
      this.stompClient.subscribe(`/user/${this.userId}/queue2/notification`, (message) => {
        const notification = JSON.parse(message.body);
        console.log('Private Message:', notification);
        this.privateMessages2.push(notification.content);
      });
    }
  }

  public subscribeToUserNotifications() {
    if (this.stompClient && this.userId) {
      this.stompClient.subscribe(`/user/${this.userId}/queue2/notification`, (message) => {
        const notification = JSON.parse(message.body);
        console.log('User Notification:', notification);
        const collaboratorId = notification.sender;

        if (!this.privateMessages[collaboratorId]) {
          this.privateMessages[collaboratorId] = [];
          this.fetchCollaboratorName(collaboratorId);
        }

        this.privateMessages[collaboratorId].push({
          sender: notification.sender,
          content: notification.content,
          timestamp: new Date().toLocaleTimeString() // Example, adjust format as needed
        });
      });
    }
  }

  private fetchCollaboratorName(collaboratorId: string) {
    this.collaboratorService.getCollaboratorName(collaboratorId).subscribe({
      next: (name) => {
        this.collaboratorNames[collaboratorId] = name;
      },
      error: (error) => {
        console.error('Error fetching collaborator name:', error);
      }
    });
  }

  public sendMessage(messageContent: string) {
    const message = {
      sender: this.userId,
      recipient: this.gestionnaireId,
      content: messageContent
    };
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send('/app/chat', {}, JSON.stringify(message));
    }
  }

  public sendReply(recipientId: string, messageContent: string) {
    const message = {
      sender: this.gestionnaireId,
      recipient: recipientId,
      content: messageContent
    };
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send('/app/reply', {}, JSON.stringify(message));
    }
  }

  public disconnect() {
    if (this.stompClient) {
      this.stompClient.disconnect(() => {
        console.log('Disconnected from WebSocket');
      });
    }
  }
}

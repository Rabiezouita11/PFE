import { Injectable } from '@angular/core';
import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketChatService {
  private stompClient: Stomp.Client | undefined;
  private userId: number | undefined;
  private gestionnaireId: string = "1";
  public publicMessages: string[] = [];
  public privateMessages: string[] = [];

  constructor(private tokenStorageService: TokenStorageService) {
    this.userId = this.tokenStorageService.getUser().id;
  }

  public connect() {
    const authToken = this.tokenStorageService.getToken();
    const socket = new SockJS('http://localhost:8080/socket');
    this.stompClient = Stomp.over(socket);
    this.stompClient.connect({ Authorization: `Bearer ${authToken}` }, () => {
      console.log('Connected to WebSocket');
      this.subscribeToUserNotifications();
    }, (error) => {
      console.error('WebSocket connection error:', error);
    });
  }

  public subscribeToUserNotifications() {
    if (this.stompClient && this.userId) {
      this.stompClient.subscribe(`/user/${this.userId}/queue2/notification`, (message) => {
        const notification = JSON.parse(message.body);
        console.log('User Notification:', notification);
        this.privateMessages.push(notification.content);
      });
    }
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

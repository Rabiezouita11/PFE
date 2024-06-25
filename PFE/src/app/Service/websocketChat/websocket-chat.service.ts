import { Injectable } from '@angular/core';
import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { CollaboratorService } from '../collaborator/collaborator.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DateTimeService } from '../dateTime/date-time.service';
import { map } from 'rxjs/operators';

export interface Message {
  sender: string;
  content: string;
  timestamp: string;
  fileName?: string;
}

export interface MessageGestionnaire {
  sender: string;
  content: string;
  timestamp: string;
  fileName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketChatService {
  
  private stompClient: Stomp.Client | undefined;
  private userId: number | undefined;
  private gestionnaireId: string = '1';
  public publicMessages: Message[] = [];
  public privateMessages: { [collaboratorId: string]: Message[] } = {};
  public collaboratorNames: { [collaboratorId: string]: string } = {};
  public collaboratorImages: { [collaboratorId: string]: string } = {}; // To store image URLs
  public privateMessages2: MessageGestionnaire[] = [];

  constructor(
    private dateTimeService: DateTimeService ,
    private http: HttpClient,
    private tokenStorageService: TokenStorageService,
    private collaboratorService: CollaboratorService
  ) {
    this.userId = this.tokenStorageService.getUser().id;
  }

  public connect(): void {
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

  private subscribeToPrivateMessages(): void {
    if (this.stompClient && this.userId) {
      this.stompClient.subscribe(`/user/${this.userId}/queue2/notification`, (message) => {
        const notification = JSON.parse(message.body);
        console.log('Private Message:', notification);

        const newMessage = {
          sender: 'Gestionnaire',
          content: notification.content,
          timestamp: new Date().toLocaleTimeString(),
          fileName: notification.fileName
        };

        this.privateMessages2.push(newMessage);
      });
    }
  }

  public subscribeToUserNotifications(): void {
    if (this.stompClient && this.userId) {
      this.stompClient.subscribe(`/user/${this.userId}/queue2/notification`, (message) => {
        console.log('User Notification:', message);

        const notification = JSON.parse(message.body);
        const collaboratorId = notification.sender;
        console.log(' collaboratorId:', collaboratorId);
        if (!this.privateMessages[collaboratorId]) {
          this.privateMessages[collaboratorId] = [];
          this.fetchCollaboratorName(collaboratorId);
          this.fetchCollaboratorImage(collaboratorId, notification.fileName);
        }

        this.privateMessages[collaboratorId].push({
          sender: notification.sender,
          content: notification.content,
          timestamp: new Date().toLocaleTimeString(),
          fileName: notification.fileName
        });
      });
    }
  }

  private fetchCollaboratorName(collaboratorId: string): void {
    this.collaboratorService.getCollaboratorName(collaboratorId).subscribe({
      next: (name) => {
        this.collaboratorNames[collaboratorId] = name;
      },
      error: (error) => {
        console.error('Error fetching collaborator name:', error);
      }
    });
  }

  private fetchCollaboratorImage(collaboratorId: string, fileName: string | undefined): void {
    const imageUrl = this.getImageUrl(parseInt(collaboratorId, 10), fileName);
    this.collaboratorImages[collaboratorId] = imageUrl;
  }

  public getImageUrl(userId: number, fileName: string | undefined): string {
    console.log("userId", userId);
    console.log("fileName", fileName);
    return fileName ? `http://localhost:8080/api/auth/images/${userId}/${fileName}` : 'assets/man-avatar-profile-picture-vector-600nw-229692004.webp';
  }

  public sendMessage(messageContent: string, fileName: string): void {
    const message = {
      sender: this.userId,
      recipient: this.gestionnaireId,
      content: messageContent,
      fileName: fileName
    };
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send('/app/chat', {}, JSON.stringify(message));
    }
  }

  public sendReply(recipientId: string, messageContent: string): void {
    const message = {
      sender: this.gestionnaireId,
      recipient: recipientId,
      content: messageContent
    };
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send('/app/reply', {}, JSON.stringify(message));
    }
  }

  public disconnect(): void {
    if (this.stompClient) {
      this.stompClient.disconnect(() => {
        console.log('Disconnected from WebSocket');
      });
    }
  }
  public getPersistedMessages(userId: number): Observable<Message[]> {
    return this.http.get<any[]>(`http://localhost:8080/api/messages/${userId}`).pipe(
      map(messages => messages.map((message: any) => ({
        ...message,
        timestamp: this.dateTimeService.convertToTimeString(message.timestamp)
      })))
    );
  }
  
}

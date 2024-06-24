import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from 'src/app/Models/User';
import { UsersService } from 'src/app/Service/users/users.service';
import { WebsocketChatService } from 'src/app/Service/websocketChat/websocket-chat.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import Swal from 'sweetalert2';
import { BehaviorSubject, Subscription } from 'rxjs';

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
  public users: User[] = [];
  private messageSubscription!: Subscription;
  private onlineStatusMap: { [collaboratorId: string]: BehaviorSubject<boolean> } = {};

  constructor(
    private userService: UsersService,
    public websocketChatService: WebsocketChatService,
    private tokenStorage: TokenStorageService
  ) {}

  ngOnInit(): void {
    this.websocketChatService.connect();
    this.loadUsers();

   
  }

  selectCollaborator(collaboratorId: string): void {
    this.selectedCollaborator = collaboratorId;
    this.recipientId = collaboratorId;
  }

  sendReply(): void {
    if (this.replyMessage.trim() && this.recipientId.trim()) {
      const message: Message = {
        sender: 'gestionnaire',
        content: this.replyMessage,
        timestamp: new Date().toLocaleTimeString()
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

  getCollaboratorImage(collaboratorId: string): string {
    return this.websocketChatService.collaboratorImages[collaboratorId] || 'https://bootdey.com/img/Content/avatar/avatar2.png';
  }

  loadUsers(): void {
    const authToken = this.tokenStorage.getToken();
    if (!authToken) {
      console.error('Authorization token not found');
      Swal.fire('Error!', 'Authorization token not found', 'error');
      return;
    }
    this.userService.getAllUsers(authToken).subscribe(
      (data: User[]) => {
        this.users = data.filter(user => this.collaborateurIds.includes(user.id.toString()));
        console.log(this.users);
      },
      error => {
        console.log('Error fetching users:', error);
      }
    );
  }

  getImageUrl(userId: number, fileName: string | undefined): string {
    console.log("userId", userId);
    console.log("fileName", fileName);
    return fileName ? `http://localhost:8080/api/auth/images/${userId}/${fileName}` : 'https://bootdey.com/img/Content/avatar/avatar2.png';
  }

  getCollaborator(collaboratorId: string): User | undefined {
    return this.users.find(user => user.id.toString() == collaboratorId);
  }

  ngOnDestroy(): void {
    this.websocketChatService.disconnect();
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from 'src/app/Models/User';
import { UsersService } from 'src/app/Service/users/users.service';
import { WebsocketChatService, Message } from 'src/app/Service/websocketChat/websocket-chat.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import Swal from 'sweetalert2';
import { Subscription, of } from 'rxjs';
import { CollaboratorService } from 'src/app/Service/collaborator/collaborator.service';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

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

  constructor(
    private collaboratorService: CollaboratorService,
    private userService: UsersService,
    public websocketChatService: WebsocketChatService,
    private tokenStorage: TokenStorageService
  ) {}

  ngOnInit(): void {
    this.websocketChatService.connect();
    this.loadUsers();
  }

  selectCollaborator(collaboratorId: string): void {
    console.log("collaboratorId",collaboratorId)
    this.selectedCollaborator = collaboratorId;
    this.recipientId = collaboratorId;
    // Load messages for the selected collaborator
    this.websocketChatService.getMessagesByUserId(parseInt(collaboratorId)).subscribe(
      (messages: Message[]) => {
        this.websocketChatService.privateMessages[collaboratorId] = messages;
      },
      error => {
        console.error('Error fetching messages:', error);
      }
    );
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
  getCollaboratorName(collaboratorId: string): Observable<string> {
    if (this.websocketChatService.collaboratorNames[collaboratorId]) {
      // If the collaborator's name is already cached, return it as an observable
      console.log(`Cached name found for collaborator ${collaboratorId}: ${this.websocketChatService.collaboratorNames[collaboratorId]}`);
      return of(this.websocketChatService.collaboratorNames[collaboratorId]);
    } else {
      // Otherwise, fetch the collaborator's name from the service
      console.log(`Fetching name for collaborator ${collaboratorId} from service...`);
      return this.collaboratorService.getCollaboratorName(collaboratorId).pipe(
        switchMap(name => {
          console.log(`Received name '${name}' for collaborator ${collaboratorId}. Caching and returning...`);
          this.websocketChatService.collaboratorNames[collaboratorId] = name; // Cache the collaborator's name
          return of(name); // Return the name wrapped in an observable
        }),
        catchError(error => {
          console.error('Error fetching collaborator name:', error);
          return of('Unknown Collaborator'); // Return default name on error
        })
      );
    }
  }
  

  

  getCollaboratorNameAsync(collaboratorId: string): Subscription {
    return this.collaboratorService.getCollaboratorName(collaboratorId).subscribe({
      next: (name) => {
        this.websocketChatService.collaboratorNames[collaboratorId] = name;
      },
      error: (error) => {
        console.error('Error fetching collaborator name:', error);
        // Handle error as needed
      }
    });
  }

  getCollaboratorImage(collaboratorId: string): string {
    return this.websocketChatService.collaboratorImages[collaboratorId] || 'assets/man-avatar-profile-picture-vector-600nw-229692004.webp';
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
        console.log("Users Data:", data);
  
        // Loop through each user and call selectCollaborator
        data.forEach(user => {
          const userIdToSelect = user.id.toString();
          this.selectCollaborator(userIdToSelect);
        });
  
        // Filter users and update this.users if needed
        this.users = data.filter(user => this.collaborateurIds.includes(user.id.toString()));
      },
      error => {
        console.log('Error fetching users:', error);
      }
    );
  }
  
  

  ngOnDestroy(): void {
    this.websocketChatService.disconnect();
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }
}

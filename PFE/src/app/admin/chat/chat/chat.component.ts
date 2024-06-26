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
  public users!: User[];
  private messageSubscription!: Subscription;

  constructor(
    private collaboratorService: CollaboratorService,
    private userService: UsersService,
    public websocketChatService: WebsocketChatService,
    private tokenStorage: TokenStorageService
  ) { }

  ngOnInit(): void {
    this.websocketChatService.connect();
    this.loadUsers();
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
        this.users = data;
  
        // Filter users and update this.users if needed
  
        // Loop through each user and call selectCollaborator
        this.users.forEach(user => {
          const userIdToSelect = user.id.toString();
          this.selectCollaborator(userIdToSelect);
        });
  
      },
      error => {
        console.log('Error fetching users:', error);
      }
    );
  }
  

  selectCollaborator(collaboratorId: string): void {
    console.log("Selected collaboratorId:", collaboratorId);
    this.selectedCollaborator = collaboratorId;
    this.recipientId = collaboratorId;

    // Load messages for the selected collaborator
    this.websocketChatService.getMessagesByUserId(parseInt(collaboratorId, 10)).subscribe(
      (messages: Message[]) => {
        this.websocketChatService.privateMessages[collaboratorId] = messages;

        // Fetch collaborator's photo and update if necessary
        const user = this.users.find(user => user.id.toString() === collaboratorId);
        console.log(user)
        if (user && user.photos) {
          const imageUrl = this.getImageUrl(user.id.toString(), user.photos);
          this.websocketChatService.collaboratorImages[collaboratorId] = imageUrl;
        }
      },
      error => {
        console.error('Error fetching messages:', error);
      }
    );
  }


  sendReply(): void {
    if (this.replyMessage.trim() && this.recipientId.trim()) {
      const now = new Date();
      const formattedTimestamp = now.toISOString().split('.')[0]; // '2024-06-26T09:57:25'
      const message: Message = {
        sender: '1',
        content: this.replyMessage,
        timestamp:formattedTimestamp
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
      return of(this.websocketChatService.collaboratorNames[collaboratorId]);
    } else {
      // Otherwise, fetch the collaborator's name from the service
      return this.collaboratorService.getCollaboratorName(collaboratorId).pipe(
        switchMap(name => {
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
    // Check if the collaborator's photo URL is cached
    if (this.websocketChatService.collaboratorImages[collaboratorId]) {
      return this.websocketChatService.collaboratorImages[collaboratorId];
    }
  
    // Fetch user based on collaboratorId
    const user = this.users.find(user => user.id.toString() === collaboratorId);
    if (user && user.photos) {
      return this.getImageUrl(user.id.toString(), user.photos);
    } else {
      return 'assets/man-avatar-profile-picture-vector-600nw-229692004.webp'; // Default image if no photo found
    }
  }
  



  // private fetchCollaboratorImage(collaboratorId: string, fileName: string | undefined): void {
  //   const imageUrl = this.getImageUrl(parseInt(collaboratorId, 10), fileName);
  //   console.log(imageUrl)
  //   this.websocketChatService.collaboratorImages[collaboratorId] = imageUrl;
  // }

  getImageUrl(userId: string, fileName: string | undefined): string {
    return fileName ? `http://localhost:8080/api/auth/images/${userId}/${fileName}` : 'assets/man-avatar-profile-picture-vector-600nw-229692004.webp';
  }


  ngOnDestroy(): void {
    this.websocketChatService.disconnect();
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }
}

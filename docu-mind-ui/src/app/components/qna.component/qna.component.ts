import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { QnaService } from '../../services/qna.service';
import { Router } from '@angular/router';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-qna',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './qna.component.html',
  styleUrls: ['./qna.component.css']
})
export class QnaComponent {
  messages: Message[] = [];
  loading = false;
  error: string | null = null;

  private qnaService = inject(QnaService);
  private formBuilder = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  
  lastQuestion: string | null = null;

  chatForm = this.formBuilder.group({
    question: ['', [Validators.required, Validators.minLength(1)]]
  });

  ngOnInit(): void {
    // Welcome message
    this.check_get_user_id()
    this.messages.push({
      id: 1,
      text: 'Hello! Ask me anything to get started.',
      isUser: false,
      timestamp: new Date()
    });
  }

  check_get_user_id(){
    const userId :any = localStorage.getItem('user_id');
    if(!userId){
      this.router.navigate(['/login']);
      return;
    }
    return userId;
  }

  sendQuestion(): void {
    if (this.chatForm.invalid) return;

    const userId =this.check_get_user_id()
    console.log(userId);
    if(!userId){
      this.router.navigate(['/login']);
      return;
    }
    const question = this.chatForm.value.question?.trim();
    if (!question) return;

    this.lastQuestion = question;

    // User message
    this.messages.push({
      id: this.messages.length + 1,
      text: question,
      isUser: true,
      timestamp: new Date()
    });

    this.loading = true;
    this.error = null;
    this.chatForm.reset(); // Clear textbox after sending
    this.cdr.markForCheck(); // Trigger change detection

    this.qnaService.sendQuestion(userId, question)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck(); // Trigger change detection after request completes
      }))
      .subscribe({
        next: (response: any) => {
          debugger;
          if (!response?.answer) {
            this.error = 'No answer received from the server.';
            return;
          }
          this.messages.push({
            id: this.messages.length + 1,
            text: response.answer,
            isUser: false,
            timestamp: new Date()
          });
          this.cdr.markForCheck(); // Trigger change detection after adding AI message
        },
        error: () => {
          this.error = 'Failed to get a response. Please try again.';
          this.cdr.markForCheck(); // Trigger change detection on error
        }
      });
  }

  retryLastQuestion(): void {
    if (this.lastQuestion) {
      this.chatForm.patchValue({ question: this.lastQuestion });
      this.sendQuestion();
    }
  }
}
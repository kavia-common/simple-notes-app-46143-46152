import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" role="status" aria-live="polite">
      <div *ngFor="let t of toasts" class="toast" [class.success]="t.kind==='success'" [class.error]="t.kind==='error'">
        <span class="text">{{ t.text }}</span>
        <button class="close" aria-label="Dismiss notification" (click)="dismiss(t.id)">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      right: 16px;
      bottom: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 1000;
    }
    .toast {
      background: var(--surface);
      border-left: 4px solid var(--primary);
      color: var(--text);
      box-shadow: var(--shadow-md);
      border-radius: var(--radius-md);
      padding: 10px 12px;
      min-width: 220px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: transform .2s ease, opacity .2s ease;
    }
    .toast.success { border-left-color: var(--secondary); }
    .toast.error { border-left-color: var(--error); }
    .toast .text { font-size: 14px; }
    .toast .close {
      background: transparent;
      border: none;
      color: var(--text);
      font-size: 18px;
      cursor: pointer;
      line-height: 1;
    }
    .toast .close:hover { opacity: .7; }
  `]
})
export class ToastComponent implements OnDestroy {
  toasts: ToastMessage[] = [];
  private sub = new Subscription();

  constructor(private readonly toast: ToastService) {
    this.sub.add(this.toast.stream.subscribe(list => this.toasts = list));
  }

  dismiss(id: string) {
    this.toast.dismiss(id);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}

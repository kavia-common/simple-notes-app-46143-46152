import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-confirm-delete',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="backdrop" (click)="onCancel()" aria-hidden="true"></div>
  <div class="modal" role="dialog" aria-modal="true" aria-label="Confirm deletion" tabindex="-1">
    <h3>Delete note?</h3>
    <p>Are you sure you want to delete "<strong>{{ note?.title }}</strong>"? This action cannot be undone.</p>
    <div class="actions">
      <button class="btn" (click)="onCancel()">Cancel</button>
      <button class="btn danger" (click)="onConfirm()">Delete</button>
    </div>
  </div>
  `,
  styles: [`
    .backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.35);
      backdrop-filter: blur(1px);
      z-index: 40;
    }
    .modal {
      position: fixed; inset: 0;
      display: grid; place-items: center;
      z-index: 50;
      padding: 20px;
    }
    .modal > * {
      background: var(--surface);
      color: var(--text);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      padding: 16px;
      width: min(480px, 92vw);
    }
    h3 { margin-bottom: 10px; }
    p { margin-bottom: 14px; }
    .actions { display:flex; justify-content: flex-end; gap: 10px; }
    .btn {
      border: 1px solid rgba(0,0,0,0.1);
      padding: 8px 12px; border-radius: var(--radius-md); cursor: pointer;
      background: var(--surface); color: var(--text);
    }
    .btn:hover { background: #f3f4f6; }
    .btn.danger { border-color: #fca5a5; color: #b91c1c; }
    .btn.danger:hover { background: #fee2e2; }
  `]
})
export class ConfirmDeleteComponent {
  @Input() note?: Note;
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape() {
    this.onCancel();
  }

  onCancel() { this.cancel.emit(); }
  onConfirm() { this.confirm.emit(); }
}

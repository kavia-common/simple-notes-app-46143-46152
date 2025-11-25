import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-note-card',
  standalone: true,
  imports: [CommonModule],
  template: `
  <article class="card" [style.borderTopColor]="note.color || 'var(--primary)'" tabindex="0" (keydown.enter)="edit.emit(note)">
    <header class="card-header">
      <h3 class="title">{{ note.title }}</h3>
      <div class="meta">{{ note.updatedAt | date:'medium' }}</div>
    </header>
    <section class="content">{{ note.content }}</section>
    <footer class="card-footer">
      <button class="btn" (click)="edit.emit(note)" aria-label="Edit note">Edit</button>
      <button class="btn danger" (click)="remove.emit(note)" aria-label="Delete note">Delete</button>
    </footer>
  </article>
  `,
  styles: [`
    .card {
      background: var(--surface);
      color: var(--text);
      border-radius: var(--radius-lg);
      border-top: 4px solid var(--primary);
      padding: 12px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 8px;
      transition: transform .15s ease, box-shadow .15s ease;
      outline: none;
    }
    .card:hover, .card:focus {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 8px;
    }
    .title {
      font-size: 16px;
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .meta { font-size: 12px; opacity: .7; }
    .content {
      font-size: 14px;
      color: #374151;
      white-space: pre-wrap;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 6;
      -webkit-box-orient: vertical;
      min-height: 72px;
    }
    .card-footer {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
    .btn {
      border: 1px solid rgba(0,0,0,0.1);
      padding: 6px 10px;
      border-radius: var(--radius-md);
      background: var(--surface);
      color: var(--text);
      cursor: pointer;
      transition: background .15s ease, border-color .15s ease, box-shadow .15s ease;
    }
    .btn:hover { background: #f3f4f6; }
    .btn.danger { border-color: #fca5a5; color: #b91c1c; }
    .btn.danger:hover { background: #fee2e2; }
  `]
})
export class NoteCardComponent {
  @Input() note!: Note;
  @Output() edit = new EventEmitter<Note>();
  @Output() remove = new EventEmitter<Note>();
}

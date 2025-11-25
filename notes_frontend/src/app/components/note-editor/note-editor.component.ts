import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Note } from '../../models/note.model';

export interface NoteDraft {
  id?: string;
  title: string;
  content: string;
  color?: string;
}

@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="backdrop" (click)="onCancel()" aria-hidden="true"></div>
  <div class="modal" role="dialog" aria-modal="true" aria-label="Note editor" tabindex="-1">
    <form (submit)="onSubmit($event)">
      <header class="header">
        <h3>{{ draft.id ? 'Edit Note' : 'New Note' }}</h3>
        <div class="spacer"></div>
        <input type="color" [value]="draft.color || '#2563EB'" (input)="onPatch({color: $any($event.target).value})" aria-label="Note color" />
      </header>
      <input
        class="input title"
        type="text"
        placeholder="Title"
        [value]="draft.title"
        (blur)="onAutosave()"
        (input)="onPatch({title: $any($event.target).value})"
        aria-label="Note title"
        autofocus
      />
      <textarea
        class="input content"
        placeholder="Write your note..."
        [value]="draft.content"
        (blur)="onAutosave()"
        (input)="onPatch({content: $any($event.target).value})"
        rows="10"
        aria-label="Note content"
      ></textarea>

      <footer class="actions">
        <button type="button" class="btn" (click)="onCancel()">Cancel</button>
        <button type="submit" class="btn primary">Save</button>
      </footer>
    </form>
  </div>
  `,
  styles: [`
    .backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.35);
      backdrop-filter: blur(1px); z-index: 40;
    }
    .modal {
      position: fixed; inset: 0; display: grid; place-items: center; z-index: 50; padding: 16px;
    }
    form {
      width: min(720px, 96vw);
      background: var(--surface);
      color: var(--text);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .header { display:flex; align-items:center; gap: 10px; }
    .spacer { flex: 1; }
    .input {
      width: 100%;
      padding: 10px 12px;
      border-radius: var(--radius-md);
      border: 1px solid rgba(0,0,0,0.08);
      outline: none;
      box-shadow: var(--shadow-xs);
      transition: box-shadow .2s ease, border-color .2s ease;
      background: var(--surface);
      color: var(--text);
      font-size: 14px;
    }
    .input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 4px rgba(37,99,235,0.12);
    }
    .title { font-size: 16px; font-weight: 600; }
    .content { resize: vertical; min-height: 160px; line-height: 1.4; }
    .actions { display:flex; justify-content: flex-end; gap: 10px; margin-top: 6px; }
    .btn {
      border: 1px solid rgba(0,0,0,0.1);
      padding: 8px 12px;
      border-radius: var(--radius-md);
      background: var(--surface);
      color: var(--text);
      cursor: pointer;
      transition: background .15s ease, border-color .15s ease, box-shadow .15s ease;
    }
    .btn:hover { background: #f3f4f6; }
    .btn.primary {
      background: var(--primary);
      color: white;
      border-color: transparent;
    }
    .btn.primary:hover { background: #1e51c5; }
  `]
})
export class NoteEditorComponent {
  @Input() draft: NoteDraft = { title: '', content: '', color: '#2563EB' };
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<NoteDraft>();

  private dirty = false;

  @HostListener('document:keydown.escape')
  onEscape() { this.onCancel(); }

  onPatch(patch: Partial<NoteDraft>) {
    this.dirty = true;
    this.draft = { ...this.draft, ...patch };
  }

  onAutosave() {
    // Autosave on blur if dirty and has at least title or content
    if (this.dirty && ((this.draft.title || '').trim() || (this.draft.content || '').trim())) {
      this.save.emit(this.draft);
      this.dirty = false;
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  onSubmit(e: any) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    this.save.emit(this.draft);
    this.dirty = false;
  }
}

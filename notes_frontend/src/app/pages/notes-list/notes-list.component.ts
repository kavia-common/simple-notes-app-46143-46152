import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { NoteCardComponent } from '../../components/note-card/note-card.component';
import { FabComponent } from '../../components/fab/fab.component';
import { NoteEditorComponent, NoteDraft } from '../../components/note-editor/note-editor.component';
import { ConfirmDeleteComponent } from '../../components/confirm-delete/confirm-delete.component';
import { NotesService } from '../../services/notes.service';
import { ToastComponent } from '../../components/toast/toast.component';
import { ToastService } from '../../services/toast.service';
import { Note } from '../../models/note.model';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [CommonModule, HeaderComponent, NoteCardComponent, FabComponent, NoteEditorComponent, ConfirmDeleteComponent, ToastComponent],
  template: `
  <app-header (search)="onSearch($event)"></app-header>

  <main class="content">
    <div class="grid" *ngIf="filtered$ | async as notes">
      <div *ngIf="!notes.length" class="empty">
        <p>No notes found. Create a new one!</p>
      </div>
      <app-note-card
        *ngFor="let n of notes"
        [note]="n"
        (edit)="openEditor(n)"
        (remove)="askDelete(n)"
      ></app-note-card>
    </div>
  </main>

  <app-fab (clicked)="openEditor()"></app-fab>

  <app-note-editor
    *ngIf="editorOpen"
    [draft]="editorDraft"
    (cancel)="closeEditor()"
    (save)="saveDraft($event)"
  ></app-note-editor>

  <app-confirm-delete
    *ngIf="confirmOpen"
    [note]="toDelete"
    (cancel)="confirmOpen=false"
    (confirm)="confirmDelete()"
  ></app-confirm-delete>

  <app-toast></app-toast>
  `,
  styles: [`
    .content {
      padding: 18px;
      max-width: 1100px;
      margin: 0 auto;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 14px;
    }
    .empty {
      background: var(--surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      padding: 18px;
      color: var(--text);
    }
  `]
})
export class NotesListComponent implements OnInit {
  private search$ = new BehaviorSubject<string>('');
  notes$!: Observable<Note[]>;
  filtered$!: Observable<Note[]>;

  editorOpen = false;
  editorDraft: NoteDraft = { title: '', content: '', color: '#2563EB' };
  confirmOpen = false;
  toDelete?: Note;

  constructor(private readonly notes: NotesService, private readonly toast: ToastService) {}

  ngOnInit(): void {
    this.notes$ = this.notes.getAll();
    this.filtered$ = combineLatest([this.notes$, this.search$]).pipe(
      map(([list, q]) => {
        const query = (q || '').toLowerCase();
        if (!query) return list;
        return list.filter(n =>
          (n.title || '').toLowerCase().includes(query) ||
          (n.content || '').toLowerCase().includes(query)
        );
      })
    );
  }

  onSearch(q: string) {
    this.search$.next(q || '');
  }

  openEditor(note?: Note) {
    if (note) {
      this.editorDraft = { id: note.id, title: note.title, content: note.content, color: note.color };
    } else {
      this.editorDraft = { title: '', content: '', color: '#2563EB' };
    }
    this.editorOpen = true;
  }

  closeEditor() {
    this.editorOpen = false;
  }

  saveDraft(draft: NoteDraft) {
    if (draft.id) {
      this.notes.update(draft.id, { title: draft.title, content: draft.content, color: draft.color }).subscribe({
        next: () => {
          this.toast.show('Note updated', 'success');
          this.editorOpen = false;
        },
        error: () => this.toast.show('Failed to update note', 'error')
      });
    } else {
      this.notes.create({ title: draft.title, content: draft.content, color: draft.color }).subscribe({
        next: () => {
          this.toast.show('Note created', 'success');
          this.editorOpen = false;
        },
        error: () => this.toast.show('Failed to create note', 'error')
      });
    }
  }

  askDelete(note: Note) {
    this.toDelete = note;
    this.confirmOpen = true;
  }

  confirmDelete() {
    if (!this.toDelete) return;
    this.notes.delete(this.toDelete.id).subscribe({
      next: ok => {
        if (ok) this.toast.show('Note deleted', 'success');
        this.confirmOpen = false;
        this.toDelete = undefined;
      },
      error: () => {
        this.toast.show('Failed to delete note', 'error');
        this.confirmOpen = false;
      }
    });
  }
}

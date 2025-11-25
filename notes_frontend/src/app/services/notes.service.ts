import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError, from } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Note } from '../models/note.model';
import { environment } from '../environment';

// Lightweight HTTP client using fetch to avoid extra dependencies
function http<T>(method: 'GET'|'POST'|'PUT'|'DELETE', url: string, data?: any): Promise<T> {
  const opts: globalThis.RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (data !== undefined) {
    (opts as any).body = JSON.stringify(data);
  }
  const doFetch: any = (typeof globalThis !== 'undefined' && (globalThis as any).fetch) ? (globalThis as any).fetch : undefined;
  if (!doFetch) {
    // If fetch isn't available (SSR build step), resolve with a rejection to trigger fallback
    return Promise.reject(new Error('fetch not available'));
  }
  return doFetch(url, opts).then(async (res: any) => {
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    }
    // Empty response (204) handling
    if (res.status === 204) return undefined as unknown as T;
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) return undefined as unknown as T;
    const json = await res.json().catch(() => undefined);
    return json as T;
  });
}

@Injectable({ providedIn: 'root' })
export class NotesService {
  private readonly STORAGE_KEY = 'notes.app.items.v1';
  private readonly apiBase = environment.apiBaseUrl;
  private readonly notes$ = new BehaviorSubject<Note[]>([]);
  private initialized = false;

  constructor() {
    this.bootstrap();
  }

  // PUBLIC_INTERFACE
  /**
   * Returns an observable stream of all notes, sorted by updatedAt desc.
   */
  getAll(): Observable<Note[]> {
    return this.notes$.asObservable().pipe(
      map(list => [...list].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()))
    );
  }

  // PUBLIC_INTERFACE
  /**
   * Returns an observable for a note by id.
   */
  getById(id: string): Observable<Note | undefined> {
    return this.getAll().pipe(map(list => list.find(n => n.id === id)));
  }

  // PUBLIC_INTERFACE
  /**
   * Creates a new note.
   */
  create(payload: Pick<Note, 'title' | 'content' | 'color'>): Observable<Note> {
    const now = new Date().toISOString();
    const rnd = (globalThis.crypto && 'randomUUID' in globalThis.crypto) ? (globalThis.crypto as any).randomUUID() : Math.random().toString(36).slice(2);
    const note: Note = {
      id: rnd,
      title: (payload.title ?? '').trim() || 'Untitled',
      content: payload.content ?? '',
      color: payload.color,
      createdAt: now,
      updatedAt: now
    };
    return this.persist('create', note);
  }

  // PUBLIC_INTERFACE
  /**
   * Updates a note by id with partial fields.
   */
  update(id: string, patch: Partial<Pick<Note, 'title' | 'content' | 'color'>>): Observable<Note> {
    const existing = this.notes$.value.find(n => n.id === id);
    if (!existing) return throwError(() => new Error('Note not found'));
    const updated: Note = {
      ...existing,
      ...patch,
      title: (patch.title ?? existing.title).trim() || 'Untitled',
      updatedAt: new Date().toISOString()
    };
    return this.persist('update', updated);
  }

  // PUBLIC_INTERFACE
  /**
   * Deletes a note by id.
   */
  delete(id: string): Observable<boolean> {
    const exists = this.notes$.value.some(n => n.id === id);
    if (!exists) return of(false);
    return this.persist('delete', { id } as Note).pipe(map(() => true));
  }

  // PUBLIC_INTERFACE
  /**
   * Searches notes by title or content, case-insensitive.
   */
  search(query: string): Observable<Note[]> {
    const q = (query || '').toLowerCase();
    if (!q) return this.getAll();
    return this.getAll().pipe(
      map(list =>
        list.filter(n =>
          (n.title || '').toLowerCase().includes(q) ||
          (n.content || '').toLowerCase().includes(q)
        )
      )
    );
  }

  private bootstrap(): void {
    if (this.initialized) return;
    // Attempt loading from local storage
    const local = this.readLocal();
    if (local && local.length) {
      this.notes$.next(local);
      this.initialized = true;
      return;
    }
    // Seed data if nothing present
    const seed = this.seedNotes();
    this.notes$.next(seed);
    this.writeLocal(seed);
    this.initialized = true;

    // If API base exists, try a lazy fetch to sync (non-blocking)
    if (this.apiBase) {
      this.fetchFromApi().subscribe({
        next: list => {
          if (Array.isArray(list) && list.length) {
            this.notes$.next(list);
            this.writeLocal(list);
          }
        },
        error: () => {
          // Graceful: keep local data
        }
      });
    }
  }

  private seedNotes(): Note[] {
    const now = new Date();
    const n1: Note = {
      id: (globalThis.crypto && 'randomUUID' in globalThis.crypto) ? (globalThis.crypto as any).randomUUID() : Math.random().toString(36).slice(2),
      title: 'Welcome to Simple Notes',
      content: 'Create, edit, and delete notes.\n\nSearch by title or content. Enjoy the Ocean Professional theme!',
      color: '#2563EB',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
    const n2: Note = {
      id: (globalThis.crypto && 'randomUUID' in globalThis.crypto) ? (globalThis.crypto as any).randomUUID() : Math.random().toString(36).slice(2),
      title: 'Tips',
      content: '- Click the + button to add a note\n- Click a card to edit\n- Use the search bar to filter\n- Colors help categorize notes',
      color: '#F59E0B',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
    return [n1, n2];
    }

  private readLocal(): Note[] {
    try {
      const ls = (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) ? (globalThis as any).localStorage : undefined;
      if (!ls) return [];
      const raw = ls.getItem(this.STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch {
      return [];
    }
  }

  private writeLocal(notes: Note[]): void {
    try {
      const ls = (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) ? (globalThis as any).localStorage : undefined;
      if (!ls) return;
      ls.setItem(this.STORAGE_KEY, JSON.stringify(notes));
    } catch {
      // ignore
    }
  }

  private fetchFromApi(): Observable<Note[]> {
    if (!this.apiBase) return of(this.notes$.value);
    const url = `${this.apiBase}/notes`;
    return from(http<Note[]>('GET', url)).pipe(
      catchError(err => {
        return throwError(() => err);
      })
    );
  }

  private persist(action: 'create'|'update'|'delete', note: Note): Observable<Note> {
    // Optimistic local update first
    let nextState: Note[] = [];
    if (action === 'create') {
      nextState = [note, ...this.notes$.value];
    } else if (action === 'update') {
      nextState = this.notes$.value.map(n => n.id === note.id ? note : n);
    } else {
      nextState = this.notes$.value.filter(n => n.id !== note.id);
    }
    this.notes$.next(nextState);
    this.writeLocal(nextState);

    // Attempt API if base exists; fallback to success if fails
    if (this.apiBase) {
      const url = `${this.apiBase}/notes${action !== 'create' ? `/${note.id}` : ''}`;
      const method: any = action === 'create' ? 'POST' : action === 'update' ? 'PUT' : 'DELETE';
      const payload = action === 'delete' ? undefined : note;
      return from(http<Note>('POST' === method ? 'POST' : method, url, payload)).pipe(
        catchError(() => of(note)),
        map(() => note)
      );
    }

    return of(note);
  }
}

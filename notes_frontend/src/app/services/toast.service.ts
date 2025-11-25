import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastKind = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  text: string;
  kind: ToastKind;
  timeout: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toasts$ = new BehaviorSubject<ToastMessage[]>([]);

  /** Returns observable of toast list */
  get stream() {
    return this.toasts$.asObservable();
  }

  /** Push a toast */
  show(text: string, kind: ToastKind = 'info', timeout = 2500) {
    const id = (globalThis.crypto && 'randomUUID' in globalThis.crypto) ? (globalThis.crypto as any).randomUUID() : Math.random().toString(36).slice(2);
    const msg: ToastMessage = { id, text, kind, timeout };
    const list = [...this.toasts$.value, msg];
    this.toasts$.next(list);
    if (typeof globalThis !== 'undefined' && (globalThis as any).setTimeout) {
      (globalThis as any).setTimeout(() => this.dismiss(msg.id), timeout);
    }
  }

  /** Dismiss a toast by id */
  dismiss(id: string) {
    this.toasts$.next(this.toasts$.value.filter(t => t.id !== id));
  }
}

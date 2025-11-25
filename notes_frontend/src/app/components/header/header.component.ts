import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
  <header class="app-header" role="banner">
    <div class="title">
      <span class="logo" aria-hidden="true">📝</span>
      <h1>Simple Notes</h1>
    </div>
    <div class="actions">
      <input
        type="search"
        class="search"
        placeholder="Search notes..."
        aria-label="Search notes"
        (input)="onSearch($any($event.target).value)"
      />
    </div>
  </header>
  `,
  styles: [`
    .app-header {
      position: sticky;
      top: 0;
      z-index: 10;
      background: linear-gradient(90deg, rgba(37,99,235,0.08), rgba(249,250,251,1));
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: var(--shadow-sm);
      border-bottom: 1px solid rgba(0,0,0,0.04);
      backdrop-filter: saturate(180%) blur(4px);
    }
    .title {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .title h1 {
      font-size: 20px;
      color: var(--text);
    }
    .logo { font-size: 20px; }
    .actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .search {
      width: 260px;
      max-width: 40vw;
      padding: 10px 12px;
      border-radius: var(--radius-md);
      border: 1px solid rgba(0,0,0,0.08);
      outline: none;
      box-shadow: var(--shadow-xs);
      transition: box-shadow .2s ease, border-color .2s ease;
      background: var(--surface);
      color: var(--text);
    }
    .search:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 4px rgba(37,99,235,0.12);
    }
  `]
})
export class HeaderComponent {
  @Output() search = new EventEmitter<string>();

  onSearch(value: string) {
    this.search.emit(value);
  }
}

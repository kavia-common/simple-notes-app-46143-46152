import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fab',
  standalone: true,
  imports: [CommonModule],
  template: `
  <button class="fab" (click)="clicked.emit()" aria-label="Add note">
    +
  </button>
  `,
  styles: [`
    .fab {
      position: fixed;
      right: 24px;
      bottom: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: none;
      background: var(--primary);
      color: white;
      font-size: 28px;
      line-height: 1;
      cursor: pointer;
      box-shadow: var(--shadow-lg);
      transition: transform .15s ease, box-shadow .15s ease, background .2s ease;
    }
    .fab:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-xl);
      background: #1e51c5;
    }
  `]
})
export class FabComponent {
  @Output() clicked = new EventEmitter<void>();
}

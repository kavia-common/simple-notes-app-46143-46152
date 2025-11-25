import { Routes } from '@angular/router';
import { NotesListComponent } from './pages/notes-list/notes-list.component';

export const routes: Routes = [
  {
    path: '',
    component: NotesListComponent,
    title: 'Simple Notes'
  }
];

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string; // ISO string for serialization
  updatedAt: string; // ISO string for serialization
  color?: string;
}

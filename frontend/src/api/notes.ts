import { request } from './http'
import type { Note, NoteInput, NotePage } from '@/types/note'

export function listNotes(limit: number, offset: number) {
  return request<NotePage>(`/notes?limit=${limit}&offset=${offset}`)
}

export function createNote(data: NoteInput) {
  return request<Note>('/notes', { method: 'POST', body: JSON.stringify(data) })
}

export function updateNote(id: number, data: NoteInput) {
  return request<Note>(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteNote(id: number) {
  return request<void>(`/notes/${id}`, { method: 'DELETE' })
}

// 与 backend/app/schemas.py 对应；HTTP 中的日期以 ISO 字符串传输。
export interface Note {
  id: number
  title: string
  content: string
  created_at: string
  updated_at: string
}

export interface NoteInput {
  title: string
  content: string
}

export interface NotePage {
  items: Note[]
  total: number
  limit: number
  offset: number
}

import { format, formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays < 7) {
    return formatDistanceToNow(date, { addSuffix: true, locale: ko })
  }

  return format(date, 'yyyy.MM.dd', { locale: ko })
}

export const formatFullDate = (dateString: string): string => {
  return format(new Date(dateString), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })
}


import type { Question } from '@/types/question'

export type StudyOrder = 'sequential' | 'random'

export function buildStudyQueue(
  questions: Question[],
  order: StudyOrder,
  random: () => number = Math.random,
): Question[] {
  const queue = [...questions]
  if (order === 'sequential') return queue

  for (let index = queue.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    const current = queue[index]
    queue[index] = queue[swapIndex]
    queue[swapIndex] = current
  }
  return queue
}

export function moveStudyPosition(current: number, total: number, delta: number): number {
  if (total <= 0) return 0
  return Math.min(total - 1, Math.max(0, current + delta))
}

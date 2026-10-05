interface ExamPaletteProps {
  questionIds: string[]
  currentId: string
  answers: Record<string, string[]>
  onSelect: (questionId: string) => void
}

export function ExamPalette({ questionIds, currentId, answers, onSelect }: ExamPaletteProps) {
  return (
    <div className="grid grid-cols-10 gap-1.5 md:gap-2">
      {questionIds.map((questionId, index) => {
        const answered = (answers[questionId]?.length ?? 0) > 0
        const current = questionId === currentId
        return (
          <button
            key={questionId}
            type="button"
            aria-label={`第 ${index + 1} 题，${answered ? '已答' : '未答'}`}
            className={`flex h-8 items-center justify-center rounded-md text-xs font-semibold transition ${
              current ? 'bg-teal-700 text-white' : answered ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-500'
            }`}
            onClick={() => onSelect(questionId)}
          >
            {index + 1}
          </button>
        )
      })}
    </div>
  )
}

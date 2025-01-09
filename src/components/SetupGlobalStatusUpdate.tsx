import { NextReviewDate, Note, Status } from './types/Note'
import dayjs from 'dayjs'
import { MutableRefObject, SetStateAction } from 'react'

const POLLING_INTERVAL = 1000

export const setupGlobalStatusUpdate = (
  statusTimers: MutableRefObject<{
    globalTimer?: NodeJS.Timeout | undefined
  }>,
  setTreeData: {
    (value: SetStateAction<Note[]>): void
    (arg0: (prevData: Note[]) => Note[]): void
  },
  showNotification: (status: Status, title: string) => void, // Новый параметр
) => {
  const updateAllStatuses = () => {
    setTreeData((prevData: Note[]) =>
      prevData.map((node) => ({
        ...node,
        status: trackAndUpdateStatus(node, showNotification),
        children: updateChildrenStatuses(node.children, showNotification),
      })),
    )
  }

  if (statusTimers.current.globalTimer) {
    clearInterval(statusTimers.current.globalTimer)
  }

  statusTimers.current.globalTimer = setInterval(updateAllStatuses, POLLING_INTERVAL)
}

const calculateStatus = (nextReviewDate: NextReviewDate): Status => {
  if (!nextReviewDate) return 'ok'

  const now = dayjs()
  const nextReviewMoment = dayjs(nextReviewDate)
  const warningThreshold = nextReviewMoment.clone().add(2, 'days')

  if (warningThreshold.isBefore(now)) return 'warningSevere'
  if (nextReviewMoment.isBefore(now)) return 'warning'
  return 'ok'
}

const trackAndUpdateStatus = (
  node: Note,
  showNotification: (status: Status, title: string) => void,
): Status => {
  const newStatus = calculateStatus(node.nextReviewDate)
  if (newStatus !== node.status) {
    showNotification(newStatus, node.title)
  }
  return newStatus
}

const updateChildrenStatuses = (
  nodes: Note[] | undefined,
  showNotification: (status: Status, title: string) => void,
): Note[] | undefined =>
  nodes?.map((node) => ({
    ...node,
    status: trackAndUpdateStatus(node, showNotification),
    children: updateChildrenStatuses(node.children, showNotification),
  }))

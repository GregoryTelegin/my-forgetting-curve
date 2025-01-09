import React, {useEffect, useRef, useState, useCallback} from 'react'
import {Tree, notification} from 'antd'
import type {TreeProps} from 'antd'

import {RenderTreeNode} from './RenderTreeNode'
import {setupGlobalStatusUpdate} from '../SetupGlobalStatusUpdate'
import type {NextReviewDate, Note, Status} from '../types/Note'
import {CurveForgetting} from '~/components/types/CurveForgetting'
import {getCSSVariable} from '~/utils/themeUtils'

const TreeManager: React.FC<{
  app: any;
  data: Note[];
  onDataUpdate: (updatedData: Note[]) => void;
  forgettingCurves: CurveForgetting[];
}> = ({app, data, onDataUpdate, forgettingCurves}) => {
  const [treeData, setTreeData] = useState<Note[]>(data)
  const statusTimers = useRef<{ globalTimer?: NodeJS.Timeout }>({})

  useEffect(() => {
    setTreeData(data)
  }, [data])

  useEffect(() => {
    const showNotification = (status: Status, title: string) => {
      if (status === 'warning') {
        notification.warning({
          message: 'Напоминание',
          description: `Пришло время повторения "${title}".`,
          placement: 'bottomRight',
          className: "notificationWarning",
        })
      } else if (status === 'warningSevere') {
        notification.error({
          message: 'Важное напоминание',
          description: `Срочное повторение для "${title}"!`,
          placement: 'bottomRight',
          className: "notificationSevere",
        })
      }
    }

    setupGlobalStatusUpdate(statusTimers, setTreeData, showNotification)
    return () => {
      if (statusTimers.current.globalTimer) {
        clearInterval(statusTimers.current.globalTimer)
      }
    }
  }, [])

  const handleNodeDrop: TreeProps['onDrop'] = (info) => {
    const dropKey = info.node.key
    const dragKey = info.dragNode.key
    const dropPos = info.node.pos.split('-')
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])

    const data = [...treeData]
    let dragNode: Note | null = null

    const traverseTree = (
      nodes: Note[],
      key: React.Key,
      callback: (node: Note, index: number, arr: Note[]) => void,
    ) => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].key === key) {
          callback(nodes[i], i, nodes)
          return
        }
        if (nodes[i].children) traverseTree(nodes[i].children!, key, callback)
      }
    }

    traverseTree(data, dragKey, (node, index, arr) => {
      arr.splice(index, 1)
      dragNode = node
    })

    if (!info.dropToGap) {
      traverseTree(data, dropKey, (node) => {
        node.children = node.children || []
        node.children.unshift(dragNode!)
      })
    } else {
      let targetArray: Note[] = []
      let targetIndex = 0

      traverseTree(data, dropKey, (_node, index, arr) => {
        targetArray = arr
        targetIndex = index
      })

      if (dropPosition === -1) {
        targetArray.splice(targetIndex, 0, dragNode!)
      } else {
        targetArray.splice(targetIndex + 1, 0, dragNode!)
      }
    }

    setTreeData(data)
    onDataUpdate(data as Note[])
  }

  const updateNode = useCallback((key: string, updates: Partial<Note>) => {
    setTreeData((prev: Note[]) => {
      const updatedTreeData: Note[] = updateNodeChildren(prev, key, updates)
      if (updatedTreeData !== prev) {
        onDataUpdate(updatedTreeData)
      }
      return updatedTreeData
    })
  }, [onDataUpdate])

  const handleDateChange = useCallback(
    (key: string, newDate: string) => {
      updateNode(key, {nextReviewDate: newDate})
    },
    [updateNode],
  )

  const handleTitleChange = useCallback(
    (key: string, newTitle: string) => {
      updateNode(key, {title: newTitle})
    },
    [updateNode],
  )

  const handleLinkNote = useCallback(
    (key: string, newLinkNote: string) => {
      updateNode(key, {linkNote: newLinkNote})
    },
    [updateNode],
  )

  const handleCurveForgetting = useCallback(
    (key: string, curveForgetting: string) => {
      updateNode(key, {forgettingCurveId: curveForgetting})
    },
    [updateNode],
  )

  const handleCurveForgettingLastActiveInterval = useCallback(
    (key: string, newLastActiveInterval: number) => {
      updateNode(key, {lastActiveInterval: newLastActiveInterval})
    },
    [updateNode],
  )

  const handleReviewDates = useCallback(
    (key: string, newNextReviewDate: NextReviewDate, newReviewDates: NextReviewDate[], newLastActiveInterval: number) => {
      updateNode(key, {
        nextReviewDate: newNextReviewDate,
        reviewDates: newReviewDates,
        lastActiveInterval: newLastActiveInterval,
      })
    },
    [updateNode],
  )

  const handleSkippedReviewDates = useCallback(
    (key: string, newSkippedReviewDates: NextReviewDate[]) => {
      updateNode(key, {skippedReviewDates: newSkippedReviewDates})
    },
    [updateNode],
  )

  const handleDeleteNote = useCallback(
    (key: string) => {
      setTreeData((prevTreeData) => {
        const deleteNode = (nodes: Note[]): Note[] =>
          nodes.filter((node) => {
            if (node.key === key) return false
            if (node.children) {
              node.children = deleteNode(node.children)
            }
            return true
          })

        const updatedTreeData = deleteNode(prevTreeData)
        onDataUpdate(updatedTreeData)
        return updatedTreeData
      })
    },
    [onDataUpdate],
  )

  const processTreeNodes = (nodes: Note[]): Note[] =>
    nodes.map((node) => ({
      ...node,
      title: (
        <RenderTreeNode
          app={app}
          key={node.key}
          node={node}
          onDateChange={handleDateChange}
          onTitleChange={handleTitleChange}
          onLinkNoteChange={handleLinkNote}
          forgettingCurves={forgettingCurves}
          onCurveForgettingChange={handleCurveForgetting}
          onCurveForgettingLastActiveIntervalChange={handleCurveForgettingLastActiveInterval}
          onReviewDatesChange={handleReviewDates}
          onSkippedReviewDatesChange={handleSkippedReviewDates}
          onDeleteNote={handleDeleteNote}
        />
      ),
      children: node.children ? processTreeNodes(node.children) : [],
    }))

  return (
    <Tree
      onDrop={handleNodeDrop}
      defaultExpandAll
      draggable
      blockNode
      treeData={processTreeNodes(treeData)}
      className="treeComp"
    />
  )
}

const updateNodeChildren = (
  children: Note[] | undefined,
  key: string,
  updates: Partial<Note>,
): Note[] | undefined => {
  if (!children) return children

  let hasChanged = false

  const updatedChildren = children.map((child) => {
    const isTargetNode = child.key === key
    const updatedChildChildren = updateNodeChildren(child.children, key, updates)

    if (isTargetNode || updatedChildChildren !== child.children) {
      hasChanged = true
    }

    return {
      ...child,
      ...(isTargetNode ? updates : {}),
      children: updatedChildChildren,
    }
  })


  return hasChanged ? updatedChildren : children
}
export default TreeManager

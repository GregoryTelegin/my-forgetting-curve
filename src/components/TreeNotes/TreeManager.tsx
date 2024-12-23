import React, {useEffect, useRef, useState, useCallback} from 'react'
import {Tree, ConfigProvider} from 'antd'
import type {TreeProps} from 'antd'

import {RenderTreeNode} from './RenderTreeNode'
import {setupGlobalStatusUpdate} from '../SetupGlobalStatusUpdate'
import {getCSSVariable} from '../../utils/themeUtils'
import type {Note} from '../types/note'
import '../../../styles.css'

const TreeManager: React.FC<{
  data: Note[];
  onDataUpdate: (updatedData: Note[]) => void;
}> = ({data, onDataUpdate}) => {
  const [treeData, setTreeData] = useState<Note[]>(data)
  const statusTimers = useRef<{ globalTimer?: NodeJS.Timeout }>({})

  useEffect(() => {
    setTreeData(data);
  }, [data]);

  useEffect(() => {
    setupGlobalStatusUpdate(statusTimers, setTreeData)
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

  const updateNode = useCallback(
    (key: string, updates: Partial<Note>) => {
      setTreeData((prev: Note[]) => {
        const updatedTreeData = prev.map((node: Note) =>
          node.key === key
            ? { ...node, ...updates }
            : { ...node, children: updateNodeChildren(node.children, key, updates) },
        );

        onDataUpdate(updatedTreeData);
        return updatedTreeData;
      });
    },
    [onDataUpdate],
  );

  const themeTree = {
    colorPrimary: getCSSVariable('--interactive-accent'),
    colorText: getCSSVariable('--text-normal'),
    colorBgContainer: getCSSVariable('--interactive-accent'),
    borderRadius: 8,
  }

  const handleDateChange = useCallback(
    (key: string, newDate: string) => {
      updateNode(key, { nextReviewDate: newDate });
    },
    [updateNode],
  );

  const handleTitleChange = useCallback(
    (key: string, newTitle: string) => {
      updateNode(key, { title: newTitle });
    },
    [updateNode],
  );

  const processTreeNodes = (nodes: Note[]): Note[] =>
    nodes.map((node) => ({
      ...node,
      title: (
        <RenderTreeNode
          key={node.key}
          node={node}
          onDateChange={handleDateChange}
          onTitleChange={handleTitleChange}
        />
      ),
      children: node.children ? processTreeNodes(node.children) : [],
    }))

  return (
    <ConfigProvider theme={{token: themeTree}}>
      <Tree
        onDrop={handleNodeDrop}
        defaultExpandAll
        draggable
        blockNode
        treeData={processTreeNodes(treeData)}
      />
    </ConfigProvider>
  )
}

const updateNodeChildren = (
  children: Note[] | undefined,
  key: string,
  updates: Partial<Note>,
): Note[] | undefined => {
  if (!children) return children;

  let hasChanged = false;

  const updatedChildren = children.map((child) => {
    const isTargetNode = child.key === key;
    const updatedChildChildren = updateNodeChildren(child.children, key, updates);

    if (isTargetNode || updatedChildChildren !== child.children) {
      hasChanged = true;
    }

    return {
      ...child,
      ...(isTargetNode ? updates : {}),
      children: updatedChildChildren,
    };
  });

  return hasChanged ? updatedChildren : children;
};
export default TreeManager

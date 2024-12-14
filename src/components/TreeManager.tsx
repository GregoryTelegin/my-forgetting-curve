import React, {useState, useEffect} from 'react'
import {Tree, Input, ConfigProvider} from 'antd'
import type {TreeDataNode, TreeProps} from 'antd'

import {getCSSVariable} from '../utils/themeUtils'
import '../../styles.css'

interface TreeItem {
  id: number;
  name: string;
  type: 'folder' | 'file';
  children?: TreeItem[];
}

const TreeManager: React.FC<{
  data: TreeDataNode[];
  onDataUpdate: (updatedData: TreeItem[]) => void;
}> = ({data, onDataUpdate}) => {
  const [treeData, setTreeData] = useState<TreeDataNode[]>(data)

  const theme = {
    colorPrimary: getCSSVariable('--interactive-accent'),
    colorText: getCSSVariable('--text-normal'),
    colorBgContainer: getCSSVariable('--interactive-accent'),
    borderRadius: 8,
  }

  useEffect(() => {
    setTreeData(data)
  }, [data])

  return (
    <ConfigProvider theme={{token: theme}}>
      <EditableTreeView treeData={treeData} onTreeUpdate={onDataUpdate}/>
    </ConfigProvider>
  )
}

const EditableTreeView: React.FC<{
  treeData: TreeDataNode[];
  onTreeUpdate: (updatedData: TreeItem[]) => void;
}> = ({treeData: initialTreeData, onTreeUpdate}) => {
  const [treeData, setTreeData] = useState<TreeDataNode[]>(initialTreeData)
  const [editingNode, setEditingNode] = useState<{ key: string; value: string } | null>(null)

  useEffect(() => {
    setTreeData(initialTreeData)
  }, [initialTreeData])

  const updateTreeNode = (key: string, newValue: string) => {
    const recursivelyUpdate = (nodes: TreeDataNode[]): TreeDataNode[] =>
      nodes.map((node) => {
        if (node.key === key) return {...node, title: newValue}
        if (node.children) return {...node, children: recursivelyUpdate(node.children)}
        return node
      })

    return recursivelyUpdate(treeData)
  }

  const beginEditing = (key: string, value: string) => {
    setEditingNode({key, value})
  }

  const finishEditing = () => {
    if (!editingNode) return

    const updatedTreeData = updateTreeNode(editingNode.key, editingNode.value)
    setTreeData(updatedTreeData)
    setEditingNode(null)
    onTreeUpdate(updatedTreeData as TreeItem[])
  }

  const handleNodeDrop: TreeProps['onDrop'] = (info) => {
    const dropKey = info.node.key
    const dragKey = info.dragNode.key
    const dropPos = info.node.pos.split('-')
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])

    const data = [...treeData]
    let dragNode: TreeDataNode | null = null

    const traverseTree = (
      nodes: TreeDataNode[],
      key: React.Key,
      callback: (node: TreeDataNode, index: number, arr: TreeDataNode[]) => void,
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
      let targetArray: TreeDataNode[] = []
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
    onTreeUpdate(data as TreeItem[])
  }

  const renderTreeNode = (node: TreeDataNode) => {
    const isEditing = editingNode?.key === node.key

    const openObsidianLink = (link: string) => {
      const app = (window as any).app
      if (app && app.workspace) {
        app.workspace.openLinkText(link, '', false)
      }
    }

    return isEditing ? (
      <Input
        value={editingNode.value}
        onChange={(e) => setEditingNode({...editingNode, value: e.target.value})}
        onBlur={finishEditing}
        onPressEnter={finishEditing}
        autoFocus
        className="editable-input"
      />
    ) : (
      <span className="content-editable">
        <span
          className="editable-element"
          onDoubleClick={() => beginEditing(node.key as string, node.title as string)}
        >
          {node.title}
        </span>
        <span className="node-time">
          {/*{node.time || 'DD-MM-YYYYTHH:mm'}*/}
          2024-12-13 21:56
        </span>
        <button
          onClick={() => openObsidianLink(node.link || 'Поля данных и формат')}
          className="node-link-button"
        >
          Open
        </button>
      </span>
    )
  }

  const processTreeNodes = (nodes: TreeDataNode[]): TreeDataNode[] =>
    nodes.map((node) => ({
      ...node,
      title: renderTreeNode(node),
      children: node.children ? processTreeNodes(node.children) : [],
    }))

  return (
    <Tree
      treeData={processTreeNodes(treeData)}
      draggable
      blockNode
      onDrop={handleNodeDrop}
      defaultExpandAll
    />
  )
}

export default TreeManager

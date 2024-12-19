import React, {useState, useEffect} from 'react'
import {Tree, Input, ConfigProvider} from 'antd'
import type {TreeDataNode, TreeProps} from 'antd'

import type {DatePickerProps} from 'antd'
import {DatePicker} from 'antd'
import en from 'antd/es/date-picker/locale/en_US'
import dayjs from 'dayjs'

import {getCSSVariable} from '../utils/themeUtils'
import '../../styles.css'
import { Note } from '~/types'


const buddhistLocale: typeof en = {
  ...en,
  lang: {
    ...en.lang,
    fieldDateFormat: 'YYYY-MM-DD',
    fieldDateTimeFormat: 'YYYY-MM-DD HH:mm:ss',
    yearFormat: 'YYYY',
    cellYearFormat: 'YYYY',
  },
}

const TreeManager: React.FC<{
  data: TreeDataNode[];
  onDataUpdate: (updatedData: Note[]) => void;
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
  onTreeUpdate: (updatedData: Note[]) => void;
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

  const updateTreeNodeNextReviewDate = (key: string, formattedDate: string) => {
    const recursivelyUpdate = (nodes: TreeDataNode[]): TreeDataNode[] =>
      nodes.map((node) => {
        if (node.key === key) return {...node, nextReviewDate: formattedDate}
        if (node.children) return {...node, children: recursivelyUpdate(node.children)}
        return node
      })

    return recursivelyUpdate(treeData)
  }

  const beginEditing = (key: number, value: number) => {
    setEditingNode({key, value})
  }

  const finishEditing = () => {
    if (!editingNode) return

    const updatedTreeData = updateTreeNode(editingNode.key, editingNode.value)
    setTreeData(updatedTreeData)
    setEditingNode(null)
    onTreeUpdate(updatedTreeData as Note[])
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
    onTreeUpdate(data as Note[])
  }

  const renderTreeNode = (treeDataNode: TreeDataNode) => {
    const node = treeDataNode as Note;

    const themeDatePicker = {
      colorTextPlaceholder: getCSSVariable('--text-normal', '#fff'),
      colorText: getCSSVariable('--text-normal', '#fff'),
      colorIcon: getCSSVariable('--text-normal', '#fff'),
      colorIconHover: getCSSVariable('--interactive-accent'),
    }

    const openObsidianLink = (link: string) => {
      const app = (window as any).app
      if (app && app.workspace) {
        app.workspace.openLinkText(link, '', false)
      }
    }


    const updateNextReviewDate = (node: Note, formattedDate: string) => {
      const updatedTreeData = updateTreeNodeNextReviewDate(node.key, formattedDate)
      setTreeData(updatedTreeData)
      onTreeUpdate(updatedTreeData as Note[])
    }

    const defaultValue = dayjs('2025-01-01T00:00:00')

    const onClickOpenHandler = () => {
      // TODO: потом релизовать ссылку на конспект
      return openObsidianLink('Поля данных и формат');
    }

    return (
      <span className="content-editable">
        <span
          className="editable-element"
          onDoubleClick={() => beginEditing(node.key as string, node.title as string)}
        >
          {node.title}
        </span>
        <span className="time-link-group">
          <ConfigProvider
            theme={{
              token: themeDatePicker,
            }}
          >
            <DatePicker
              defaultValue={defaultValue}
              showTime
              locale={buddhistLocale}
              onChange={value => {
                const formattedTime = value?.format('YYYY-MM-DDTHH:mm:ss') || '';
                updateNextReviewDate(node, formattedTime);
              }}
            />
          </ConfigProvider>
          <button
            onClick={onClickOpenHandler}
            className="obsidian-link"
          >
            Open
          </button>
        </span>
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

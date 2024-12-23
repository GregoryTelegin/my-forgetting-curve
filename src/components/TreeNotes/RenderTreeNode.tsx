import React, {memo, useRef, useState} from 'react'
import {CheckCircleOutlined, WarningOutlined} from '@ant-design/icons'
import en from 'antd/es/date-picker/locale/en_US'
import {DatePicker, Input} from 'antd'
import dayjs from 'dayjs'

import {Note, Status} from '../types/note'

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

export const RenderTreeNode: React.FC<{
  node: Note;
  onDateChange: (key: string, newDate: string) => void;
  onTitleChange: (key: string, newTitle: string) => void;
}> = memo(({node, onDateChange, onTitleChange}) => {
  const [title, setTitle] = useState(node.title)
  const handleSave = (node: Note, title: string) => {
    setTitle(title)
    onTitleChange(node.key, title)
  }

  const handleDatePickerChange = (date: dayjs.Dayjs | null) => {
    const newDate = date?.format('YYYY-MM-DDTHH:mm:ss') || ''
    onDateChange(node.key, newDate)
  }

  return (
    <span className="content-editable">
      <EditableInput
        value={title}
        node={node}
        onSave={handleSave}
        className="editable-input"
      />
      <span className="time-link-group">
        <DatePicker
          defaultValue={dayjs(node.nextReviewDate)}
          showTime
          locale={buddhistLocale}
          onChange={handleDatePickerChange}
        />
        <StatusIcon status={node.status}/>
      </span>
    </span>
  )
})

const EditableInput: React.FC<{
  value: string;
  node: Note;
  onSave: (node: Note, newValue: string) => void;
}> = ({value, node, onSave}) => {
  const inputRef = useRef<Input>(null)
  const hasSaved = useRef(false)

  const finishEditing = (newValue: string) => {
    if (hasSaved.current) return
    hasSaved.current = true

    onSave(node, newValue)
    inputRef.current?.blur()

    setTimeout(() => {
      hasSaved.current = false
    }, 0)
  }
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      finishEditing((e.target as HTMLInputElement).value)
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    finishEditing(e.target.value)
  }

  return (
    <Input
      ref={inputRef}
      defaultValue={value}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="editable-input"
    />
  )
}

const StatusIcon: React.FC<{ status: Status }> = memo(({status}) => {
  if (status === 'ok') return <CheckCircleOutlined className="allRightIcon"/>
  if (status === 'warning') return <WarningOutlined className="warningIcon"/>
  if (status === 'warningSevere') return <WarningOutlined className="warningSevereIcon"/>
  return null
})

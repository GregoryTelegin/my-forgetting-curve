import React, {useRef} from 'react'
import {Note} from '~/components/types/Note'
import {Input} from 'antd'

const EditableInput: React.FC<{
  value: string;
  node: Note;
  onSave: (node: Note, newValue: string) => void;
  className: string;
}> = ({value, node, onSave, className}) => {
  const inputRef = useRef<Input>(null)
  const hasSaved = useRef(false)

  const finishEditing = (newValue: string) => {
    if (hasSaved.current) return
    hasSaved.current = true

    onSave(node, newValue)
    // inputRef.current?.blur()

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
      className={className}
    />
  )
}

export default EditableInput

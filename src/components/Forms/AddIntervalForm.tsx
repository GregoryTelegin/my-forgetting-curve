import React, {useState} from 'react'
import dayjs from 'dayjs'
import {Note} from '../types/Note'

const CreateCurveForgettingForm: React.FC<{
  _initialNotes: Note[];
  onSaveNotes: (newNote: Note) => void;
}> = ({_initialNotes, onSaveNotes}) => {
  const [inputValue, setInputValue] = useState('')

  const handleAddNote = () => {
    if (inputValue.trim()) {
      const newNote: Note = {
        title: inputValue.trim(),
        key: Date.now().toString(),
        children: [],
        status: 'ok',
        nextReviewDate: dayjs()
      }
      onSaveNotes(newNote)
      setInputValue('')
    }
  }

  return (
    <div className="addNote">
      <input
        className="addNoteInput"
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter note title"
      />
      <button
        className="addNoteButton"
        onClick={handleAddNote}
      >
        Add Note
      </button>
    </div>
  )
}

export default CreateCurveForgettingForm

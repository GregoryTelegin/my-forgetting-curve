import React, {useState} from 'react'
import {Select} from 'antd'
import dayjs from 'dayjs'
import {Note} from '../types/Note'
import {CurveForgetting} from '../types/CurveForgetting'

const {Option} = Select

const AddNoteComponent: React.FC<{
  onSaveNotes: (newNote: Note) => void;
  forgettingCurves: CurveForgetting[]; // Список кривых забывания
}> = ({onSaveNotes, forgettingCurves}) => {
  const [inputValue, setInputValue] = useState('')
  const [selectedCurveId, setSelectedCurveId] = useState<string | null>(null)

  const handleAddNote = () => {
    if (inputValue.trim() && selectedCurveId) {
      const newNote: Note = {
        title: inputValue.trim(),
        key: Date.now().toString(),
        children: [],
        status: 'ok',
        nextReviewDate: dayjs(),
        forgettingCurveId: selectedCurveId,
        reviewDates: [],
        skippedReviewDates: []
      }
      onSaveNotes(newNote)
      setInputValue('')
      setSelectedCurveId(null)
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
      <Select
        placeholder="Select a forgetting curve"
        value={selectedCurveId}
        onChange={(value) => {
          setSelectedCurveId(value)
        }}

      >
        {forgettingCurves.map((curve) => (
          <Option key={curve.key} value={curve.key}>
            {curve.title}
          </Option>
        ))}
      </Select>
      <button
        className="addNoteButton"
        onClick={handleAddNote}
        disabled={!inputValue.trim() || !selectedCurveId}
        style={{width: '20%'}}
      >
        Add Note
      </button>
    </div>
  )
}

export default AddNoteComponent

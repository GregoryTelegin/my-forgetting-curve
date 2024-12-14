import React, {useState} from 'react'
import '../../styles.css'

interface Note {
  title: string;
  key: string;
  children: Note[];
}

const AddNoteComponent: React.FC<{
  initialNotes: Note[];
  onSaveNotes: (newNote: Note) => void;
}> = ({initialNotes, onSaveNotes}) => {
  const [inputValue, setInputValue] = useState('')

  const handleAddNote = () => {
    if (inputValue.trim()) {
      const newNote: Note = {
        title: inputValue.trim(),
        key: Date.now().toString(),
        children: [],
      }
      onSaveNotes(newNote) // Передаём только новый элемент
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

export default AddNoteComponent
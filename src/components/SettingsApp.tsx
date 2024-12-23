import React, { useState } from 'react';
import TreeManager from './TreeNotes/TreeManager';
import AddNoteComponent from './Forms/addNotes'
import {Note} from './types/note'

const SettingsApp: React.FC<{ initialNotes: Note[]; onSave: (notes: Note[]) => void }> = ({
  initialNotes,
  onSave,
}) => {
  const [notes, setNotes] = useState(initialNotes);

  const handleAddNote = (newNote: Note) => {
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    onSave(updatedNotes);
  };

  return (
    <div>
      <AddNoteComponent
        _initialNotes={notes}
        onSaveNotes={handleAddNote}
      />
      <TreeManager
        data={notes}
        onDataUpdate={(updatedNotes) => {
          setNotes(updatedNotes);
          onSave(updatedNotes);
        }}
      />
    </div>
  );
};

export default SettingsApp;

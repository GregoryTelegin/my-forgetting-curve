import React, { useState, useEffect } from 'react';
import TreeManager from './TreeManager';
import AddNoteComponent from './addNotes'
import type { Note } from '~/types';

const ParentComponent: React.FC<{ initialNotes: Note[]; onSave: (notes: Note[]) => void }> = ({
  initialNotes,
  onSave,
}) => {
  const [notes, setNotes] = useState(initialNotes);

  const handleAddNote = (newNote: Note) => {
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    onSave(updatedNotes);
  };

  const onUpdateHandler = (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    onSave(updatedNotes);
  }

  return (
    <div>
      <AddNoteComponent
        initialNotes={notes}
        onSaveNotes={handleAddNote}
      />
      <TreeManager
        data={notes}
        onDataUpdate={onUpdateHandler}
      />
    </div>
  );
};

export default ParentComponent;

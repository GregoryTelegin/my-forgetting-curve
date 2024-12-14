import React, { useState, useEffect } from 'react';
import TreeManager from './TreeManager';
import AddNoteComponent from './addNotes'

interface Note {
  id: number;
  name: string;
  type: 'folder' | 'file';
  children?: Note[];
}

const ParentComponent: React.FC<{ initialNotes: Note[]; onSave: (notes: Note[]) => void }> = ({
  initialNotes,
  onSave,
}) => {
  const [notes, setNotes] = useState(initialNotes);

  // Функция для добавления новой заметки
  const handleAddNote = (newNote: Note) => {
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    onSave(updatedNotes);
  };

  return (
    <div>
      <AddNoteComponent
        initialNotes={notes}
        onSaveNotes={handleAddNote}
      />
      <TreeManager
        data={notes} // Передаём обновлённые заметки
        onDataUpdate={(updatedNotes) => {
          setNotes(updatedNotes); // Сохраняем изменения из ReactView
          onSave(updatedNotes);
        }}
      />
    </div>
  );
};

export default ParentComponent;

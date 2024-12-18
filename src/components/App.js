import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import TreeManager from './TreeManager';
import AddNoteComponent from './addNotes';
const ParentComponent = ({ initialNotes, onSave, }) => {
    const [notes, setNotes] = useState(initialNotes);
    const handleAddNote = (newNote) => {
        const updatedNotes = [...notes, newNote];
        setNotes(updatedNotes);
        onSave(updatedNotes);
    };
    const onUpdateHandler = (updatedNotes) => {
        setNotes(updatedNotes);
        onSave(updatedNotes);
    };
    return (_jsxs("div", { children: [_jsx(AddNoteComponent, { initialNotes: notes, onSaveNotes: handleAddNote }), _jsx(TreeManager, { data: notes, onDataUpdate: onUpdateHandler })] }));
};
export default ParentComponent;

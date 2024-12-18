import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import '../../styles.css';
const AddNoteComponent = ({ initialNotes, onSaveNotes }) => {
    const [inputValue, setInputValue] = useState('');
    const handleAddNote = () => {
        if (inputValue.trim()) {
            const newNote = {
                title: inputValue.trim(),
                key: Date.now().toString(),
                children: [],
            };
            onSaveNotes(newNote); // Передаём только новый элемент
            setInputValue('');
        }
    };
    return (_jsxs("div", { className: "addNote", children: [_jsx("input", { className: "addNoteInput", type: "text", value: inputValue, onChange: (e) => setInputValue(e.target.value), placeholder: "Enter note title" }), _jsx("button", { className: "addNoteButton", onClick: handleAddNote, children: "Add Note" })] }));
};
export default AddNoteComponent;

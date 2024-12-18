import { jsx as _jsx } from "react/jsx-runtime";
import { Input } from 'antd';
const NodeEditor = ({ value, onChange, onSave }) => {
    return (_jsx(Input, { value: value, onChange: (e) => onChange(e.target.value), onBlur: onSave, onPressEnter: onSave, autoFocus: true, className: "editable-input" }));
};
export default NodeEditor;

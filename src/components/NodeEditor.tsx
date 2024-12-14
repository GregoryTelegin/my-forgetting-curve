import React from 'react';
import { Input } from 'antd';

interface NodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
}

const NodeEditor: React.FC<NodeEditorProps> = ({ value, onChange, onSave }) => {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onSave}
      onPressEnter={onSave}
      autoFocus
      className="editable-input"
    />
  );
};

export default NodeEditor;
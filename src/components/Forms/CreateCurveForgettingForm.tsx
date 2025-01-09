import React, {useState} from 'react'
import {CurveForgetting} from '~/components/types/CurveForgetting'

const CreateCurveForgettingForm: React.FC<{
  onSaveForgettingCurves: (curveForgetting: CurveForgetting) => void;
}> = ({onSaveForgettingCurves}) => {
  const [inputValue, setInputValue] = useState('')

  const handleAddNote = () => {
    if (inputValue.trim()) {
      const newCurveForgetting: CurveForgetting = {
        id: Date.now().toString(),
        title: inputValue.trim(),
        key: Date.now().toString(),
        intervals: []
      }

      onSaveForgettingCurves(newCurveForgetting)
      setInputValue('')
    }
  }

  return (
    <div className="addCurveForgetting">
      <input
        className="addCurveForgettingInput"
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter note title"
      />
      <button
        className="addCurveForgettingButton"
        onClick={handleAddNote}
      >
        Add Curve Forgetting
      </button>
    </div>
  )
}

export default CreateCurveForgettingForm

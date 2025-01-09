import React, {useState} from 'react'
import TreeManager from './TreeNotes/TreeManager'
import AddNoteComponent from './Forms/AddNotes'
import {Note} from './types/Note'
import {CurveForgetting} from './types/CurveForgetting'
import CreateCurveForgettingForm from '~/components/Forms/CreateCurveForgettingForm'
import ForgettingCurves from '~/components/ForgettingCurves'
import {getCSSVariable} from '~/utils/themeUtils'
import {ConfigProvider} from 'antd'

const SettingsApp: React.FC<{
  app: any;
  initialNotes: Note[];
  initialCurveForgetting: CurveForgetting[];
  onSaveNoteHandler: (notes: Note[]) => void;
  onSaveCurveForgettingHandler: (forgettingCurves: CurveForgetting[]) => void
}> = ({
  app,
  initialNotes,
  initialCurveForgetting,
  onSaveNoteHandler,
  onSaveCurveForgettingHandler,
}) => {
  const [notes, setNotes] = useState(initialNotes)
  const [forgettingCurves, setForgettingCurves] = useState(initialCurveForgetting)

  const handleAddCurveForgetting = (newForgettingCurve: CurveForgetting) => {
    const updatedForgettingCurves = [...forgettingCurves, newForgettingCurve]
    setForgettingCurves(updatedForgettingCurves)
    onSaveCurveForgettingHandler(updatedForgettingCurves)
  }

  const handleCurveForgettingUpdate = (updatedForgettingCurves: CurveForgetting[]) => {
    setForgettingCurves(updatedForgettingCurves)
    onSaveCurveForgettingHandler(updatedForgettingCurves)
  }

  const handleAddNote = (newNote: Note) => {
    const updatedNotes = [...notes, newNote]
    setNotes(updatedNotes)
    onSaveNoteHandler(updatedNotes)
  }

  const handleDataUpdate = (updatedNotes: Note[]) => {
    setNotes(updatedNotes)
    onSaveNoteHandler(updatedNotes)
  }

  const theme = {
    colorPrimary: getCSSVariable('--interactive-accent'),
    colorText: getCSSVariable('--text-normal'),
    colorBgContainer: getCSSVariable('--interactive-accent'),
    borderRadius: 8,
  }

  return (
    <ConfigProvider theme={{token: theme}}>
      <CreateCurveForgettingForm onSaveForgettingCurves={handleAddCurveForgetting}/>
      <ForgettingCurves initialForgettingCurves={forgettingCurves} onDataUpdate={handleCurveForgettingUpdate}/>
      <AddNoteComponent onSaveNotes={handleAddNote} forgettingCurves={forgettingCurves}/>
      <TreeManager data={notes} onDataUpdate={handleDataUpdate} app={app} forgettingCurves={forgettingCurves}/>
    </ConfigProvider>
  )
}

export default SettingsApp

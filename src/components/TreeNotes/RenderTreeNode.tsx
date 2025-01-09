import React, {memo, useState, useEffect} from 'react'
import en from 'antd/es/date-picker/locale/en_US'
import {DatePicker, Select} from 'antd'
import dayjs from 'dayjs'
import StatusIcon from '~/components/StatusIcon'
import {Note} from '../types/Note'
import EditableInput from '~/components/EditableInput'
import {LinkOutlined, CheckOutlined, DoubleRightOutlined, DeleteOutlined} from '@ant-design/icons'
import LinkNote from '~/components/LinkNote'
import forgettingCurves from '~/components/ForgettingCurves'
import {CurveForgetting} from '~/components/types/CurveForgetting'

const buddhistLocale: typeof en = {
  ...en,
  lang: {
    ...en.lang,
    fieldDateFormat: 'YYYY-MM-DD',
    fieldDateTimeFormat: 'YYYY-MM-DD HH:mm:ss',
    yearFormat: 'YYYY',
    cellYearFormat: 'YYYY',
  },
}

export const RenderTreeNode: React.FC<{
  app: any;
  node: Note;
  onDateChange: (key: string, newDate: string) => void;
  onTitleChange: (key: string, newTitle: string) => void;
  onLinkNoteChange: (key: string, newLinkNote: string) => void;
  forgettingCurves: CurveForgetting[];
  onCurveForgettingChange: (key: string, curveForgetting: string) => void;
  onCurveForgettingLastActiveIntervalChange: (key: string, lastActiveInterval: string) => void;
  onReviewDatesChange: (
    key: string,
    nextReviewDate: dayjs.Dayjs,
    newReviewDates: dayjs.Dayjs[],
    newLastActiveInterval: number,
  ) => void;
  onSkippedReviewDatesChange: (
    key: string,
    newSkippedReviewDates: dayjs.Dayjs[],
  ) => void;
  onDeleteNote: (key: string) => void;
}> = memo(({
  app,
  node,
  onDateChange,
  onTitleChange,
  onLinkNoteChange,
  forgettingCurves,
  onCurveForgettingChange,
  onCurveForgettingLastActiveIntervalChange,
  onReviewDatesChange,
  onSkippedReviewDatesChange,
  onDeleteNote
}) => {
  const [title, setTitle] = useState(node.title)
  const [linkNote, setLinkNote] = useState(node.linkNote)
  const [currentCurveId, setCurrentCurveId] = useState(node.forgettingCurveId)
  const [lastActiveIntervalState, setLastActiveIntervalState] = useState(
    node.lastActiveInterval || 1,
  )

  useEffect(() => {
    const activeCurve = forgettingCurves.find((curve) => curve.id === currentCurveId)
    if (activeCurve) {
      setLastActiveIntervalState(1)
    }
  }, [currentCurveId, forgettingCurves])

  const handleSaveTitle = (node: Note, title: string) => {
    setTitle(title)
    onTitleChange(node.key, title)
  }

  const handleSaveLinkNote = (node: Note, link: string) => {
    setLinkNote(link)
    onLinkNoteChange(node.key, link)
  }

  const handleDatePickerChange = (date: dayjs.Dayjs | null) => {
    const newDate = date?.format('YYYY-MM-DDTHH:mm:ss') || ''
    onDateChange(node.key, newDate)
  }

  const handleCurveForgettingChange = (curveForgettingId: string) => {
    if (curveForgettingId === currentCurveId) return

    const newCurve = forgettingCurves.find((curve) => curve.id === curveForgettingId)
    if (!newCurve) {
      console.error('Selected forgetting curve not found!')
      return
    }

    setCurrentCurveId(curveForgettingId)
    setLastActiveIntervalState(1)
    onCurveForgettingChange(node.key, curveForgettingId)
    onCurveForgettingLastActiveIntervalChange(node.key, 1)
  }

  const handleCurveForgettingLastActiveIntervalChange = (interval: number) => {
    setLastActiveIntervalState(interval)
    onCurveForgettingLastActiveIntervalChange(node.key, interval)
  }

  const handleDone = () => {
    const currentDate = dayjs()

    const newReviewDates = node.reviewDates && Array.isArray(node.reviewDates)
      ? [...node.reviewDates]
      : []

    if (!node.nextReviewDate) {
      node.nextReviewDate = currentDate
    }
    newReviewDates.push(node.nextReviewDate)

    const activeForgettingCurve = forgettingCurves.find(
      (curve) => curve.id === currentCurveId,
    )

    if (!activeForgettingCurve) {
      console.error('Active forgetting curve not found!')
      return
    }

    const activeInterval =
      activeForgettingCurve.intervals[lastActiveIntervalState - 1]
    if (!activeInterval) {
      console.error('Active interval not found in the forgetting curve!')
      return
    }

    const durationInSeconds = activeInterval.value
    const nextReviewDate = currentDate.add(durationInSeconds, 'second')

    let newLastActiveInterval = lastActiveIntervalState || 0
    if (
      lastActiveIntervalState &&
      lastActiveIntervalState < activeForgettingCurve.intervals.length
    ) {
      newLastActiveInterval++
    }

    setLastActiveIntervalState(newLastActiveInterval)

    onReviewDatesChange(
      node.key,
      nextReviewDate,
      newReviewDates,
      newLastActiveInterval,
    )
  }

  const handleSkip = () => {
    const currentDate = dayjs()

    const newSkippedReviewDates = node.skippedReviewDates && Array.isArray(node.skippedReviewDates)
      ? [...node.skippedReviewDates]
      : []

    newSkippedReviewDates.push(currentDate)
    onSkippedReviewDatesChange(node.key, newSkippedReviewDates)
  }

  const handleDelete = () => {
    onDeleteNote(node.key);
  };

  return (
    <span className="content-editable">
      <span className="firstPart">
        <EditableInput
          value={title}
          node={node}
          onSave={handleSaveTitle}
          className="editable-input"
        />
        <LinkNote
          app={app}
          linkNote={linkNote}
          onSave={handleSaveLinkNote}
          node={node}
          className="linkNoteComponent"
        />
        <span className="checkOutlinedSpan" onClick={handleDone}>
          <CheckOutlined className="checkOutlinedIcon"/>
        </span>
      </span>
      <span className="secondPart">
        <span className="datePickerSelectGroup">
          <span className="nextReviewDateSpan">
            <DatePicker
              defaultValue={dayjs(node.nextReviewDate)}
              showTime
              locale={buddhistLocale}
              onChange={handleDatePickerChange}
              className="datePicker"
            />
          </span>
          <Select
            value={lastActiveIntervalState}
            onChange={handleCurveForgettingLastActiveIntervalChange}
            style={{width: '20%'}}
            options={[
              ...forgettingCurves
                .find((curve) => curve.id === currentCurveId)
                ?.intervals.map((_, index) => ({
                  value: index + 1,
                  label: index + 1,
                })) || [],
            ]}
          />
          <Select
            value={currentCurveId}
            onChange={handleCurveForgettingChange}
            style={{width: '40%'}}
            options={forgettingCurves.map((curve) => ({
              value: curve.id,
              label: curve.title,
            }))}
          />
        </span>
        <span className="statusSkipSpan">
          <span className="statusSpan">
            <StatusIcon status={node.status}/>
          </span>
          <span className="doubleRightOutlinedSpan" onClick={handleSkip}>
            <DoubleRightOutlined className="doubleRightOutlinedIcon"/>
          </span>
        </span>
        <span className="deleteButtonSpan" onClick={handleDelete}>
          <DeleteOutlined className="deleteButtonIcon" />
        </span>
      </span>
    </span>
  )
})




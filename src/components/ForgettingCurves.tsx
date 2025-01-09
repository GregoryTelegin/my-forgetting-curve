import React, {useState} from 'react'
import {Collapse, List, InputNumber, Select, Button, Input} from 'antd'
import {HolderOutlined, DeleteOutlined} from '@ant-design/icons'
import {CurveForgetting, Interval} from '~/components/types/CurveForgetting'

const {Option} = Select

const DraggableList: React.FC<{
  intervals: Interval[];
  onUpdate: (updatedIntervals: Interval[]) => void;
}> = ({ intervals, onUpdate }) => {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);

    if (dragIndex === dropIndex) return;

    const updatedIntervals = [...intervals];
    const [removed] = updatedIntervals.splice(dragIndex, 1);
    updatedIntervals.splice(dropIndex, 0, removed);

    setDragOverIndex(null); // Сбрасываем состояние
    onUpdate(updatedIntervals);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null); // Сбрасываем состояние при выходе курсора
  };

  const handleDragEnd = () => {
    setDragOverIndex(null); // Гарантированный сброс состояния после завершения перетаскивания
  };

  const convertValue = (value: number, format: 'seconds' | 'minutes' | 'hours' | 'days') => {
    switch (format) {
    case 'minutes':
      return value / 60
    case 'hours':
      return value / 3600
    case 'days':
      return value / 86400
    default:
      return value
    }
  }

  const toSeconds = (value: number, format: 'seconds' | 'minutes' | 'hours' | 'days') => {
    switch (format) {
    case 'minutes':
      return value * 60
    case 'hours':
      return value * 3600
    case 'days':
      return value * 86400
    default:
      return value
    }
  }

  const handleValueChange = (key: string, newValue: number | null) => {
    const updatedIntervals = intervals.map((interval) =>
      interval.key === key
        ? {...interval, value: newValue === null ? 0 : Math.max(newValue, 0)}
        : interval,
    )
    onUpdate(updatedIntervals)
  }

  return (
    <>
      <List
        dataSource={intervals}
        renderItem={(item, index) => (
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragLeave={handleDragLeave}
            onDragEnd={handleDragEnd} // Сбрасываем состояние при завершении перетаскивания
            className="draggableItem"
            style={{
              borderBottom: dragOverIndex === index ? "1px solid #1890ff" : "none",
            }}
          >
            <List.Item>
              <HolderOutlined style={{ marginRight: 8, width: '5%' }} />
              <InputNumber
                min={0}
                value={convertValue(item.value, item.format)}
                onChange={(value) => {
                  handleValueChange(item.key, toSeconds(value || 0, item.format))
                }}
                style={{ marginRight: 16,  width: '30%'}}
              />
              <Select
                value={item.format}
                onChange={(value) =>
                  onUpdate(
                    intervals.map((interval) =>
                      interval.key === item.key
                        ? { ...interval, format: value }
                        : interval
                    )
                  )
                }
                style={{ width: '40%', marginRight: 16 }}
              >
                <Option value="seconds">Seconds</Option>
                <Option value="minutes">Minutes</Option>
                <Option value="hours">Hours</Option>
                <Option value="days">Days</Option>
              </Select>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() =>
                  onUpdate(intervals.filter((interval) => interval.key !== item.key))
                }
              />
            </List.Item>
          </div>
        )}
      />
      <Button type="dashed" onClick={() => onUpdate([...intervals, { key: `${Date.now()}`, value: 0, format: "seconds" }])} block style={{ marginTop: 16 }}>
        Add Interval
      </Button>
    </>
  );
};
const ForgettingCurves: React.FC<{
  initialForgettingCurves: CurveForgetting[];
  onDataUpdate: (forgettingCurves: CurveForgetting[]) => void;
}> = ({initialForgettingCurves, onDataUpdate}) => {
  const handleIntervalsUpdate = (curveKey: string, updatedIntervals: Interval[]) => {
    const updatedCurves = initialForgettingCurves.map((curve) =>
      curve.key === curveKey ? {...curve, intervals: updatedIntervals} : curve,
    )
    onDataUpdate(updatedCurves)
  }

  const handleDeleteCurve = (curveKey: string) => {
    const updatedCurves = initialForgettingCurves.filter((curve) => curve.key !== curveKey)
    onDataUpdate(updatedCurves)
  }

  const handleTitleChange = (curveKey: string, newTitle: string) => {
    const updatedCurves = initialForgettingCurves.map((curve) =>
      curve.key === curveKey ? {...curve, title: newTitle} : curve,
    )
    onDataUpdate(updatedCurves)
  }

  const items = initialForgettingCurves.map((curve) => ({
    key: curve.key,
    label: (
      <span className="curveItem">
        <Input
          defaultValue={curve.title}
          onBlur={(e) => handleTitleChange(curve.key, e.target.value)}
          style={{width: '90%'}}
        />
        <Button
          type="text"
          danger
          icon={<DeleteOutlined/>}
          onClick={() => handleDeleteCurve(curve.key)}
        />
      </span>
    ),
    children: (
      <DraggableList
        intervals={curve.intervals}
        onUpdate={(updatedIntervals) => handleIntervalsUpdate(curve.key, updatedIntervals)}
      />
    ),
  }))

  return <Collapse items={items}/>
}

export default ForgettingCurves

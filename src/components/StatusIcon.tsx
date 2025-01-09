import React, {memo} from 'react'
import {Status} from '~/components/types/Note'
import {CheckCircleOutlined, WarningOutlined} from '@ant-design/icons'

const StatusIcon: React.FC<{ status: Status }> = memo(({status}) => {
  if (status === 'ok') return <CheckCircleOutlined className="allRightIcon"/>
  if (status === 'warning') return <WarningOutlined className="warningIcon"/>
  if (status === 'warningSevere') return <WarningOutlined className="warningSevereIcon"/>
  return null
})

export default StatusIcon

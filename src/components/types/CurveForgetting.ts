export interface CurveForgetting {
  id: string
  title: string
  key: string
  intervals: Interval[]
}

export interface Interval {
  key: string
  value: number
  format: 'seconds' | 'minutes' | 'hours' | 'days'
}

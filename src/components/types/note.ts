import {JSX} from 'react'
import dayjs from 'dayjs'

export interface Note {
  id?: number;
  title: Title
  type?: Type;
  key: string,
  nextReviewDate: NextReviewDate,
  children?: Note[];
  status: Status
}

export type Title = JSX.Element | string;

export type NextReviewDate = dayjs.Dayjs | string

export type Status = 'ok' | 'warning' | 'warningSevere'

export type Type = 'folder' | 'file'

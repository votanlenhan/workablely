"use client"

import React, { forwardRef } from 'react'
import DatePicker from 'react-datepicker'
import { Calendar } from 'lucide-react'
import { Input } from './input'
import { Button } from './button'
import "react-datepicker/dist/react-datepicker.css"

interface DatePickerInputProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  onClick?: (e: React.MouseEvent) => void
}

const CustomInput = forwardRef<HTMLInputElement, DatePickerInputProps>(
  ({ value, onChange, placeholder, className, onClick, ...props }, ref) => (
    <div className="relative flex items-center w-full">
      <Input
        ref={ref}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={`${className} pr-8`}
        onClick={onClick}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-1 h-5 w-5 p-0 hover:bg-transparent"
        onClick={onClick}
      >
        <Calendar className="h-3 w-3 text-muted-foreground" />
      </Button>
    </div>
  )
)

CustomInput.displayName = "CustomInput"

interface DatePickerProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  onClick?: (e: React.MouseEvent) => void
}

export function DatePickerInput({ value, onChange, placeholder, className, onClick }: DatePickerProps) {
  const handleDateChange = (date: Date | null) => {
    if (date) {
      const formattedDate = date.toISOString().split('T')[0]
      onChange?.(formattedDate)
    }
  }

  const selectedDate = value ? new Date(value) : null

  return (
    <DatePicker
      selected={selectedDate}
      onChange={handleDateChange}
      dateFormat="dd/MM/yyyy"
      placeholderText={placeholder}
      customInput={
        <CustomInput
          value={value ? new Date(value).toLocaleDateString('vi-VN') : ''}
          onChange={(val) => {
            // Allow manual typing
            if (val.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
              const [day, month, year] = val.split('/')
              const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
              if (!isNaN(date.getTime())) {
                onChange?.(date.toISOString().split('T')[0])
              }
            }
          }}
          placeholder={placeholder}
          className={className}
          onClick={onClick}
        />
      }
      showPopperArrow={false}
      popperClassName="z-[9999]"
      popperPlacement="bottom-start"
      calendarClassName="bg-background border border-border rounded-lg shadow-lg"
      withPortal
      portalId="date-picker-portal"
    />
  )
} 
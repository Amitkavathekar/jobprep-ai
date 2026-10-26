"use client"

import * as React from "react"
import {
  addDays,
  format,
  isValid,
  parse,
  startOfDay,
} from "date-fns"
import { CalendarIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"

import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type DatePickerProps = {
  variant?: "single" | "range"
  label?: string
  className?: string
}

const DATE_FORMAT = "MMM dd, yyyy"

function formatDate(date: Date | undefined) {
  return date ? format(date, "MMMM dd, yyyy") : ""
}

function parseDate(value: string): Date | undefined {
  if (!value.trim()) return undefined

  const parsed = parse(value.trim(), DATE_FORMAT, new Date())

  if (
    !isValid(parsed) ||
    format(parsed, DATE_FORMAT) !== value.trim()
  ) {
    return undefined
  }

  return startOfDay(parsed)
}

export function DatePicker({
  variant = "single",
  label,
  className,
}: DatePickerProps) {
  return variant === "range" ? (
    <DatePickerWithRange label={label} className={className} />
  ) : (
    <DatePickerInput label={label} className={className} />
  )
}

function DatePickerInput({
  label = "Subscription Date",
  className,
}: Omit<DatePickerProps, "variant">) {
  const initialDate = new Date("2025-06-01T12:00:00")
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(initialDate)
  const [month, setMonth] = React.useState<Date>(initialDate)
  const [value, setValue] = React.useState(formatDate(initialDate))

  return (
    <Field className={className ?? "w-48"}>
      <FieldLabel htmlFor="date-required">{label}</FieldLabel>

      <InputGroup>
        <InputGroupInput
          id="date-required"
          value={value}
          placeholder="June 01, 2025"
          onChange={(event) => {
            const inputValue = event.target.value
            setValue(inputValue)

            const parsedDate = parseDate(inputValue)
            setDate(parsedDate)

            if (parsedDate) setMonth(parsedDate)
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault()
              setOpen(true)
            }
          }}
        />

        <InputGroupAddon align="inline-end">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={
                <InputGroupButton
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Select date"
                >
                  <CalendarIcon />
                  <span className="sr-only">Select date</span>
                </InputGroupButton>
              }
            />

            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="end"
              alignOffset={-8}
              sideOffset={10}
            >
              <Calendar
                mode="single"
                selected={date}
                month={month}
                onMonthChange={setMonth}
                onSelect={(selectedDate) => {
                  setDate(selectedDate)
                  setValue(formatDate(selectedDate))
                  setOpen(false)
                }}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  )
}

function DatePickerWithRange({
  label = "Date Picker Range",
  className,
}: Omit<DatePickerProps, "variant">) {
  const initialFrom = new Date(
    new Date().getFullYear(),
    0,
    20,
    12
  )

  const initialRange: DateRange = {
    from: initialFrom,
    to: addDays(initialFrom, 20),
  }

  const [date, setDate] = React.useState<DateRange | undefined>(
    initialRange
  )

  const [fromValue, setFromValue] = React.useState(
    formatDate(initialRange.from)
  )

  const [toValue, setToValue] = React.useState(
    formatDate(initialRange.to)
  )

  const [month, setMonth] = React.useState<Date>(initialFrom)
  const [open, setOpen] = React.useState(false)

  const updateStartDate = (value: string) => {
    setFromValue(value)

    const from = parseDate(value)
    const to = parseDate(toValue)

    if (!from) {
      setDate(undefined)
      return
    }

    setMonth(from)

    if (to && from > to) {
      setDate({ from })
      return
    }

    setDate({ from, to })
  }

  const updateEndDate = (value: string) => {
    setToValue(value)

    const from = parseDate(fromValue)
    const to = parseDate(value)

    if (!to) {
      setDate(undefined)
      return
    }

    setMonth(from ?? to)

    if (from && to < from) {
      // Keep the range type valid and clear the conflicting start date.
      setDate({ from: to })
      return
    }

    setDate({ from, to })
  }

  const handleCalendarSelect = (
    range: DateRange | undefined
  ) => {
    setDate(range)
    setFromValue(formatDate(range?.from))
    setToValue(formatDate(range?.to))

    if (range?.from) setMonth(range.from)
  }

  const parsedFrom = parseDate(fromValue)
  const parsedTo = parseDate(toValue)

  const canApply = Boolean(
    parsedFrom &&
    parsedTo &&
    parsedFrom <= parsedTo
  )

  const handleApply = () => {
    if (!parsedFrom || !parsedTo || parsedFrom > parsedTo) {
      return
    }

    setDate({ from: parsedFrom, to: parsedTo })
    setOpen(false)
  }

  return (
    <Field className={className ?? "w-full max-w-md"}>
      <FieldLabel>{label}</FieldLabel>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label
            htmlFor="date-range-start"
            className="text-sm font-medium"
          >
            Start Date
          </label>

          <InputGroup>
            <InputGroupInput
              id="date-range-start"
              value={fromValue}
              placeholder="June 01, 2025"
              onChange={(event) =>
                updateStartDate(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault()
                  setOpen(true)
                }
              }}
              aria-label="Start date"
            />

            <InputGroupAddon align="inline-end">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger
                  render={
                    <InputGroupButton
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Open date range calendar"
                    >
                      <CalendarIcon />
                    </InputGroupButton>
                  }
                />

                <PopoverContent
                  className="w-auto max-w-[calc(100vw-1rem)] p-0"
                  align="start"
                >
                  <Calendar
                    mode="range"
                    selected={date}
                    month={month}
                    onMonthChange={setMonth}
                    onSelect={handleCalendarSelect}
                    numberOfMonths={2}
                  />

                  <div className="flex justify-end border-t p-3">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleApply}
                      disabled={!canApply}
                    >
                      Apply range
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </InputGroupAddon>
          </InputGroup>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="date-range-end"
            className="text-sm font-medium"
          >
            End Date
          </label>

          <InputGroup>
            <InputGroupInput
              id="date-range-end"
              value={toValue}
              placeholder="June 21, 2025"
              onChange={(event) =>
                updateEndDate(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault()
                  setOpen(true)
                }
              }}
              aria-label="End date"
            />

            <InputGroupAddon align="inline-end">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger
                  render={
                    <InputGroupButton
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Open date range calendar"
                    >
                      <CalendarIcon />
                    </InputGroupButton>
                  }
                />

                <PopoverContent
                  className="w-auto max-w-[calc(100vw-1rem)] p-0"
                  align="end"
                >
                  <Calendar
                    mode="range"
                    selected={date}
                    month={month}
                    onMonthChange={setMonth}
                    onSelect={handleCalendarSelect}
                    numberOfMonths={2}
                  />

                  <div className="flex justify-end border-t p-3">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleApply}
                      disabled={!canApply}
                    >
                      Apply range
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Enter dates as MMM dd, yyyy (e.g. Jun 01, 2025).
      </p>
    </Field>
  )
}

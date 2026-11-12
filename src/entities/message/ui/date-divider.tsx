import classes from './date-divider.module.css'

export interface DateDividerProps {
  readonly label: string
}

export function DateDivider({ label }: DateDividerProps) {
  return (
    <div className={classes.divider}>
      <span className={classes.pill}>{label}</span>
    </div>
  )
}

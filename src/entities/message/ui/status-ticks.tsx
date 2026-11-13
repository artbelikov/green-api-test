import type { MessageDeliveryStatus } from '@/shared/api/greenapi'
import classes from './status-ticks.module.css'

export type StatusTicksProps = {
  readonly status: MessageDeliveryStatus
}

const glyphFor = (status: MessageDeliveryStatus): string => {
  switch (status) {
    case 'delivered':
    case 'read':
      return '✓✓'
    case 'failed':
      return '✕'
    default:
      return '✓'
  }
}

export function StatusTicks({ status }: StatusTicksProps) {
  return (
    <span className={classes.tick} data-status={status} aria-hidden="true">
      {glyphFor(status)}
    </span>
  )
}

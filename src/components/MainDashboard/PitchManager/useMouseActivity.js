import { fromEvent } from 'rxjs'
import { map, filter } from 'rxjs/operators'

// Observable to track all mouse clicks
export const mouseClick$ = fromEvent(document, 'click').pipe(
  map(event => {
    const { target } = event
    const tagName = target.tagName.toLowerCase()
    const id = target.id ? `#${target.id}` : ''
    const classes = target.className ? `.${target.className.split(' ').join('.')}` : ''
    return {
      eventType: 'click',
      tagName,
      id,
      classes,
      target
    }
  })
)

// Observable to track mouse movements
export const mouseMove$ = fromEvent(document, 'mousemove').pipe(
  map(event => ({
    eventType: 'mousemove',
    x: event.clientX,
    y: event.clientY
  }))
)

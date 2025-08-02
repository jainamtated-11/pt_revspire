// activityTrackers.js
import { fromEvent, interval, timer } from 'rxjs';
import { map, switchMap, takeUntil, filter } from 'rxjs/operators';

// Observable to track fullscreen changes
export const fullscreenChange$ = fromEvent(document, 'fullscreenchange').pipe(
  map(() => document.fullscreenElement !== null)
);

// Observable to track duration viewing content in fullscreen
export const fullscreenDuration$ = fullscreenChange$.pipe(
  switchMap(isFullscreen =>
    isFullscreen ?
      interval(1000).pipe(takeUntil(fullscreenChange$.pipe(filter(isExit => !isExit)))) :
      timer(0)
  )
);

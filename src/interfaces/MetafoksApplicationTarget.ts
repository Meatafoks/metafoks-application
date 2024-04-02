export interface MetafoksApplicationTargetWithStartFn {
  start: () => Promise<void> | void
}

export interface MetafoksApplicationTargetWithRunFn {
  run: () => Promise<void> | void
}

export interface MetafoksApplicationTargetWithNoFn {}

export type MetafoksApplicationTarget =
  | MetafoksApplicationTargetWithStartFn
  | MetafoksApplicationTargetWithRunFn
  | MetafoksApplicationTargetWithNoFn

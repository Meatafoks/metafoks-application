import { Container } from '@metafoks/context'

export interface MetafoksExtension<TConfig> {
  identifier: string
  install?: (container: typeof Container, config: TConfig) => void
  autorun?: (container: typeof Container, config: TConfig) => void | Promise<void>
  close?: (force: boolean, container: typeof Container, config: TConfig) => void | Promise<void>
}

import { MetafoksApplication, MetafoksApplicationConfiguration } from '../MetafoksApplication'

export interface MetafoksApplicationTestingProps {
  config?: Partial<MetafoksApplicationConfiguration>
  props?: { overrideApplicationConfig: any }
}

export async function startMetafoksTesting(target: any, props?: MetafoksApplicationTestingProps) {
  if (props?.config) MetafoksApplication.configure(props.config)
  await MetafoksApplication.startApplication(props?.props)
}

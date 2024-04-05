import { MetafoksApplication, MetafoksApplicationConfigurationExtra } from '../MetafoksApplication'

export async function startMetafoksTesting(target: any, configuration?: MetafoksApplicationConfigurationExtra) {
  await MetafoksApplication.startApplication(configuration)
}

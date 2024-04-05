export type MetafoksEnvKey = {
  METAFOKS_DISABLE_APP_AUTORUN: string
  METAFOKS_PROFILE?: string
}

export class MetafoksEnv {
  public static get(key: keyof MetafoksEnvKey) {
    return process.env[key]
  }
}

export interface MetafoksExtensionsAutorunConfiguration {
  enabled?: boolean
  exclude?: string[]
}

export interface MetafoksExtensionsLoaderConfiguration {
  enabled?: boolean
  autorun?: MetafoksExtensionsAutorunConfiguration
}

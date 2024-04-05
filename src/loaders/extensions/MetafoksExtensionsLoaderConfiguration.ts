export interface MetafoksExtensionsAutorunConfiguration {
  enabled?: boolean
  exclude?: string[]
}

export interface MetafoksExtensionsInstallConfiguration {
  enabled?: boolean
  exclude?: string[]
}

export interface MetafoksExtensionsCloseConfiguration {
  enabled?: boolean
  exclude?: string[]
}

export interface MetafoksExtensionsLoaderConfiguration {
  enabled?: boolean
  autorun?: MetafoksExtensionsAutorunConfiguration
  install?: MetafoksExtensionsInstallConfiguration
  close?: MetafoksExtensionsCloseConfiguration
  blacklist?: string[]
}

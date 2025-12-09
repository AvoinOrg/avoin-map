import type { TerraDraw } from 'terra-draw'

let activeDrawInstance: TerraDraw | null = null

export const setActiveDrawInstance = (instance: TerraDraw | null) => {
  activeDrawInstance = instance
}

export const getActiveDrawInstance = () => activeDrawInstance

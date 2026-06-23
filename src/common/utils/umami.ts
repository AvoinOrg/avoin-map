type UmamiScriptConfig = {
  src: string
  websiteId: string
}

export const getUmamiScriptConfig = (
  websiteId?: string
): UmamiScriptConfig | null => {
  const src = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL

  if (!src || !websiteId) return null

  return {
    src,
    websiteId,
  }
}

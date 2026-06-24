export const getRequiredBearerAuthHeader = ({
  accessToken,
  requestName,
}: {
  accessToken?: string
  requestName: string
}) => {
  if (!accessToken) {
    throw new Error(`Missing access token for ${requestName}`)
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

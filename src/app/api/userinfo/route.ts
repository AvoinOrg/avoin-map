import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const getDataFromUserInfo = async (token: string) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_ZITADEL_ISSUER}/oidc/v1/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
      }
    )
    return NextResponse.json(response.data) // Axios automatically parses the JSON
  } catch (error) {
    console.error(error)

    return new Response(error instanceof Error ? error.message : String(error), {
      status: 500,
    })
  }
}

const handler = async (req: NextRequest) => {
  const token = await getToken({ req })
  if (typeof token?.accessToken !== 'string') {
    return new Response(null, {
      status: 401,
    })
  }

  switch (req.method) {
    case 'GET':
      return await getDataFromUserInfo(token.accessToken)
    default:
      return new Response(null, {
        status: 405,
      })
  }
}

export { handler as GET }

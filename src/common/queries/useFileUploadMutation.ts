import axios, { AxiosError } from 'axios'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'

interface Args {
  presignedUploadUrl: string
  file: File
}

export const useFileUploadMutation = () => {
  const [progress, setProgress] = useState(0)

  const mutation = useMutation<void, AxiosError, Args>({
    mutationFn: async ({ presignedUploadUrl, file }) => {
      await axios.post(presignedUploadUrl, file, {
        onUploadProgress: (ev) => {
          const total = ev.total ?? file.size
          setProgress(total > 0 ? Math.round((ev.loaded * 100) / total) : 0)
        },
      })
    },
  })

  return { ...mutation, progress }
}

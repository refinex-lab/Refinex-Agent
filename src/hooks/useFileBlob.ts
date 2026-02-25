import { useState, useEffect, useRef } from 'react'
import service from '@/services/request'

interface UseFileBlobResult {
  blob: Blob | null
  loading: boolean
  error: string | null
}

function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

export function useFileBlob(fileUrl: string | undefined): UseFileBlobResult {
  const [blob, setBlob] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cachedUrlRef = useRef<string>(undefined)
  const cachedBlobRef = useRef<Blob | null>(null)

  useEffect(() => {
    if (!fileUrl) {
      setBlob(null)
      setLoading(false)
      setError(null)
      return
    }

    if (fileUrl === cachedUrlRef.current && cachedBlobRef.current) {
      setBlob(cachedBlobRef.current)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    const request = isAbsoluteUrl(fileUrl)
      ? fetch(fileUrl).then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          return r.blob()
        })
      : service
          .get(fileUrl, { responseType: 'blob' })
          .then((res) => (res instanceof Blob ? res : (res as any).data ?? res))

    request
      .then((data: Blob) => {
        if (cancelled) return
        cachedUrlRef.current = fileUrl
        cachedBlobRef.current = data
        setBlob(data)
      })
      .catch((err: any) => {
        if (cancelled) return
        setError(err?.message ?? '文件加载失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [fileUrl])

  return { blob, loading, error }
}

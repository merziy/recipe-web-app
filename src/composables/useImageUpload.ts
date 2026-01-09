import { compressImage } from '@/utils/imageUtils'
import { readonly, ref } from 'vue'

export function useImageUpload() {
  const isUploading = ref(false)
  const uploadError = ref<string | null>(null)

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file) return null
    
    if (!file.type.startsWith('image/')) {
      uploadError.value = 'Please select an image file'
      return null
    }
    
    if (file.size > 10 * 1024 * 1024) {
      uploadError.value = 'Image too large. Please select an image under 10MB'
      return null
    }

    isUploading.value = true
    uploadError.value = null

    try {
      const compressedBase64 = await compressImage(file, 800, 0.8)
      
      const API_BASE = import.meta.env.VITE_API_URL || ''
      const response = await fetch(`${API_BASE}/api/uploads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: compressedBase64 })
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`)
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      uploadError.value = error instanceof Error ? error.message : 'Upload failed'
      return null
    } finally {
      isUploading.value = false
    }
  }

  const clearError = () => {
    uploadError.value = null
  }

  return {
    isUploading: readonly(isUploading),
    uploadError: readonly(uploadError),
    uploadImage,
    clearError
  }
}
import { compressImageToFile } from '@/utils/imageUtils'
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
      const API_BASE = import.meta.env.VITE_API_URL || ''
      
      const sigResponse = await fetch(`${API_BASE}/api/cloudinary-signature`)
      
      if (!sigResponse.ok) {
        throw new Error(`Failed to get upload signature: ${sigResponse.status}`)
      }
      
      const responseText = await sigResponse.text()
      
      let sigData
      try {
        sigData = JSON.parse(responseText)
      } catch (parseError) {
        throw new Error('Invalid response from signature endpoint')
      }
      
      const compressedFile = await compressImageToFile(file, 800, 0.8)
      
      const formData = new FormData()
      formData.append('file', compressedFile)
      formData.append('signature', sigData.signature)
      formData.append('timestamp', sigData.timestamp.toString())
      formData.append('api_key', sigData.apiKey)
      formData.append('folder', sigData.folder)
      
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      )

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`)
      }

      const uploadData = await uploadResponse.json()
      return uploadData.secure_url
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
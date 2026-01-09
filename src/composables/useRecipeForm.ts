import { useImageUpload } from '@/composables/useImageUpload'
import { useRecipesStore } from '@/stores/recipes'
import { readonly, ref } from 'vue'
import { useRouter } from 'vue-router'

export function useRecipeForm() {
  const router = useRouter()
  const store = useRecipesStore()
  const { uploadImage, isUploading } = useImageUpload()

  const isSubmitting = ref(false)
  const submitError = ref<string | null>(null)

  const submitRecipe = async (recipeData: any, imageFile: File | null = null) => {
    isSubmitting.value = true
    submitError.value = null

    try {
      let imageUrl = recipeData.image

      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
        if (!imageUrl) {
          throw new Error('Image upload failed')
        }
      }

      const recipe = { ...recipeData, image: imageUrl }
      const result = await store.add(recipe)
      
      if (result?.handle) {
        router.push(`/article/${result.handle}`)
      } else {
        router.push('/')
      }
      
      return true
    } catch (error) {
      submitError.value = error instanceof Error ? error.message : 'Failed to save recipe'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  const updateRecipe = async (handle: string, recipeData: any, imageFile: File | null = null) => {
    isSubmitting.value = true
    submitError.value = null

    try {
      let imageUrl = recipeData.image

      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
        if (!imageUrl) {
          throw new Error('Image upload failed')
        }
      }

      const updatedRecipe = { ...recipeData, image: imageUrl }
      const success = await store.update(handle, updatedRecipe)
      
      if (success) {
        router.push(`/article/${handle}`)
      } else {
        throw new Error('Failed to update recipe')
      }
      
      return true
    } catch (error) {
      submitError.value = error instanceof Error ? error.message : 'Failed to update recipe'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    isSubmitting: readonly(isSubmitting),
    isUploading,
    submitError: readonly(submitError),
    submitRecipe,
    updateRecipe
  }
}
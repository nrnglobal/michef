'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Languages, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { useI18n } from '@/lib/i18n/config'
import type { Recipe, Ingredient } from '@/lib/types'
import { toast } from 'sonner'

async function resizeImageToLimit(file: File, maxBytes = 5 * 1024 * 1024): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      let { width, height } = img
      const scale = Math.sqrt(maxBytes / file.size)
      if (scale < 1) {
        width = Math.floor(width * scale)
        height = Math.floor(height * scale)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.85)
    }
    img.src = url
  })
}

const CATEGORIES = [
  'beef',
  'chicken',
  'seafood',
  'veggies',
  'snacks',
  'carbs',
  'soups',
  'salads',
  'other',
]

const UNITS = ['g', 'kg', 'ml', 'L', 'cup', 'tbsp', 'tsp', 'piece', 'slice', 'bunch', 'can', 'pkg']

interface RecipeFormProps {
  recipe?: Recipe
}

const emptyIngredient = (): Ingredient => ({
  name_en: '',
  name_es: '',
  quantity: '',
  unit: '',
  category: '',
})

export function RecipeForm({ recipe }: RecipeFormProps) {
  const router = useRouter()
  const { t } = useI18n()

  const [titleEn, setTitleEn] = useState(recipe?.title_en ?? '')
  const [titleEs, setTitleEs] = useState(recipe?.title_es ?? '')
  const [descEn, setDescEn] = useState(recipe?.description_en ?? '')
  const [descEs, setDescEs] = useState(recipe?.description_es ?? '')
  const [category, setCategory] = useState(recipe?.category ?? '')
  const [proteinType, setProteinType] = useState(recipe?.protein_type ?? '')
  const [prepTime, setPrepTime] = useState(String(recipe?.prep_time_minutes ?? ''))
  const [servings, setServings] = useState(String(recipe?.servings ?? '2'))
  const [youtubeUrl, setYoutubeUrl] = useState(recipe?.youtube_url ?? '')
  const [imageUrl, setImageUrl] = useState(recipe?.image_url ?? '')
  const [tags, setTags] = useState((recipe?.tags ?? []).join(', '))
  const [instructionsEn, setInstructionsEn] = useState(recipe?.instructions_en ?? '')
  const [instructionsEs, setInstructionsEs] = useState(recipe?.instructions_es ?? '')
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe?.ingredients?.length ? recipe.ingredients : [emptyIngredient()]
  )
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>(recipe?.image_url ?? '')
  const [uploadPathKey] = useState(() => crypto.randomUUID())

  function addIngredient() {
    setIngredients((prev) => [...prev, emptyIngredient()])
  }

  function removeIngredient(index: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== index))
  }

  function updateIngredient(index: number, field: keyof Ingredient, value: string) {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing))
    )
  }

  async function handleImageUpload(file: File) {
    setUploading(true)
    try {
      const resized = await resizeImageToLimit(file)
      const supabase = createClient()
      const path = `recipe-images/${uploadPathKey}/${Date.now()}.jpg`
      const { data, error } = await supabase.storage
        .from('receipts')
        .upload(path, resized, { contentType: 'image/jpeg', upsert: true })
      if (error) {
        toast.error('Image upload failed. Try again or skip the image.')
        return
      }
      const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(data.path)
      const publicUrl = urlData.publicUrl
      setImageUrl(publicUrl)
      setImagePreview(publicUrl)
    } catch {
      toast.error('Image upload failed. Try again or skip the image.')
    } finally {
      setUploading(false)
    }
  }

  async function handleAutoTranslate() {
    if (!titleEn.trim()) {
      toast.error('Add an English title before translating')
      return
    }
    setTranslating(true)

    // Send all ingredients for translation (all positions, preserving indices)
    const ingredientsForApi = ingredients.map((ing) => ({ name_en: ing.name_en }))

    try {
      const res = await fetch('/api/ai/translate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title_en: titleEn.trim(),
          description_en: descEn.trim(),
          ingredients: ingredientsForApi,
          instructions_en: instructionsEn.trim(),
        }),
      })

      if (!res.ok) {
        toast.error(t('recipeForm.translateError'))
        return
      }

      const translated = await res.json()
      console.log('[RecipeForm] translate response:', JSON.stringify(translated))

      // Always overwrite _es fields — user explicitly clicked translate.
      // Use typeof checks so we assign any non-undefined string (including empty).
      if (typeof translated.title_es === 'string') setTitleEs(translated.title_es)
      if (typeof translated.description_es === 'string') setDescEs(translated.description_es)
      if (typeof translated.instructions_es === 'string') setInstructionsEs(translated.instructions_es)

      // Overwrite all ingredient name_es fields
      if (Array.isArray(translated.ingredient_names_es)) {
        setIngredients((prev) =>
          prev.map((ing, idx) => {
            const translatedName = translated.ingredient_names_es[idx]
            if (typeof translatedName === 'string') {
              return { ...ing, name_es: translatedName }
            }
            return ing
          })
        )
      }

      toast.success(t('recipeForm.translateSuccess'))
    } catch {
      toast.error(t('recipeForm.translateError'))
    } finally {
      setTranslating(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const supabase = createClient()

    const payload = {
      title_en: titleEn.trim(),
      title_es: titleEs.trim(),
      description_en: descEn.trim() || null,
      description_es: descEs.trim() || null,
      category,
      protein_type: proteinType.trim() || null,
      prep_time_minutes: prepTime ? parseInt(prepTime, 10) : null,
      servings: servings ? parseInt(servings, 10) : 2,
      youtube_url: youtubeUrl.trim() || null,
      image_url: imageUrl.trim() || null,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      ingredients: ingredients.filter((ing) => ing.name_en.trim()),
      instructions_en: instructionsEn.trim() || null,
      instructions_es: instructionsEs.trim() || null,
      is_active: recipe?.is_active ?? true,
    }

    let error
    if (recipe?.id) {
      const result = await supabase
        .from('recipes')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', recipe.id)
      error = result.error
    } else {
      const result = await supabase.from('recipes').insert(payload)
      error = result.error
    }

    if (error) {
      toast.error(t('recipeForm.saveError'))
      setSaving(false)
      return
    }

    toast.success(t('recipeForm.saveSuccess'))
    router.push('/recipes')
    router.refresh()
  }

  const inputStyle = { borderColor: 'var(--casa-border)' }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {/* Titles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label style={{ color: 'var(--casa-text)' }}>{t('recipeForm.titleEn')}</Label>
          <Input
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            required
            disabled={saving}
            style={inputStyle}
          />
        </div>
        <div className="space-y-1.5">
          <Label style={{ color: 'var(--casa-text)' }}>{t('recipeForm.titleEs')}</Label>
          <Input
            value={titleEs}
            onChange={(e) => setTitleEs(e.target.value)}
            required
            disabled={saving}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label style={{ color: 'var(--casa-text)' }}>{t('recipeForm.descriptionEn')}</Label>
          <Textarea
            value={descEn}
            onChange={(e) => setDescEn(e.target.value)}
            rows={3}
            disabled={saving}
            style={inputStyle}
          />
        </div>
        <div className="space-y-1.5">
          <Label style={{ color: 'var(--casa-text)' }}>{t('recipeForm.descriptionEs')}</Label>
          <Textarea
            value={descEs}
            onChange={(e) => setDescEs(e.target.value)}
            rows={3}
            disabled={saving}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Category, protein, prep time, servings */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <Label style={{ color: 'var(--casa-text)' }}>{t('recipeForm.category')}</Label>
          <Select value={category} onValueChange={(v) => setCategory(v ?? '')} disabled={saving}>
            <SelectTrigger style={inputStyle}>
              <SelectValue placeholder={t('recipeForm.selectCategory')} />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {t(`recipes.categories.${cat}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label style={{ color: 'var(--casa-text)' }}>{t('recipeForm.proteinType')}</Label>
          <Input
            value={proteinType}
            onChange={(e) => setProteinType(e.target.value)}
            placeholder={t('recipeForm.proteinPlaceholder')}
            disabled={saving}
            style={inputStyle}
          />
        </div>

        <div className="space-y-1.5">
          <Label style={{ color: 'var(--casa-text)' }}>{t('recipeForm.prepTime')}</Label>
          <Input
            type="number"
            min="1"
            value={prepTime}
            onChange={(e) => setPrepTime(e.target.value)}
            disabled={saving}
            style={inputStyle}
          />
        </div>

        <div className="space-y-1.5">
          <Label style={{ color: 'var(--casa-text)' }}>{t('recipeForm.servings')}</Label>
          <Input
            type="number"
            min="1"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            disabled={saving}
            style={inputStyle}
          />
        </div>
      </div>

      {/* YouTube and Tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label style={{ color: 'var(--casa-text)' }}>{t('recipeForm.youtubeUrl')}</Label>
          <Input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder={t('recipeForm.youtubePlaceholder')}
            disabled={saving}
            style={inputStyle}
          />
        </div>
        <div className="space-y-1.5">
          <Label style={{ color: 'var(--casa-text)' }}>{t('recipeForm.tags')}</Label>
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder={t('recipeForm.tagsPlaceholder')}
            disabled={saving}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Recipe Photo */}
      <div className="space-y-1.5">
        <Label style={{ color: 'var(--casa-text)' }}>Recipe Photo</Label>
        {imagePreview ? (
          <div className="flex items-start gap-3">
            <img
              src={imagePreview}
              alt="Recipe"
              className="rounded-lg object-cover"
              style={{ width: '160px', height: '120px' }}
            />
            <div className="flex flex-col gap-2">
              <label
                className="px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer text-center"
                style={{
                  border: '1px solid var(--casa-border)',
                  color: 'var(--casa-text)',
                  backgroundColor: 'var(--casa-surface)',
                }}
              >
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file)
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setImageUrl('')
                  setImagePreview('')
                }}
                className="px-3 py-1.5 rounded-lg text-sm"
                style={{ color: 'var(--casa-diff-del-text)' }}
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label
            className="flex flex-col items-center justify-center gap-2 py-6 rounded-lg cursor-pointer"
            style={{
              border: '2px dashed var(--casa-border)',
              backgroundColor: 'var(--casa-surface)',
              color: 'var(--casa-text-muted)',
              minHeight: '44px',
            }}
          >
            {uploading ? (
              <span className="text-sm">Uploading...</span>
            ) : (
              <>
                <Camera className="w-6 h-6" />
                <span className="text-sm">Upload photo or take picture</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImageUpload(file)
              }}
            />
          </label>
        )}
      </div>

      {/* Ingredients */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold" style={{ color: 'var(--casa-text)' }}>
            {t('recipeForm.ingredients')}
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addIngredient}
            disabled={saving}
            style={{ borderColor: 'var(--casa-border)', color: 'var(--casa-text-dark)' }}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            {t('recipeForm.addIngredient')}
          </Button>
        </div>

        <div className="space-y-2">
          {ingredients.map((ing, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 gap-2 items-center p-3 rounded-lg"
              style={{ backgroundColor: 'var(--casa-bg)', border: '1px solid var(--casa-border)' }}
            >
              <div className="col-span-3">
                <Input
                  placeholder={t('recipeForm.ingredientNameEn')}
                  value={ing.name_en}
                  onChange={(e) => updateIngredient(idx, 'name_en', e.target.value)}
                  disabled={saving}
                  className="text-xs"
                  style={inputStyle}
                />
              </div>
              <div className="col-span-3">
                <Input
                  placeholder={t('recipeForm.ingredientNameEs')}
                  value={ing.name_es}
                  onChange={(e) => updateIngredient(idx, 'name_es', e.target.value)}
                  disabled={saving}
                  className="text-xs"
                  style={inputStyle}
                />
              </div>
              <div className="col-span-2">
                <Input
                  placeholder={t('recipeForm.quantity')}
                  value={ing.quantity}
                  onChange={(e) => updateIngredient(idx, 'quantity', e.target.value)}
                  disabled={saving}
                  className="text-xs"
                  style={inputStyle}
                />
              </div>
              <div className="col-span-2">
                <Select
                  value={ing.unit}
                  onValueChange={(v) => updateIngredient(idx, 'unit', v ?? '')}
                  disabled={saving}
                >
                  <SelectTrigger className="text-xs h-9" style={inputStyle}>
                    <SelectValue placeholder={t('recipeForm.unit')} />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => (
                      <SelectItem key={u} value={u} className="text-xs">
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
                <Input
                  placeholder={t('recipeForm.ingredientCategory')}
                  value={ing.category ?? ''}
                  onChange={(e) => updateIngredient(idx, 'category', e.target.value)}
                  disabled={saving}
                  className="text-xs"
                  style={inputStyle}
                />
              </div>
              <div className="col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeIngredient(idx)}
                  disabled={saving || ingredients.length === 1}
                  className="p-1 rounded hover:bg-red-50 disabled:opacity-30 transition-colors"
                  style={{ color: '#991B1B' }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label style={{ color: 'var(--casa-text)' }}>{t('recipeForm.instructionsEn')}</Label>
          <Textarea
            value={instructionsEn}
            onChange={(e) => setInstructionsEn(e.target.value)}
            rows={8}
            disabled={saving}
            placeholder="Step 1: ..."
            style={inputStyle}
          />
        </div>
        <div className="space-y-1.5">
          <Label style={{ color: 'var(--casa-text)' }}>{t('recipeForm.instructionsEs')}</Label>
          <Textarea
            value={instructionsEs}
            onChange={(e) => setInstructionsEs(e.target.value)}
            rows={8}
            disabled={saving}
            placeholder="Paso 1: ..."
            style={inputStyle}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          disabled={saving || translating || uploading || !category}
          style={{ backgroundColor: 'var(--casa-primary)', color: '#FFFFFF' }}
        >
          {saving ? t('recipeForm.saving') : t('recipeForm.save')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleAutoTranslate}
          disabled={saving || translating || !titleEn.trim()}
          style={{ borderColor: 'var(--casa-border)', color: 'var(--casa-text-dark)' }}
        >
          <Languages className="w-4 h-4 mr-1.5" />
          {translating ? t('recipeForm.translating') : t('recipeForm.autoTranslate')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={saving || translating}
          style={{ borderColor: 'var(--casa-border)', color: 'var(--casa-text-dark)' }}
        >
          {t('recipeForm.cancel')}
        </Button>
      </div>
    </form>
  )
}

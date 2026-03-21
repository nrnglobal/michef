'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
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
  const [tags, setTags] = useState((recipe?.tags ?? []).join(', '))
  const [instructionsEn, setInstructionsEn] = useState(recipe?.instructions_en ?? '')
  const [instructionsEs, setInstructionsEs] = useState(recipe?.instructions_es ?? '')
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe?.ingredients?.length ? recipe.ingredients : [emptyIngredient()]
  )
  const [saving, setSaving] = useState(false)

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

  const inputStyle = { borderColor: '#E8E0D0' }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {/* Titles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label style={{ color: '#1A1410' }}>{t('recipeForm.titleEn')}</Label>
          <Input
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            required
            disabled={saving}
            style={inputStyle}
          />
        </div>
        <div className="space-y-1.5">
          <Label style={{ color: '#1A1410' }}>{t('recipeForm.titleEs')}</Label>
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
          <Label style={{ color: '#1A1410' }}>{t('recipeForm.descriptionEn')}</Label>
          <Textarea
            value={descEn}
            onChange={(e) => setDescEn(e.target.value)}
            rows={3}
            disabled={saving}
            style={inputStyle}
          />
        </div>
        <div className="space-y-1.5">
          <Label style={{ color: '#1A1410' }}>{t('recipeForm.descriptionEs')}</Label>
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
          <Label style={{ color: '#1A1410' }}>{t('recipeForm.category')}</Label>
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
          <Label style={{ color: '#1A1410' }}>{t('recipeForm.proteinType')}</Label>
          <Input
            value={proteinType}
            onChange={(e) => setProteinType(e.target.value)}
            placeholder={t('recipeForm.proteinPlaceholder')}
            disabled={saving}
            style={inputStyle}
          />
        </div>

        <div className="space-y-1.5">
          <Label style={{ color: '#1A1410' }}>{t('recipeForm.prepTime')}</Label>
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
          <Label style={{ color: '#1A1410' }}>{t('recipeForm.servings')}</Label>
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
          <Label style={{ color: '#1A1410' }}>{t('recipeForm.youtubeUrl')}</Label>
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
          <Label style={{ color: '#1A1410' }}>{t('recipeForm.tags')}</Label>
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder={t('recipeForm.tagsPlaceholder')}
            disabled={saving}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Ingredients */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold" style={{ color: '#1A1410' }}>
            {t('recipeForm.ingredients')}
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addIngredient}
            disabled={saving}
            style={{ borderColor: '#E8E0D0', color: '#4A3B28' }}
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
              style={{ backgroundColor: '#FAFAF8', border: '1px solid #E8E0D0' }}
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
          <Label style={{ color: '#1A1410' }}>{t('recipeForm.instructionsEn')}</Label>
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
          <Label style={{ color: '#1A1410' }}>{t('recipeForm.instructionsEs')}</Label>
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
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={saving || !category}
          style={{ backgroundColor: '#8B6914', color: '#FFFFFF' }}
        >
          {saving ? t('recipeForm.saving') : t('recipeForm.save')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={saving}
          style={{ borderColor: '#E8E0D0', color: '#4A3B28' }}
        >
          {t('recipeForm.cancel')}
        </Button>
      </div>
    </form>
  )
}

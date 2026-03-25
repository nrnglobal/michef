export interface Profile {
  id: string
  user_id: string
  role: 'client' | 'cook'
  name: string
  language: 'en' | 'es'
  created_at: string
  updated_at: string
}

export interface Ingredient {
  name_en: string
  name_es: string
  quantity: string
  unit: string
  category?: string
}

export interface Recipe {
  id: string
  title_en: string
  title_es: string
  description_en?: string
  description_es?: string
  ingredients: Ingredient[]
  instructions_en?: string
  instructions_es?: string
  youtube_url?: string
  category: string
  protein_type?: string
  prep_time_minutes?: number
  servings: number
  tags: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  parent_recipe_id?: string  // FK to parent recipe for variant support (D-07)
}

export interface RecipeFeedback {
  id: string
  recipe_id: string
  visit_id?: string
  rating?: number
  feedback_text?: string
  adjustment_type?: string
  adjustment_detail?: string
  ai_adjusted_recipe?: Record<string, unknown>
  created_at: string
}

export interface MenuPlan {
  id: string
  visit_date: string
  status: 'draft' | 'confirmed' | 'shopping' | 'cooking' | 'done'
  notes?: string
  created_at: string
  updated_at: string
}

export interface MenuPlanItem {
  id: string
  menu_plan_id: string
  recipe_id: string
  servings: number
  sort_order: number
}

export interface CookingRule {
  id: string
  rule_type: string
  rule_definition: Record<string, unknown>
  is_active: boolean
  created_at: string
}

export interface ShoppingList {
  id: string
  menu_plan_id?: string
  status: 'draft' | 'active' | 'completed'
  created_at: string
}

export interface ShoppingListItem {
  id: string
  shopping_list_id: string
  ingredient_name_en: string
  ingredient_name_es: string
  quantity?: number
  unit?: string
  category?: string
  source_recipe_ids?: string[]
  is_checked: boolean
  is_always_stock: boolean
  checked_at?: string
}

export interface Visit {
  id: string
  visit_date: string
  menu_plan_id?: string
  grocery_total?: number
  service_fee?: number
  total_payment?: number
  receipt_image_url?: string
  receipt_extracted_data?: Record<string, unknown>
  payment_status: 'pending' | 'paid'
  notes?: string
  created_at: string
}

export interface Message {
  id: string
  sender_role: 'client' | 'cook'
  original_text: string
  translated_text?: string
  original_language: 'en' | 'es'
  is_read: boolean
  created_at: string
}

export interface FridgeStaple {
  id: string
  item_name_en: string
  item_name_es: string
  quantity?: string
  notes_en?: string
  notes_es?: string
  category?: string
  is_active: boolean
  is_staple?: boolean
}

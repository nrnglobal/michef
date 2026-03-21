'use client'

import { useState, useEffect } from 'react'
import { Plus, ToggleLeft, ToggleRight } from 'lucide-react'
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
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useI18n } from '@/lib/i18n/config'
import { toast } from 'sonner'
import type { CookingRule } from '@/lib/types'

const RULE_TYPES = ['dietary', 'allergy', 'preference', 'technique', 'timing']

const ruleTypeColors: Record<string, { bg: string; text: string }> = {
  dietary: { bg: '#F0FDF4', text: '#166534' },
  allergy: { bg: '#FEF2F2', text: '#991B1B' },
  preference: { bg: '#EFF6FF', text: '#1D4ED8' },
  technique: { bg: '#FAF5FF', text: '#6B21A8' },
  timing: { bg: '#FFF7ED', text: '#9A3412' },
}

export default function RulesPage() {
  const { t } = useI18n()
  const [rules, setRules] = useState<CookingRule[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [ruleType, setRuleType] = useState('')
  const [definitionText, setDefinitionText] = useState('')
  const [saving, setSaving] = useState(false)

  async function fetchRules() {
    const supabase = createClient()
    const { data } = await supabase
      .from('cooking_rules')
      .select('*')
      .order('created_at', { ascending: false })
    setRules((data as CookingRule[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchRules()
  }, [])

  async function handleToggle(rule: CookingRule) {
    const supabase = createClient()
    const { error } = await supabase
      .from('cooking_rules')
      .update({ is_active: !rule.is_active })
      .eq('id', rule.id)

    if (error) {
      toast.error('Failed to update rule')
    } else {
      setRules((prev) =>
        prev.map((r) =>
          r.id === rule.id ? { ...r, is_active: !r.is_active } : r
        )
      )
    }
  }

  async function handleAddRule(e: React.FormEvent) {
    e.preventDefault()
    if (!ruleType || !definitionText.trim()) return

    setSaving(true)

    let definition: Record<string, unknown>
    try {
      definition = JSON.parse(definitionText)
    } catch {
      // Wrap plain text in a description field
      definition = { description: definitionText.trim() }
    }

    const supabase = createClient()
    const { error } = await supabase.from('cooking_rules').insert({
      rule_type: ruleType,
      rule_definition: definition,
      is_active: true,
    })

    if (error) {
      toast.error('Failed to add rule')
    } else {
      toast.success('Rule added')
      setRuleType('')
      setDefinitionText('')
      setShowForm(false)
      fetchRules()
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: '#1A1410' }}>
            {t('rules.title')}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#6B5B3E' }}>
            {t('rules.subtitle')}
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          style={{ backgroundColor: '#8B6914', color: '#FFFFFF' }}
          className="gap-1.5"
        >
          <Plus className="w-4 h-4" />
          {t('rules.addRule')}
        </Button>
      </div>

      {/* Add Rule Form */}
      {showForm && (
        <Card style={{ border: '1px solid #E8E0D0', backgroundColor: '#FFFFFF' }}>
          <CardContent className="pt-5">
            <form onSubmit={handleAddRule} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label style={{ color: '#1A1410' }}>{t('rules.ruleType')}</Label>
                  <Select value={ruleType} onValueChange={(v) => setRuleType(v ?? '')} disabled={saving}>
                    <SelectTrigger style={{ borderColor: '#E8E0D0' }}>
                      <SelectValue placeholder="Select rule type" />
                    </SelectTrigger>
                    <SelectContent>
                      {RULE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {t(`rules.ruleTypes.${type}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label style={{ color: '#1A1410' }}>
                  {t('rules.definition')}{' '}
                  <span className="text-xs font-normal" style={{ color: '#9B8B70' }}>
                    (text or JSON)
                  </span>
                </Label>
                <Textarea
                  value={definitionText}
                  onChange={(e) => setDefinitionText(e.target.value)}
                  placeholder={'No dairy\nor\n{"restriction": "dairy", "reason": "lactose intolerance"}'}
                  rows={4}
                  disabled={saving}
                  style={{ borderColor: '#E8E0D0' }}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={saving || !ruleType}
                  style={{ backgroundColor: '#8B6914', color: '#FFFFFF' }}
                >
                  {saving ? t('rules.saving') : t('rules.save')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  style={{ borderColor: '#E8E0D0', color: '#4A3B28' }}
                >
                  {t('rules.cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Rules List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl animate-pulse"
              style={{ backgroundColor: '#E8E0D0' }}
            />
          ))}
        </div>
      ) : rules.length > 0 ? (
        <div className="space-y-3">
          {rules.map((rule) => {
            const typeColor =
              ruleTypeColors[rule.rule_type] ?? ruleTypeColors.preference
            const definition = rule.rule_definition as Record<string, unknown>
            const displayText =
              typeof definition.description === 'string'
                ? definition.description
                : JSON.stringify(definition, null, 2)

            return (
              <Card
                key={rule.id}
                style={{
                  border: '1px solid #E8E0D0',
                  backgroundColor: rule.is_active ? '#FFFFFF' : '#FAFAF8',
                  opacity: rule.is_active ? 1 : 0.6,
                }}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge
                          className="text-xs font-medium capitalize"
                          style={{
                            backgroundColor: typeColor.bg,
                            color: typeColor.text,
                            border: 'none',
                          }}
                        >
                          {t(`rules.ruleTypes.${rule.rule_type}`)}
                        </Badge>
                        {!rule.is_active && (
                          <span className="text-xs" style={{ color: '#9B8B70' }}>
                            {t('rules.inactive')}
                          </span>
                        )}
                      </div>
                      <p
                        className="text-sm whitespace-pre-wrap font-mono"
                        style={{ color: '#1A1410' }}
                      >
                        {displayText}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggle(rule)}
                      className="shrink-0 p-1 rounded hover:bg-gray-50 transition-colors"
                      title={t('rules.toggle')}
                    >
                      {rule.is_active ? (
                        <ToggleRight
                          className="w-6 h-6"
                          style={{ color: '#8B6914' }}
                        />
                      ) : (
                        <ToggleLeft
                          className="w-6 h-6"
                          style={{ color: '#D1D5DB' }}
                        />
                      )}
                    </button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div
          className="text-center py-16 rounded-xl border"
          style={{ borderColor: '#E8E0D0', borderStyle: 'dashed' }}
        >
          <p className="text-base font-medium" style={{ color: '#1A1410' }}>
            {t('rules.noRules')}
          </p>
          <p className="text-sm mt-1" style={{ color: '#9B8B70' }}>
            Add dietary restrictions, allergies, and cooking preferences.
          </p>
          <Button
            className="mt-4"
            onClick={() => setShowForm(true)}
            style={{ backgroundColor: '#8B6914', color: '#FFFFFF' }}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            {t('rules.addRule')}
          </Button>
        </div>
      )}
    </div>
  )
}

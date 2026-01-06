'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    INSTAGRAM_PAGE_ACCESS_TOKEN: '',
    INSTAGRAM_VERIFY_TOKEN: '',
    OPENAI_API_KEY: '',
    WOOCOMMERCE_URL: '',
    WOOCOMMERCE_CONSUMER_KEY: '',
    WOOCOMMERCE_CONSUMER_SECRET: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testResults, setTestResults] = useState<Record<string, any>>({})
  const [testing, setTesting] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const data = await api.settings.get()
      setSettings({ ...settings, ...data.settings })
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.settings.update(settings)
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const testConnection = async (service: 'instagram' | 'openai' | 'woocommerce') => {
    setTesting({ ...testing, [service]: true })
    try {
      const result = await api.test[service]()
      setTestResults({ ...testResults, [service]: result })
    } catch (error) {
      setTestResults({
        ...testResults,
        [service]: { success: false, message: 'Connection failed' },
      })
    } finally {
      setTesting({ ...testing, [service]: false })
    }
  }

  const renderTestButton = (service: 'instagram' | 'openai' | 'woocommerce') => {
    const result = testResults[service]
    const isLoading = testing[service]

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => testConnection(service)}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : result ? (
          result.success ? (
            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600 mr-2" />
          )
        ) : null}
        {result ? result.message : 'Test Connection'}
      </Button>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600 mt-1">
            Configure bot integrations and credentials
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Instagram Configuration</CardTitle>
                <CardDescription>Instagram Graph API credentials</CardDescription>
              </div>
              {renderTestButton('instagram')}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="instagram_token">Page Access Token</Label>
              <Input
                id="instagram_token"
                type="password"
                value={settings.INSTAGRAM_PAGE_ACCESS_TOKEN}
                onChange={(e) =>
                  setSettings({ ...settings, INSTAGRAM_PAGE_ACCESS_TOKEN: e.target.value })
                }
                placeholder="Your Instagram Page Access Token"
              />
            </div>
            <div>
              <Label htmlFor="instagram_verify">Webhook Verify Token</Label>
              <Input
                id="instagram_verify"
                value={settings.INSTAGRAM_VERIFY_TOKEN}
                onChange={(e) =>
                  setSettings({ ...settings, INSTAGRAM_VERIFY_TOKEN: e.target.value })
                }
                placeholder="Any random string you choose"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>OpenAI Configuration</CardTitle>
                <CardDescription>GPT API for natural language processing</CardDescription>
              </div>
              {renderTestButton('openai')}
            </div>
          </CardHeader>
          <CardContent>
            <Label htmlFor="openai_key">API Key</Label>
            <Input
              id="openai_key"
              type="password"
              value={settings.OPENAI_API_KEY}
              onChange={(e) =>
                setSettings({ ...settings, OPENAI_API_KEY: e.target.value })
              }
              placeholder="sk-..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>WooCommerce Configuration</CardTitle>
                <CardDescription>Your online store API credentials</CardDescription>
              </div>
              {renderTestButton('woocommerce')}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="woo_url">Store URL</Label>
              <Input
                id="woo_url"
                value={settings.WOOCOMMERCE_URL}
                onChange={(e) =>
                  setSettings({ ...settings, WOOCOMMERCE_URL: e.target.value })
                }
                placeholder="https://yourstore.com"
              />
            </div>
            <div>
              <Label htmlFor="woo_key">Consumer Key</Label>
              <Input
                id="woo_key"
                type="password"
                value={settings.WOOCOMMERCE_CONSUMER_KEY}
                onChange={(e) =>
                  setSettings({ ...settings, WOOCOMMERCE_CONSUMER_KEY: e.target.value })
                }
                placeholder="ck_..."
              />
            </div>
            <div>
              <Label htmlFor="woo_secret">Consumer Secret</Label>
              <Input
                id="woo_secret"
                type="password"
                value={settings.WOOCOMMERCE_CONSUMER_SECRET}
                onChange={(e) =>
                  setSettings({ ...settings, WOOCOMMERCE_CONSUMER_SECRET: e.target.value })
                }
                placeholder="cs_..."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


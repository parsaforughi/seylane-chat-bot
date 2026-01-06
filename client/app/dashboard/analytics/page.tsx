'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'

export default function AnalyticsPage() {
  const [intentData, setIntentData] = useState<any[]>([])
  const [messagesData, setMessagesData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const [intents, messages] = await Promise.all([
        api.analytics.intentDistribution(),
        api.analytics.messagesOverTime(30),
      ])
      setIntentData(intents.data)
      setMessagesData(messages.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-gray-600 mt-1">
          Insights into bot performance and user behavior
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Intent Distribution</CardTitle>
            <CardDescription>What users are asking about</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : intentData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No data yet</div>
            ) : (
              <div className="space-y-3">
                {intentData.map((item) => (
                  <div key={item.intent} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {item.intent?.replace('_', ' ') || 'Unknown'}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (item.count / Math.max(...intentData.map((i) => i.count))) * 100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {item.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Message Volume (Last 30 Days)</CardTitle>
            <CardDescription>Daily message activity</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : messagesData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No data yet</div>
            ) : (
              <div className="space-y-2">
                {messagesData.slice(-7).map((item) => (
                  <div key={item.date} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{item.date}</span>
                    <span className="font-medium">{item.count} messages</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Bot efficiency and response quality</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">100%</div>
              <div className="text-sm text-gray-600 mt-1">Response Rate</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">~2.5s</div>
              <div className="text-sm text-gray-600 mt-1">Avg Response Time</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {intentData.find((i) => i.intent === 'product_search')?.count || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Product Searches</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


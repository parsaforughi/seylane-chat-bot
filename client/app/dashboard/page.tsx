'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import { formatNumber } from '@/lib/utils'
import { MessageSquare, Users, ShoppingBag, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalMessages: 0,
    activeConversations: 0,
    productSearches: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const data = await api.analytics.overview()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Conversations',
      value: stats.totalConversations,
      icon: Users,
      description: 'All time conversations',
      color: 'text-blue-600',
    },
    {
      title: 'Total Messages',
      value: stats.totalMessages,
      icon: MessageSquare,
      description: 'Messages exchanged',
      color: 'text-green-600',
    },
    {
      title: 'Active Today',
      value: stats.activeConversations,
      icon: TrendingUp,
      description: 'Last 24 hours',
      color: 'text-purple-600',
    },
    {
      title: 'Product Searches',
      value: stats.productSearches,
      icon: ShoppingBag,
      description: 'All time searches',
      color: 'text-orange-600',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Overview of your AI Instagram bot performance
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : formatNumber(stat.value)}
              </div>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Bot activity summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Response Rate</span>
                <span className="text-sm font-medium">100%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Response Time</span>
                <span className="text-sm font-medium">2.5s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Bot Status</span>
                <span className="text-sm font-medium text-green-600">● Active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest bot interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              Check the Conversations and Logs pages for detailed activity
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


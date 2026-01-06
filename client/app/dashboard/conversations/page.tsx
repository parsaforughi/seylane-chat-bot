'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { MessageSquare, User } from 'lucide-react'

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const data = await api.conversations.list()
      setConversations(data.conversations)
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Conversations</h1>
        <p className="text-gray-600 mt-1">
          View and manage all Instagram conversations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Conversations</CardTitle>
          <CardDescription>
            {loading ? 'Loading...' : `${conversations.length} total conversations`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No conversations yet. Start chatting on Instagram!
            </div>
          ) : (
            <div className="space-y-4">
              {conversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/dashboard/conversations/${conv.id}`}
                  className="block"
                >
                  <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          {conv.instagramUsername || conv.instagramUserId}
                        </h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          conv.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {conv.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {conv.messageCount} messages
                        </span>
                        <span>Last active: {formatDate(conv.lastMessageAt)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


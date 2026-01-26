'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabaseClient'
import MultiverseStoryReader from '@/components/multiverse/MultiverseStoryReader'
import InstanceStatus from '@/components/multiverse/InstanceStatus'
import CharacterChat from '@/components/multiverse/CharacterChat'

type InstanceData = {
  instance: {
    id: string
    storyId: string
    status: string
    currentNodeId: string | null
    createdAt: string
    maxPlayers: number
  }
  characters: Array<{ name: string; id: string; isBot?: boolean }>
  myCharacter: {
    name: string
    id: string
    description: string
    isRevealed: boolean
  } | null
}

export default function PlayMultiverseStoryPage() {
  const router = useRouter()
  const params = useParams()
  const instanceId = params.instanceId as string

  const [instanceData, setInstanceData] = useState<InstanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  useEffect(() => {
    const fetchSession = async () => {
      const supabase = getSupabaseClient()
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token || null
      setAccessToken(token)

      if (!token) {
        router.push('/login')
        return
      }
    }
    fetchSession()
  }, [router])

  useEffect(() => {
    if (!accessToken || !instanceId) return

    const loadInstanceData = async () => {
      try {
        const response = await fetch(
          `/api/multiverse/instances/${instanceId}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        )

        if (!response.ok) {
          if (response.status === 403) {
            setError('You are not part of this story instance')
          } else if (response.status === 401) {
            router.push('/login')
            return
          } else {
            const data = await response.json()
            setError(data.error || 'Failed to load story instance')
          }
          setLoading(false)
          return
        }

        const data = await response.json()
        setInstanceData(data)
        setError(null)
      } catch (error) {
        console.error('Failed to load instance:', error)
        setError('Failed to load story instance. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadInstanceData()

    // Poll for updates every 3 seconds
    const interval = setInterval(loadInstanceData, 3000)
    return () => clearInterval(interval)
  }, [instanceId, accessToken, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading story instance...</div>
      </div>
    )
  }

  if (error || !instanceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-lg p-8 border border-white/20">
            <h1 className="text-3xl font-bold text-white mb-4">Error</h1>
            <p className="text-purple-200 mb-6">{error || 'Story instance not found'}</p>
            <Link
              href="/multiverse"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg inline-block"
            >
              ← Back to Stories
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Multiverse Story
            </h1>
            <p className="text-purple-200">
              Instance ID: {instanceId.slice(0, 8)}...
            </p>
          </div>
          <Link
            href="/multiverse"
            className="text-purple-300 hover:text-purple-200 underline"
          >
            ← Back to Stories
          </Link>
        </div>

        {/* Waiting State - Show when WAITING */}
        {instanceData.instance.status === 'WAITING' && (
          <div className="mb-6 bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  ⏳ Waiting for Players
                </h3>
                <p className="text-yellow-200">
                  {instanceData.characters.length} of {instanceData.instance.maxPlayers} players joined
                </p>
                <p className="text-yellow-300 text-sm mt-1">
                  {instanceData.instance.maxPlayers - instanceData.characters.length} more player{instanceData.instance.maxPlayers - instanceData.characters.length > 1 ? 's' : ''} needed to start
                </p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Story Reader - Takes 2 columns */}
          <div className="lg:col-span-2">
            <MultiverseStoryReader
              instanceId={instanceId}
              instanceData={instanceData}
              accessToken={accessToken}
            />
          </div>

          {/* Sidebar - Status and Chat */}
          <div className="space-y-6">
            {/* Instance Status */}
            <InstanceStatus instanceData={instanceData} />

            {/* Character Chat */}
            <CharacterChat
              instanceId={instanceId}
              myCharacterId={instanceData.myCharacter?.id}
              accessToken={accessToken}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

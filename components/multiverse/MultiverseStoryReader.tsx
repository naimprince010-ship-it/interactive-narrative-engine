'use client'

import { useEffect, useState } from 'react'

type StoryNode = {
  id: string
  node_key: string
  title: string
  content: string
  choices: Array<{
    key: string
    text: string
    next_node: string
    character_specific?: string[] | null
  }> | null
  is_ending: boolean
}

type InstanceData = {
  instance: {
    id: string
    storyId: string
    status: string
    currentNodeId: string | null
    createdAt: string
  }
  characters: Array<{ name: string; id: string; isBot?: boolean }>
  myCharacter: {
    name: string
    id: string
    description: string
    isRevealed: boolean
  } | null
}

type Props = {
  instanceId: string
  instanceData: InstanceData
  accessToken: string | null
}

export default function MultiverseStoryReader({
  instanceId,
  instanceData,
  accessToken,
}: Props) {
  const [currentNode, setCurrentNode] = useState<StoryNode | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!instanceData.instance.currentNodeId) {
      setLoading(false)
      return
    }

    const loadNode = async () => {
      try {
        // TODO: Create API endpoint to get node with character-specific content
        const response = await fetch(
          `/api/multiverse/instances/${instanceId}/node?nodeId=${instanceData.instance.currentNodeId}`,
          {
            headers: accessToken
              ? { Authorization: `Bearer ${accessToken}` }
              : {},
          }
        )

        if (response.ok) {
          const data = await response.json()
          setCurrentNode(data.node)
        }
      } catch (error) {
        console.error('Failed to load node:', error)
      } finally {
        setLoading(false)
      }
    }

    loadNode()
  }, [instanceId, instanceData.instance.currentNodeId, accessToken])

  const handleChoiceClick = async (choiceKey: string) => {
    if (!currentNode || !accessToken) return

    try {
      const response = await fetch(
        `/api/multiverse/instances/${instanceId}/choices`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nodeId: currentNode.id,
            choiceKey,
          }),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Failed to submit choice')
      }
      // Node will update via polling
    } catch (error) {
      console.error('Failed to submit choice:', error)
      alert('Failed to submit choice. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8">
        <div className="text-white">Loading story...</div>
      </div>
    )
  }

  if (!currentNode) {
    const currentPlayers = instanceData.characters.length
    const maxPlayers = instanceData.instance.maxPlayers || 3
    const playersNeeded = maxPlayers - currentPlayers

    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 border border-white/20">
        <div className="text-white text-center">
          {instanceData.instance.status === 'WAITING' ? (
            <>
              <div className="text-6xl mb-4">⏳</div>
              <p className="text-2xl font-bold mb-4">Waiting for Players</p>
              <div className="bg-purple-900/50 rounded-lg p-4 mb-4 border border-purple-500/50">
                <p className="text-lg text-purple-200 mb-2">
                  <span className="text-white font-bold text-2xl">{currentPlayers}</span> / {maxPlayers} players
                </p>
                <p className="text-purple-300">
                  {playersNeeded > 0
                    ? `${playersNeeded} more player${playersNeeded > 1 ? 's' : ''} needed to start the story`
                    : 'All players joined! Story starting soon...'}
                </p>
              </div>
              <p className="text-purple-200 text-sm mt-4">
                Share this page with friends so they can join!
              </p>
            </>
          ) : (
            <>
              <p className="text-xl mb-4">Story is loading...</p>
              <p className="text-purple-200">Please wait...</p>
            </>
          )}
        </div>
      </div>
    )
  }

  // Filter choices based on character
  const availableChoices =
    currentNode.choices?.filter((choice) => {
      if (!choice.character_specific || choice.character_specific.length === 0) {
        return true // Available to all
      }
      return choice.character_specific.includes(instanceData.myCharacter?.name || '')
    }) || []

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 border border-white/20">
      {/* Story Node */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-4">{currentNode.title}</h2>
        <div className="text-purple-100 whitespace-pre-line leading-relaxed text-lg">
          {currentNode.content}
        </div>
      </div>

      {/* Character Info (if revealed) */}
      {instanceData.myCharacter?.isRevealed && (
        <div className="mb-6 p-4 bg-purple-900/50 rounded-lg border border-purple-500/50">
          <p className="text-purple-200 text-sm mb-1">You are playing as:</p>
          <p className="text-white font-semibold text-lg">
            {instanceData.myCharacter.name}
          </p>
          <p className="text-purple-300 text-sm mt-1">
            {instanceData.myCharacter.description}
          </p>
        </div>
      )}

      {/* Choices */}
      {availableChoices.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-white mb-4">Your Choices:</h3>
          <div className="space-y-3">
            {availableChoices.map((choice) => (
              <button
                key={choice.key}
                onClick={() => handleChoiceClick(choice.key)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-lg transition-all text-left border border-purple-500/50 hover:border-purple-400"
              >
                {choice.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ending Message */}
      {currentNode.is_ending && (
        <div className="mt-8 p-6 bg-yellow-900/50 rounded-lg border border-yellow-500/50">
          <p className="text-yellow-200 text-center text-lg">
            ✨ Story Complete! ✨
          </p>
        </div>
      )}
    </div>
  )
}

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
  const [submittingChoice, setSubmittingChoice] = useState(false)
  const [userChoiceMade, setUserChoiceMade] = useState<string | null>(null)

  // When user has submitted choice and is "waiting for other players", trigger bot choices
  // as a fallback (in case initial POST /choices didn't complete bot processing on serverless)
  useEffect(() => {
    if (!userChoiceMade || !currentNode?.id || !accessToken) return

    const triggerBotChoices = async () => {
      try {
        await fetch(`/api/multiverse/instances/${instanceId}/trigger-bot-choices`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nodeId: currentNode.id }),
        })
      } catch (err) {
        console.error('Trigger bot choices failed:', err)
      }
    }

    // Trigger immediately once when we enter "waiting" state
    triggerBotChoices()
    const interval = setInterval(triggerBotChoices, 5000)
    return () => clearInterval(interval)
  }, [instanceId, accessToken, userChoiceMade, currentNode?.id])

  useEffect(() => {
    if (!instanceData.instance.currentNodeId) {
      setLoading(false)
      setCurrentNode(null)
      setUserChoiceMade(null)
      return
    }

    let isMounted = true
    let loadingInProgress = false

    const loadNode = async () => {
      // Prevent multiple simultaneous requests
      if (loadingInProgress) return
      loadingInProgress = true

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

        if (!isMounted) return

        if (response.ok) {
          const data = await response.json()
          
          // Only update if node actually changed
          if (data.node && data.node.id !== currentNode?.id) {
            setCurrentNode(data.node)
          }
          
          // Check if user already made a choice for this node
          if (data.userChoice) {
            setUserChoiceMade(data.userChoice.choice_key)
          } else {
            setUserChoiceMade(null)
          }
        }
      } catch (error) {
        console.error('Failed to load node:', error)
      } finally {
        loadingInProgress = false
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Initial load
    setLoading(true)
    loadNode()
    
    // Poll for node updates every 5 seconds when story is active (less frequent to reduce blinking)
    // Only poll if we don't have a node or if story might have progressed
    if (instanceData.instance.status === 'ACTIVE') {
      const interval = setInterval(() => {
        if (isMounted && !loadingInProgress) {
          loadNode()
        }
      }, 5000) // Increased to 5 seconds to reduce blinking
      return () => {
        isMounted = false
        clearInterval(interval)
      }
    }

    return () => {
      isMounted = false
    }
  }, [instanceId, instanceData.instance.currentNodeId, instanceData.instance.status, accessToken])

  const handleChoiceClick = async (choiceKey: string) => {
    if (!currentNode || !accessToken || submittingChoice || userChoiceMade) return

    setSubmittingChoice(true)

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
        // Don't show alert for "already submitted" - it's expected if user double-clicks
        if (data.error && !data.error.includes('already submitted')) {
          alert(data.error || 'Failed to submit choice')
        } else if (data.error && data.error.includes('already submitted')) {
          // Choice was already made, update UI state
          setUserChoiceMade(choiceKey)
        }
      } else {
        // Success - mark choice as made
        setUserChoiceMade(choiceKey)
        
        // Note: Node will update via parent polling (every 3 seconds)
        // No need to force reload here as parent component handles updates
      }
      // Node will update via polling
    } catch (error) {
      console.error('Failed to submit choice:', error)
      alert('Failed to submit choice. Please try again.')
    } finally {
      setSubmittingChoice(false)
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
          {userChoiceMade ? (
            <div className="space-y-3">
              {availableChoices.map((choice) => (
                <button
                  key={choice.key}
                  disabled
                  className={`w-full px-6 py-4 rounded-lg transition-all text-left border ${
                    choice.key === userChoiceMade
                      ? 'bg-green-600/50 border-green-500/50 text-white cursor-default'
                      : 'bg-gray-600/30 border-gray-500/30 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {choice.text}
                  {choice.key === userChoiceMade && (
                    <span className="ml-2 text-green-300">✓ Submitted</span>
                  )}
                </button>
              ))}
              <p className="text-purple-200 text-sm mt-4 text-center">
                Waiting for other players to make their choices...
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableChoices.map((choice) => (
                <button
                  key={choice.key}
                  onClick={() => handleChoiceClick(choice.key)}
                  disabled={submittingChoice}
                  className={`w-full px-6 py-4 rounded-lg transition-all text-left border ${
                    submittingChoice
                      ? 'bg-gray-600/50 border-gray-500/50 text-gray-300 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700 text-white border-purple-500/50 hover:border-purple-400'
                  }`}
                >
                  {submittingChoice ? 'Submitting...' : choice.text}
                </button>
              ))}
            </div>
          )}
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

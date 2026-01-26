'use client'

type InstanceData = {
  instance: {
    id: string
    storyId: string
    status: string
    currentNodeId: string | null
    createdAt: string
  }
  characters: Array<{ name: string; id: string }>
  myCharacter: {
    name: string
    id: string
    description: string
    isRevealed: boolean
  } | null
}

type Props = {
  instanceData: InstanceData
}

export default function InstanceStatus({ instanceData }: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WAITING':
        return 'bg-yellow-600/50 border-yellow-500/50'
      case 'ACTIVE':
        return 'bg-green-600/50 border-green-500/50'
      case 'COMPLETED':
        return 'bg-blue-600/50 border-blue-500/50'
      default:
        return 'bg-gray-600/50 border-gray-500/50'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'WAITING':
        return 'Waiting for players...'
      case 'ACTIVE':
        return 'Story in progress'
      case 'COMPLETED':
        return 'Story completed'
      default:
        return status
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-6">
      <h3 className="text-white font-semibold mb-4">Story Status</h3>

      {/* Status Badge */}
      <div
        className={`${getStatusColor(
          instanceData.instance.status
        )} rounded-lg p-3 mb-4 border`}
      >
        <div className="text-white font-semibold">
          {getStatusText(instanceData.instance.status)}
        </div>
      </div>

      {/* Characters */}
      <div className="mb-4">
        <h4 className="text-purple-200 text-sm mb-2">
          Characters ({instanceData.characters.length})
        </h4>
        <div className="space-y-2">
          {instanceData.characters.map((char) => (
            <div
              key={char.id}
              className={`p-2 rounded ${
                char.id === instanceData.myCharacter?.id
                  ? 'bg-purple-600/50 border border-purple-500/50'
                  : 'bg-white/5'
              }`}
            >
              <div className="text-white text-sm">
                {char.name}
                {char.id === instanceData.myCharacter?.id && (
                  <span className="ml-2 text-purple-300 text-xs">(You)</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My Character Info (if not revealed, show hint) */}
      {instanceData.myCharacter && !instanceData.myCharacter.isRevealed && (
        <div className="mt-4 p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
          <p className="text-purple-200 text-xs mb-1">Your Character:</p>
          <p className="text-white text-sm font-semibold">
            {instanceData.myCharacter.name}
          </p>
          <p className="text-purple-300 text-xs mt-1 italic">
            Your identity will be revealed at the story's climax
          </p>
        </div>
      )}
    </div>
  )
}

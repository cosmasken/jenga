import React from 'react'
import { ChamaDiscovery } from '@/components/ChamaDiscovery'
import { useLocation } from 'wouter'

export default function ChamaDiscoveryPage() {
  const [, setLocation] = useLocation()

  const handleJoinChama = (chamaId: string) => {
    // Navigate to the chama dashboard after successful join
    setLocation(`/chama/${chamaId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <ChamaDiscovery onJoinChama={handleJoinChama} />
      </div>
    </div>
  )
}

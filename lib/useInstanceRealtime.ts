'use client'

import { useEffect, useRef } from 'react'
import { getSupabaseClient } from '@/lib/supabaseClient'

/**
 * Phase 4: Subscribe to story_instances, story_state, and instance_events for this instance.
 * When any changes (e.g. health_loss, item_found), onUpdate() is called so the client can refetch.
 */
export function useInstanceRealtime(instanceId: string | null, onUpdate: () => void) {
  const onUpdateRef = useRef(onUpdate)
  onUpdateRef.current = onUpdate

  useEffect(() => {
    if (!instanceId) return
    const handler = () => onUpdateRef.current?.()

    const supabase = getSupabaseClient()
    const channel = supabase
      .channel(`instance:${instanceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'story_instances',
          filter: `id=eq.${instanceId}`,
        },
        handler
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'story_state',
          filter: `instance_id=eq.${instanceId}`,
        },
        handler
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'instance_events',
          filter: `instance_id=eq.${instanceId}`,
        },
        handler
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[realtime] Subscribed to instance', instanceId.slice(0, 8))
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [instanceId, onUpdate])
}

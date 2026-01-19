import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const GroupContext = createContext()

export function GroupProvider({ children, session }) {
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      loadUserGroups()
    }
  }, [session])

async function loadUserGroups() {
  const { data: memberData } = await supabase
    .from('members')
    .select('*, group:groups(*)')
    .eq('user_id', session.user.id)

  setGroups(memberData || [])
  
  // Auto-select if only one group OR if none selected yet
  if (memberData?.length === 1) {
    setSelectedGroup(memberData[0].group)
    setMember(memberData[0])
  } else if (memberData?.length > 1 && !selectedGroup) {
    // Auto-select first group if none selected (for web/refresh scenarios)
    setSelectedGroup(memberData[0].group)
    setMember(memberData[0])
  }
  
  setLoading(false)
}

  const selectGroup = (groupData, memberData) => {
    setSelectedGroup(groupData)
    setMember(memberData)
  }

  const reloadGroups = async () => {
    if (session?.user) {
      await loadUserGroups()
    }
  }

  return (
    <GroupContext.Provider value={{ 
      groups, 
      selectedGroup, 
      member, 
      loading,
      selectGroup,
      loadUserGroups: reloadGroups
    }}>
      {children}
    </GroupContext.Provider>
  )
}

export const useGroup = () => useContext(GroupContext)
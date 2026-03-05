import React from 'react'
import { useTheme } from '../context/ThemeContext'

function Suggestions() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <>
    <div className={`rounded-2xl! border! shadow-sm! p-4! ${isDark ? 'bg-gray-800! border-purple-600! text-gray-100!' : 'bg-white! border-gray-300! text-gray-800!'}`}>
      Suggestions  
    </div>
    </>
  )
}

export default Suggestions

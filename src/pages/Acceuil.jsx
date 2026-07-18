import React, { useEffect, useState } from 'react'
import CreatePost from './CreatePost'
import Posts from './Posts'
import { useTheme } from '../context/ThemeContext'
import Suggestions from './Suggestions'

function Acceuil() {
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const [refreshKey, setRefreshKey] = useState(0)

    const handlePostCreated = () => {
        setRefreshKey(prev => prev + 1)
    }

    return (
        <div className={`min-h-screen flex items-start md:gap-10 pt-6 px-4 md:px-8 md:pr-12 pb-20 ${isDark ? 'bg-gray-900' : 'bg-slate-50'}`}>

            <div className="flex-1 w-full " style={{ maxWidth: '900px' }}>
                <CreatePost onPostCreated={handlePostCreated} />
                <Posts refreshKey={refreshKey} />
            </div>

            <div className="md:block hidden flex-none w-[360px] sticky top-6 self-start max-h-[calc(100vh-3rem)] overflow-y-auto">
                <Suggestions />
            </div>
        </div>
    )
}

export default Acceuil

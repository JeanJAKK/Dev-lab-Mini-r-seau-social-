import React from 'react'
import CreatePost from './CreatePost'
import Posts from './Posts'
import { useTheme } from '../context/ThemeContext'

function Acceuil() {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <div style={{ minHeight: '100vh', background: isDark ? '#111827' : '#f8fafc' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 16px 112px' }}>
                <CreatePost />
                <Posts />
            </div>
        </div>
    )
}

export default Acceuil

import React from 'react'
import CreatePost from './CreatePost'
import Posts from './Posts'

function Acceuil() {
    return (
        <div className="min-h-screen bg-gray-50">
        <div style={{ maxWidth: '660px', margin: '0 auto', padding: '24px 16px 112px' }}>
                <CreatePost />
                <Posts />
            </div>
        </div>
    )
}

export default Acceuil

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check if user is logged in
        const user = localStorage.getItem('voicebox_currentUser')
        if (user) {
            setIsAuthenticated(true)
        }
        setLoading(false)
    }, [])

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontSize: '1.5rem',
                fontFamily: 'Inter, sans-serif'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
                    <div>Loading VoiceBox...</div>
                </div>
            </div>
        )
    }

    return (
        <Router>
            <Routes>
                {/* Redirect to login if not authenticated */}
                <Route
                    path="/"
                    element={
                        isAuthenticated ? (
                            <Navigate to="/app" replace />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                {/* Login Page */}
                <Route
                    path="/login"
                    element={
                        <iframe
                            src="/html/login.html"
                            style={{
                                width: '100%',
                                height: '100vh',
                                border: 'none',
                                display: 'block'
                            }}
                            title="Login Page"
                        />
                    }
                />

                {/* Admin Login Page */}
                <Route
                    path="/admin-login"
                    element={
                        <iframe
                            src="/html/admin-login.html"
                            style={{
                                width: '100%',
                                height: '100vh',
                                border: 'none',
                                display: 'block'
                            }}
                            title="Admin Login Page"
                        />
                    }
                />

                {/* Main App */}
                <Route
                    path="/app"
                    element={
                        isAuthenticated ? (
                            <iframe
                                src="/html/index.html"
                                style={{
                                    width: '100%',
                                    height: '100vh',
                                    border: 'none',
                                    display: 'block'
                                }}
                                title="VoiceBox App"
                            />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                {/* Admin Panel */}
                <Route
                    path="/admin"
                    element={
                        <iframe
                            src="/html/admin.html"
                            style={{
                                width: '100%',
                                height: '100vh',
                                border: 'none',
                                display: 'block'
                            }}
                            title="Admin Panel"
                        />
                    }
                />

                {/* Reset Password */}
                <Route
                    path="/reset-password"
                    element={
                        <iframe
                            src="/html/reset-password.html"
                            style={{
                                width: '100%',
                                height: '100vh',
                                border: 'none',
                                display: 'block'
                            }}
                            title="Reset Password"
                        />
                    }
                />

                {/* Setup Guide */}
                <Route
                    path="/setup"
                    element={
                        <iframe
                            src="/html/setup-guide.html"
                            style={{
                                width: '100%',
                                height: '100vh',
                                border: 'none',
                                display: 'block'
                            }}
                            title="Setup Guide"
                        />
                    }
                />
            </Routes>
        </Router>
    )
}

export default App

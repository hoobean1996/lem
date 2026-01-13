import { useEffect } from 'react'

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (element: HTMLElement, config: { theme: string; size: string; width: number }) => void;
        };
      };
    };
  }
}

function LoginPage() {
  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initializeGoogleSignIn
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const initializeGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: '903028288904-j39mh2o9mjj0f8mk43mgb1uu38toh2on.apps.googleusercontent.com',
        callback: handleCredentialResponse,
      })
      const buttonDiv = document.getElementById('google-signin-button')
      if (buttonDiv) {
        window.google.accounts.id.renderButton(buttonDiv, {
          theme: 'outline',
          size: 'large',
          width: 300,
        })
      }
    }
  }

  const handleCredentialResponse = async (response: { credential: string }) => {
    try {
      const res = await fetch('http://localhost:8000/admin/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: response.credential }),
        credentials: 'include',
      })

      if (res.ok) {
        window.location.href = '/'
      } else {
        const error = await res.json()
        alert(error.detail || 'Login failed')
      }
    } catch (err) {
      alert('Login failed: ' + (err as Error).message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <span className="text-6xl">🍋</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Lemonade Admin</h1>
          <p className="text-gray-500 mt-2">Sign in to continue</p>
        </div>
        <div className="flex justify-center">
          <div id="google-signin-button"></div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

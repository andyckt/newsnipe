"use client"

import type React from "react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { AuthCard } from "@/components/auth/auth-card"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/",
        // Pass remember me as a custom parameter
        remember: rememberMe,
      })

      if (result?.error) {
        toast({
          title: "Authentication failed",
          description: result.error,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Successful login
      toast({
        title: "Signed in successfully!",
        description: "Welcome back to your account.",
      })
      
      // Redirect to dashboard
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name) {
      toast({
        title: "Name required",
        description: "Please enter your name.",
        variant: "destructive",
      })
      return
    }

    if (!validateEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Register the user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Show success message
      toast({
        title: "Account created!",
        description: "Your account has been created successfully.",
      })

      // Sign in the user after successful registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/",
        // Pass remember me as a custom parameter
        remember: rememberMe,
      })

      if (result?.error) {
        toast({
          title: "Sign in failed",
          description: "Account created but sign in failed. Please try signing in manually.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Redirect to dashboard
      router.push("/")
      router.refresh()
    } catch (error: any) {
      console.error("Registration error:", error)
      toast({
        title: "Registration failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: string) => {
    toast({
      title: `${provider} login`,
      description: `Social login is not implemented yet.`,
      variant: "destructive",
    })
  }

  const handleForgotPassword = () => {
    toast({
      title: "Reset link sent",
      description: "Password reset functionality is not implemented yet.",
      variant: "destructive",
    })
  }

  // YouTube video is embedded via iframe, no need for video loading handlers

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: "url('/bg.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      
      {/* Home icon commented out as requested
      <div className="absolute top-4 left-4 z-10">
        <a 
          href="/home" 
          className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm border border-purple-500/30 transition-all duration-300 flex items-center justify-center"
          aria-label="Go to homepage"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </a>
      </div>
      */}
      
      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left side - Video and Slogan content */}
          <div className="space-y-8 lg:pr-8">
            {/* YouTube Video */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/20 mb-10">
              <iframe 
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube-nocookie.com/embed/ttcW7PjHiRY?si=hWh2PU5bM1etzOdr&amp;controls=1&amp;loop=1&amp;playlist=ttcW7PjHiRY" 
                title="Snipe Introduction" 
                frameBorder="0" 
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
              ></iframe>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-tight text-white">
                See & Hear your candidate,{" "}
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Snipe
                </span>
              </h1>
            </div>
          </div>
          
          {/* Right side - Auth Card */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              <AuthCard
                isLoading={isLoading}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                name={name}
                setName={setName}
                rememberMe={rememberMe}
                setRememberMe={setRememberMe}
                onSignIn={handleSignIn}
                onSignUp={handleSignUp}
                onSocialLogin={handleSocialLogin}
                onForgotPassword={handleForgotPassword}
              />
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}

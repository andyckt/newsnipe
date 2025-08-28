"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Mail, Eye, EyeOff, User, Key } from "lucide-react"

interface AuthCardProps {
  isLoading: boolean
  email: string
  setEmail: (email: string) => void
  password: string
  setPassword: (password: string) => void
  rememberMe: boolean
  setRememberMe: (remember: boolean) => void
  onSignIn: (e: React.FormEvent) => void
  onSignUp: (e: React.FormEvent) => void
  onSocialLogin: (provider: string) => void
  onForgotPassword: () => void
}

export function AuthCard({
  isLoading,
  email,
  setEmail,
  password,
  setPassword,
  rememberMe,
  setRememberMe,
  onSignIn,
  onSignUp,
  onSocialLogin,
  onForgotPassword,
}: AuthCardProps) {
  const [activeTab, setActiveTab] = useState("signup")
  const [nickname, setNickname] = useState("")
  const [showPassword, setShowPassword] = useState(false)



  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl transform transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl">
        {/* Header with tabs and close button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex bg-black/30 backdrop-blur-sm rounded-full p-1 border border-white/10">
            <button
              onClick={() => setActiveTab("signup")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                activeTab === "signup"
                  ? "bg-white/20 backdrop-blur-sm text-white border border-white/20 shadow-lg"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              Sign up
            </button>
            <button
              onClick={() => setActiveTab("signin")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                activeTab === "signin"
                  ? "bg-white/20 backdrop-blur-sm text-white border border-white/20 shadow-lg"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              Sign in
            </button>
          </div>
          <button className="w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10 hover:bg-black/40 transition-all duration-200 hover:scale-110 hover:rotate-90">
            <X className="w-5 h-5 text-white/80" />
          </button>
        </div>

        <h1 className="text-3xl font-normal text-white mb-8 transition-all duration-300">
          {activeTab === "signup" ? "Create an account" : "Welcome back"}
        </h1>

        <div className="relative overflow-hidden">
          <div
            className={`transition-all duration-500 ease-in-out transform ${
              activeTab === "signup" ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 absolute inset-0"
            }`}
          >
            {/* Sign Up Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                onSignUp(e)
              }}
              className="space-y-4"
            >
              {/* Nickname field */}
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 transition-colors duration-200" />
                <Input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl h-14 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-0 pl-12 text-base transition-all duration-200 hover:bg-black/30 focus:bg-black/30"
                  placeholder="My nickname"
                />
              </div>

              {/* Email field */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 transition-colors duration-200" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl h-14 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-0 pl-12 text-base transition-all duration-200 hover:bg-black/30 focus:bg-black/30"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password field */}
              <div className="relative">
                <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 transition-colors duration-200" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl h-14 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-0 pl-12 pr-12 text-base transition-all duration-200 hover:bg-black/30 focus:bg-black/30"
                  placeholder="Enter your password (8+ characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Create account button */}
              <Button
                type="submit"
                className="w-full bg-white/20 backdrop-blur-sm border border-white/20 hover:bg-white/30 text-white font-medium rounded-2xl h-14 mt-8 text-base transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create an account"}
              </Button>
            </form>
          </div>

          <div
            className={`transition-all duration-500 ease-in-out transform ${
              activeTab === "signin" ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 absolute inset-0"
            }`}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault()
                onSignIn(e)
              }}
              className="space-y-4"
            >
              {/* Email field */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 transition-colors duration-200" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl h-14 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-0 pl-12 text-base transition-all duration-200 hover:bg-black/30 focus:bg-black/30"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password field */}
              <div className="relative">
                <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 transition-colors duration-200" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl h-14 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-0 pl-12 pr-12 text-base transition-all duration-200 hover:bg-black/30 focus:bg-black/30"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Remember me and forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border border-white/20 bg-black/20 text-white focus:ring-white/20 focus:ring-2"
                  />
                  <span className="text-white/60 text-sm">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-white/60 hover:text-white text-sm transition-colors duration-200"
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign in button */}
              <Button
                type="submit"
                className="w-full bg-white/20 backdrop-blur-sm border border-white/20 hover:bg-white/30 text-white font-medium rounded-2xl h-14 mt-8 text-base transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center my-8">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="px-4 text-white/40 text-sm font-medium">
            {activeTab === "signup" ? "OR SIGN IN WITH" : "OR CONTINUE WITH"}
          </span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        {/* Gmail button */}
        <div className="flex justify-center">
          <button
            onClick={() => onSocialLogin("Gmail")}
            className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl h-14 px-8 flex items-center justify-center gap-3 hover:bg-black/30 transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
          >
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
              <div className="w-4 h-4 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 rounded-full"></div>
            </div>
            <span className="text-white font-medium">Gmail</span>
          </button>
        </div>


      </div>
    </div>
  )
}

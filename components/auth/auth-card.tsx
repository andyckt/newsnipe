"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Mail, Eye, EyeOff, User, Key } from "lucide-react"
import { SignInForm } from "./sign-in-form"
import { SignUpForm } from "./sign-up-form"
import { SocialLogin } from "./social-login"

interface AuthCardProps {
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  email: string
  setEmail: (email: string) => void
  password: string
  setPassword: (password: string) => void
  rememberMe: boolean
  setRememberMe: (remember: boolean) => void
  onForgotPassword: () => void
}

export function AuthCard({
  isLoading,
  setIsLoading,
  email,
  setEmail,
  password,
  setPassword,
  rememberMe,
  setRememberMe,
  onForgotPassword,
}: AuthCardProps) {
  const [activeTab, setActiveTab] = useState("signup")

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
            <SignUpForm 
              isLoading={isLoading} 
              setIsLoading={setIsLoading}
              password={password} 
              setPassword={setPassword} 
            />
          </div>

          <div
            className={`transition-all duration-500 ease-in-out transform ${
              activeTab === "signin" ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 absolute inset-0"
            }`}
          >
            {/* Sign In Form */}
            <SignInForm
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              email={email}
              setEmail={setEmail}
              rememberMe={rememberMe}
              setRememberMe={setRememberMe}
              onForgotPassword={onForgotPassword}
            />
          </div>
        </div>

        {/* Divider and Social Login */}
        <div className="mt-8">
          <SocialLogin 
            isLoading={isLoading} 
            type={activeTab as "signin" | "signup"} 
          />
        </div>
      </div>
    </div>
  )
}
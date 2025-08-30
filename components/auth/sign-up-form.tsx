"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SignUpFormProps {
  onSubmit?: (e: React.FormEvent) => void
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  password: string
  setPassword: (password: string) => void
}

export function SignUpForm({ 
  onSubmit, 
  isLoading, 
  setIsLoading, 
  password, 
  setPassword 
}: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (onSubmit) {
      onSubmit(e)
      return
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      // Call the signup API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error('An error occurred during signup')
      }

      toast({
        title: "Account created!",
        description: "Your account has been created successfully.",
      })

      // Sign in the user automatically after successful signup
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      router.push("/")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "An error occurred during signup",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="name" className="text-white font-medium flex items-center gap-2 text-base font-sans">
          <User className="w-4 h-4 text-[#8e8e93]" />
          Full Name
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="bg-[#2c2c2e] border border-[#3a3a3c] text-white placeholder:text-[#8e8e93] focus:border-[#007aff] focus:ring-2 focus:ring-[#007aff]/20 transition-all duration-200 rounded-2xl h-14 text-base font-sans"
        />
      </div>
      <div className="space-y-3">
        <Label htmlFor="signup-email" className="text-white font-medium flex items-center gap-2 text-base font-sans">
          <Mail className="w-4 h-4 text-[#8e8e93]" />
          Email
        </Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-[#2c2c2e] border border-[#3a3a3c] text-white placeholder:text-[#8e8e93] focus:border-[#007aff] focus:ring-2 focus:ring-[#007aff]/20 transition-all duration-200 rounded-2xl h-14 text-base font-sans"
        />
      </div>
      <div className="space-y-3">
        <Label htmlFor="signup-password" className="text-white font-medium flex items-center gap-2 text-base font-sans">
          <Lock className="w-4 h-4 text-[#8e8e93]" />
          Password
        </Label>
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-[#2c2c2e] border border-[#3a3a3c] text-white placeholder:text-[#8e8e93] focus:border-[#007aff] focus:ring-2 focus:ring-[#007aff]/20 transition-all duration-200 rounded-2xl h-14 pr-14 text-base font-sans"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-4 text-[#8e8e93] hover:text-white hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </Button>
        </div>
      </div>
      <div className="space-y-3">
        <Label htmlFor="confirm-password" className="text-white font-medium flex items-center gap-2 text-base font-sans">
          <Lock className="w-4 h-4 text-[#8e8e93]" />
          Confirm Password
        </Label>
        <div className="relative">
          <Input
            id="confirm-password"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="bg-[#2c2c2e] border border-[#3a3a3c] text-white placeholder:text-[#8e8e93] focus:border-[#007aff] focus:ring-2 focus:ring-[#007aff]/20 transition-all duration-200 rounded-2xl h-14 pr-14 text-base font-sans"
          />
        </div>
        {confirmPassword && password !== confirmPassword && (
          <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-[#007aff] hover:bg-[#0056cc] text-white font-medium transition-all duration-200 transform hover:scale-[1.01] shadow-lg rounded-2xl h-14 mt-8 text-base font-sans"
        disabled={isLoading || (confirmPassword && password !== confirmPassword)}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Creating account...
          </div>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  )
}
"use client"

import type React from "react"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SignInFormProps {
  onSubmit?: (e: React.FormEvent) => void
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  email: string
  setEmail: (email: string) => void
  rememberMe: boolean
  setRememberMe: (remember: boolean) => void
  onForgotPassword: () => void
}

export function SignInForm({
  onSubmit,
  isLoading,
  setIsLoading,
  email,
  setEmail,
  rememberMe,
  setRememberMe,
  onForgotPassword,
}: SignInFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (onSubmit) {
      onSubmit(e)
      return
    }

    try {
      setIsLoading(true)

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Sign in failed",
          description: "Invalid email or password",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Signed in successfully!",
        description: "Welcome back to your account.",
      })

      router.push("/")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "An error occurred during sign in",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="email" className="text-white font-medium flex items-center gap-2 text-base font-sans">
          <Mail className="w-4 h-4 text-[#8e8e93]" />
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-[#2c2c2e] border border-[#3a3a3c] text-white placeholder:text-[#8e8e93] focus:border-[#007aff] focus:ring-2 focus:ring-[#007aff]/20 transition-all duration-200 rounded-2xl h-14 text-base font-sans"
        />
      </div>
      <div className="space-y-3">
        <Label htmlFor="password" className="text-white font-medium flex items-center gap-2 text-base font-sans">
          <Lock className="w-4 h-4 text-[#8e8e93]" />
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
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

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center space-x-3">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={setRememberMe}
            className="border-[#3a3a3c] data-[state=checked]:bg-[#007aff] data-[state=checked]:border-[#007aff] rounded-lg"
          />
          <Label htmlFor="remember" className="text-base text-[#8e8e93] font-medium font-sans">
            Remember me
          </Label>
        </div>
        <Button
          type="button"
          variant="link"
          className="text-base text-[#007aff] hover:text-[#0056cc] p-0 font-medium font-sans"
          onClick={onForgotPassword}
        >
          Forgot password?
        </Button>
      </div>

      <Button
        type="submit"
        className="w-full bg-[#007aff] hover:bg-[#0056cc] text-white font-medium transition-all duration-200 transform hover:scale-[1.01] shadow-lg rounded-2xl h-14 mt-8 text-base font-sans"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Signing in...
          </div>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  )
}
"use client";

import { useState } from 'react';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const pulseGlow = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(168, 85, 247, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(168, 85, 247, 0);
  }
`;

const GlowingBorder = styled.span`
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  border: 1px solid rgba(139, 92, 246, 0.5);
  animation: ${pulseGlow} 2s infinite;
  pointer-events: none;
`;

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [isWaitlistDialogOpen, setIsWaitlistDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  
  const validateEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    if (newEmail && !validateEmail(newEmail)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    setEmailError('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(data.message || 'Successfully joined the waitlist!');
        setEmail('');
        setTimeout(() => {
          setIsWaitlistDialogOpen(false);
        }, 4000);
      } else {
        setMessage(data.error || 'Failed to join waitlist. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInvitationCodeSubmit = () => {
    if (invitationCode.toUpperCase() === 'SNIPE2025') {
      window.location.href = '/'; // Redirect to the root URL of this project
    } else {
      setMessage('Invalid invitation code');
    }
  };
  
  return (
    <div className="flex flex-col sm:flex-row gap-4 pt-4">
      <Dialog open={isWaitlistDialogOpen} onOpenChange={setIsWaitlistDialogOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg rounded-full group"
          >
            Join Waitlist
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gradient-to-b from-gray-900 to-black text-white border-none rounded-3xl shadow-2xl shadow-purple-500/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light tracking-wide bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Join Our Waitlist</DialogTitle>
          </DialogHeader>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-500/30 to-transparent my-4"></div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
                required
                className={`bg-gray-900/50 border ${emailError ? 'border-red-500/50' : 'border-purple-500/20'} rounded-xl py-6 px-4 focus:border-purple-500/50 focus:ring-purple-500/30 backdrop-blur-sm transition-all duration-300 group-hover:border-purple-500/30 text-center`}
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-blue-500/5 pointer-events-none transform transition-transform duration-300 group-hover:scale-[1.02] opacity-0 group-hover:opacity-100"></div>
              {emailError && (
                <div className="text-red-400 text-xs mt-1 text-center">
                  {emailError}
                </div>
              )}
            </div>
            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 py-6 rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:scale-[1.02] font-medium"
            >
              {isLoading ? 'Joining...' : 'Join Waitlist'}
            </Button>
            {message && (
              <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                <p className="text-center text-sm font-light text-purple-300">{message}</p>
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="lg"
            className="border-none text-white px-8 py-6 text-lg rounded-full bg-transparent relative overflow-hidden"
          >
            <span className="relative z-10">Invitation Code</span>
            <GlowingBorder />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gradient-to-b from-gray-900 to-black text-white border-none rounded-3xl shadow-2xl shadow-purple-500/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light tracking-wide bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Enter Invitation Code</DialogTitle>
          </DialogHeader>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-500/30 to-transparent my-4"></div>
          <form onSubmit={(e) => { e.preventDefault(); handleInvitationCodeSubmit(); }} className="space-y-6">
            <div className="relative group">
              <Input
                type="text"
                placeholder="Enter code"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value)}
                className="bg-gray-900/50 border border-purple-500/20 rounded-xl py-6 px-4 focus:border-purple-500/50 focus:ring-purple-500/30 backdrop-blur-sm transition-all duration-300 group-hover:border-purple-500/30 text-center uppercase tracking-wider"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleInvitationCodeSubmit();
                  }
                }}
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-blue-500/5 pointer-events-none transform transition-transform duration-300 group-hover:scale-[1.02] opacity-0 group-hover:opacity-100"></div>
            </div>
            <Button 
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 py-6 rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:scale-[1.02] font-medium"
            >
              Start Sniping
            </Button>
            {message && (
              <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                <p className="text-center text-sm font-light text-purple-300">{message}</p>
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

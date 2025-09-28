"use client"

import { useState } from "react"
import { Star, ThumbsUp, X } from "lucide-react"

interface SubmissionDecisionProps {
  onDecision: (decision: string) => void
  currentDecision?: string
}

export function SubmissionDecision({ onDecision, currentDecision }: SubmissionDecisionProps) {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null)
  
  const options = [
    {
      id: "like",
      label: "I like this one",
      icon: Star,
      color: "bg-amber-500",
      hoverColor: "bg-amber-600",
      textColor: "text-amber-500",
      borderColor: "border-amber-500"
    },
    {
      id: "potential",
      label: "Not bad",
      icon: ThumbsUp,
      color: "bg-blue-500",
      hoverColor: "bg-blue-600",
      textColor: "text-blue-500",
      borderColor: "border-blue-500"
    },
    {
      id: "reject",
      label: "Nah",
      icon: X,
      color: "bg-red-500",
      hoverColor: "bg-red-600",
      textColor: "text-red-500",
      borderColor: "border-red-500"
    }
  ]

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
        {options.map((option) => {
          const isSelected = currentDecision === option.id
          const isHovered = hoveredOption === option.id
          
          return (
            <button
              key={option.id}
              onClick={() => {
                // If already selected, cancel the decision by passing null
                if (isSelected) {
                  onDecision('');
                } else {
                  onDecision(option.id);
                }
                // Immediately blur the button to prevent it from capturing keyboard events
                (document.activeElement as HTMLElement)?.blur();
              }}
              onMouseEnter={() => setHoveredOption(option.id)}
              onMouseLeave={() => setHoveredOption(null)}
              // Add tabIndex=-1 to prevent the button from receiving focus via tab navigation
              tabIndex={-1}
              className={`
                relative flex items-center justify-center rounded-xl px-4 py-3
                active:scale-95 transition-all duration-300
                ${isSelected 
                  ? `${option.color} text-white border-2 border-transparent` 
                  : `bg-white border-2 border-gray-200 text-gray-600 hover:border-gray-500`
                }
                hover:scale-105
                group
                focus:outline-none
              `}
            >
              <div className="flex items-center">
                <option.icon 
                  size={20} 
                  className={isSelected ? 'text-white' : option.textColor} 
                />
                <span className="ml-2 font-medium">{option.label}</span>
              </div>
              
              {/* No hover effect */}
              
              {/* Selection indicator removed */}
            </button>
          )
        })}
      </div>
    </div>
  )
}

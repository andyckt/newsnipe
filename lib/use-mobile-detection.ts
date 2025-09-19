/**
 * Mobile detection utility for Snipe
 * Restricts access to mobile phones only, excluding tablets, desktops, and laptops
 */

import { useEffect, useState } from 'react';

export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(true); // Default to true to avoid flash on mobile
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Function to detect if the device is specifically a mobile phone (not tablets)
    function isMobilePhone() {
      // Only run on client side
      if (typeof window === 'undefined') return false;
      
      // Method 1: Check user agent for mobile phones specifically
      const userAgent = navigator.userAgent.toLowerCase();
      const mobilePhoneKeywords = ['android', 'iphone', 'ipod', 'windows phone', 'blackberry'];
      const tabletKeywords = ['ipad', 'tablet'];
      
      // Check if it's a mobile device but NOT a tablet
      const isMobileUserAgent = mobilePhoneKeywords.some(keyword => userAgent.includes(keyword));
      const isTabletUserAgent = tabletKeywords.some(keyword => userAgent.includes(keyword));
      
      // Method 2: Check screen size - most phones are narrower than tablets
      // Typical phone width is under 600px
      const isPhoneScreenSize = window.innerWidth < 600;
      
      // Method 3: Check aspect ratio - phones typically have taller aspect ratios
      const aspectRatio = window.innerWidth / window.innerHeight;
      const isPhoneAspectRatio = aspectRatio < 0.8 || aspectRatio > 1.3;
      
      // Method 4: Check touch capability
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Consider it a mobile phone if:
      // 1. It has a mobile user agent but not a tablet user agent
      // 2. It has a phone-sized screen
      // 3. It has touch capability
      
      // Calculate a score based on these criteria
      let mobileScore = 0;
      if (isMobileUserAgent && !isTabletUserAgent) mobileScore += 2; // Higher weight for user agent
      if (isPhoneScreenSize) mobileScore++;
      if (isPhoneAspectRatio) mobileScore++;
      if (isTouchDevice) mobileScore++;
      
      console.log('Mobile phone detection scores:', {
        userAgent: isMobileUserAgent && !isTabletUserAgent,
        screenSize: isPhoneScreenSize,
        aspectRatio: isPhoneAspectRatio,
        touchDevice: isTouchDevice,
        totalScore: mobileScore
      });
      
      // Require a higher threshold to ensure it's specifically a phone
      return mobileScore >= 3;
    }

    // Check if mobile and update state
    const checkIfMobile = () => {
      const result = isMobilePhone();
      setIsMobile(result);
      setIsLoading(false);
    };

    // Run the check
    checkIfMobile();

    // Re-check on resize (in case of device rotation)
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  return { isMobile, isLoading };
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { ParticleBackground } from "../components/particle-background"
import { GradientBackground } from "../components/gradient-background"

export default function Home() {
  const [particlesError, setParticlesError] = useState(false)

  useEffect(() => {
    // Add error handling for particles
    const handleError = (event) => {
      if (event.message.includes("tsparticles")) {
        setParticlesError(true)
      }
    }

    window.addEventListener("error", handleError)

    return () => {
      window.removeEventListener("error", handleError)
    }
  }, [])

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Left side - Background Animation */}
      <div className="relative w-full md:w-1/2 h-full">
        {particlesError ? <GradientBackground /> : <ParticleBackground />}
      </div>

      {/* Right side - Content */}
      <div className="hidden md:flex w-1/2 h-full bg-background flex-col justify-center items-start p-12">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Step Into Your Own Starter template </h1>
          <p className="text-muted-foreground mb-8">Create & develop fast </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => window.location.href='/login'}>Login</Button>
            <Button onClick={() =>window.location.href='/signup'} variant="outline">
              Sign Up
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile view - Content overlay */}
      <div className="absolute inset-0 flex md:hidden flex-col justify-center items-center p-6 bg-black/50 text-white">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Step Into Your Own 2D World</h1>
          <p className="mb-8">Create, Explore, and Hang Out in a Personalized 2D Metaverse</p>
          <div className="flex flex-col gap-4">
            <Button onClick={() => window.location.href='/login'} className="w-full">
              Login
            </Button>
            <Button onClick={() =>window.location.href='/sinup'} variant="outline" className="w-full">
              Sign Up
            </Button>
            <Button onClick={() =>window.location.href='/metaverse'} variant="ghost" className="w-full">
              Explore as Guest
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

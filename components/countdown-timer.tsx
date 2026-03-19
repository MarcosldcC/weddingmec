'use client'

import { useEffect, useState } from 'react'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function CountdownTimer({
  targetDate,
  variant = 'default',
}: {
  targetDate: string
  variant?: 'default' | 'minimal'
}) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetDate).getTime()
      const now = new Date().getTime()
      const difference = target - now

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  if (!timeLeft) {
    return (
      <div className="flex gap-4 justify-center">
        <div className="text-center">
          <div className={variant === 'minimal' ? 'text-3xl font-light text-white' : 'text-3xl font-bold text-primary'}>-</div>
        </div>
      </div>
    )
  }

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="text-center">
      {variant === 'minimal' ? (
        <>
          <div className="font-serif text-4xl sm:text-5xl font-light text-white">
            {String(value).padStart(2, '0')}
          </div>
          <p className="mt-2 text-xs sm:text-sm text-white/70 font-medium uppercase tracking-wider">
            {label}
          </p>
        </>
      ) : (
        <>
          <div className="bg-secondary/30 rounded-lg p-4 min-w-20">
            <div className="text-4xl md:text-5xl font-bold text-primary font-serif">
              {String(value).padStart(2, '0')}
            </div>
          </div>
          <p className="mt-3 text-sm text-foreground/60 font-medium uppercase tracking-wider">
            {label}
          </p>
        </>
      )}
    </div>
  )

  return (
    <div
      className={
        variant === 'minimal'
          ? 'flex gap-6 md:gap-10 justify-center flex-wrap'
          : 'flex gap-2 md:gap-4 justify-center flex-wrap'
      }
    >
      <TimeUnit value={timeLeft.days} label="Dias" />
      <TimeUnit value={timeLeft.hours} label="Horas" />
      <TimeUnit value={timeLeft.minutes} label="Minutos" />
      <TimeUnit value={timeLeft.seconds} label="Segundos" />
    </div>
  )
}

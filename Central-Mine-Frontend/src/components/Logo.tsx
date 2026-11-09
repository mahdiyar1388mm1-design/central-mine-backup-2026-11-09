import logoMark from '../assets/logo-mark.png'

type LogoProps = {
  className?: string
}

// Real "ماین" wordmark, provided directly by the client.
export default function Logo({ className = '' }: LogoProps) {
  return <img src={logoMark} alt="ماین" className={`h-8 w-auto select-none ${className}`} />
}

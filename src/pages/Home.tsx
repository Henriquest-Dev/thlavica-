import { Hero } from '../sections/Hero'
import { Intro } from '../sections/Intro'
import { Solutions } from '../sections/Solutions'
import { Featured } from '../sections/Featured'
import { Brands } from '../sections/Brands'
import { Tools } from '../sections/Tools'
import { Faq } from '../sections/Faq'
import { Closing } from '../sections/Closing'
import { PromoBanner } from '../components/Promos'
import { useReveal } from '../lib/useReveal'
import { useMeta } from '../lib/useMeta'

export default function Home() {
  useMeta('')
  useReveal()
  return (
    <>
      <Hero />
      <PromoBanner />
      <Intro />
      <Solutions />
      <Featured />
      <Tools />
      <Brands />
      <Faq />
      <Closing />
    </>
  )
}

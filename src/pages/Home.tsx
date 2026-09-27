import { Hero } from '../sections/Hero'
import { Intro } from '../sections/Intro'
import { Solutions } from '../sections/Solutions'
import { Featured } from '../sections/Featured'
import { Context } from '../sections/Context'
import { Faq } from '../sections/Faq'
import { Closing } from '../sections/Closing'
import { useReveal } from '../lib/useReveal'
import { useMeta } from '../lib/useMeta'

export default function Home() {
  useMeta('')
  useReveal()
  return (
    <>
      <Hero />
      <Intro />
      <Solutions />
      <Featured />
      <Context />
      <Faq />
      <Closing />
    </>
  )
}

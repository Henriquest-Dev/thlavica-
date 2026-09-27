import { Hero } from '../sections/Hero'
import { Statement } from '../sections/Statement'
import { Paths } from '../sections/Paths'
import { Services } from '../sections/Services'
import { Context } from '../sections/Context'
import { Categories } from '../sections/Categories'
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
      <Statement />
      <Paths />
      <Services />
      <Context />
      <Categories />
      <Faq />
      <Closing />
    </>
  )
}

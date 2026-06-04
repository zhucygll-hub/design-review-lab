import HeroSection from '@/components/home/HeroSection'
import EntryCards from '@/components/home/EntryCards'
import FeaturesGrid from '@/components/home/FeaturesGrid'
import CareerPreviewCard from '@/components/home/CareerPreviewCard'
import CaseShowcase from '@/components/home/CaseShowcase'
import Testimonials from '@/components/home/Testimonials'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <EntryCards />
      <FeaturesGrid />
      <CareerPreviewCard />
      <CaseShowcase />
      <Testimonials />
    </>
  )
}

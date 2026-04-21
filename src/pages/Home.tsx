import Hero from '@/components/home/Hero';
import BrandStory from '@/components/home/BrandStory';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import SacredCollection from '@/components/home/SacredCollection';
import ParallaxGallery from '@/components/home/ParallaxGallery';
import Newsletter from '@/components/home/Newsletter';

export default function Home() {
  return (
    <main>
      <Hero />
      <BrandStory />
      <FeaturedProducts />
      <SacredCollection />
      <ParallaxGallery />
      <Newsletter />
    </main>
  );
}

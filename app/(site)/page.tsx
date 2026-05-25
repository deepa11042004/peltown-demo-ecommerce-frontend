import HeroSec from "@/components/HeroSec";
import ProductSec from "@/components/ProductSec";
import CustomerSec from "@/components/CustomerSec";
import BannerSec from "@/components/BannerSec";
import AboutNutsSec from "@/components/AboutNuts";
import BannerDetSec from "@/components/BannerDetSec";
import MarqueSec from "@/components/MarqueSec";
import AllProduct from "@/components/AllProduct";

function page() {
  return (
    <main>
      <HeroSec />
      <ProductSec />
      <CustomerSec />
      <BannerSec/>
      <AboutNutsSec/>
      <BannerDetSec/>
      <MarqueSec/>
      <AllProduct/>
    </main>
  );
}

export default page;

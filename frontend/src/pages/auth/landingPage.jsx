import React from "react";
import HeroSection from "../../components/landing/HeroSection";
import PopularCities from "../../components/landing/PopularCities";
import Footer from "../../components/landing/Footer";
import WhyChooseUs from "../../components/landing/WhyChooseUs";

function LandingPage() {
  return (
    <>
    
      <div className="">
        <HeroSection />
      </div>
      <PopularCities />
      <div id="why-choose-us">
        <WhyChooseUs />
      </div>
      <Footer />
    </>
  );
}

export default LandingPage;

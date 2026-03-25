import React from "react";
import HeroSection from "../../components/landing/HeroSection";
import PopularCities from "../../components/landing/PopularCities";
import Footer from "../../components/landing/Footer";
import WhyChooseUs from "../../components/landing/WhyChooseUs";
import BudgetPlanner from "../../components/landing/BudgetPlanner";

function LandingPage() {
  return (
    <>
      <div className="">
        <HeroSection />
      </div>
      <PopularCities />
      <div id="why-choose-us" style={{ marginTop: "30px" }}>
        <WhyChooseUs />
      </div>
      <BudgetPlanner />
      <Footer />
    </>
  );
}

export default LandingPage;

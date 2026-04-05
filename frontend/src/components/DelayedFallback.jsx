// DelayedFallback.jsx
import { useEffect, useState } from "react";
import HeroSectionSkeleton from "./HeroSectionSkeleton";


export default function DelayedFallback() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, 240); // wait 150ms before showing loader

    return () => clearTimeout(timer);
  }, []);

  return show ? <HeroSectionSkeleton/> : null;
}
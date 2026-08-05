// DelayedFallback.jsx
import { useEffect, useState } from "react";
import PageSkeleton from "./PageSkeleton";

export default function DelayedFallback() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  return show ? <PageSkeleton /> : null;
}
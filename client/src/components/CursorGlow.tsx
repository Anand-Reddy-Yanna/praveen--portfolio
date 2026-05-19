import { useEffect } from "react";
import { motion, useSpring } from "framer-motion";

export default function CursorGlow() {
  const x = useSpring(0, { stiffness: 120, damping: 28, mass: 0.4 });
  const y = useSpring(0, { stiffness: 120, damping: 28, mass: 0.4 });

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
    };

    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, [x, y]);

  return <motion.div className="cursor-glow hidden md:block" style={{ left: x, top: y }} />;
}

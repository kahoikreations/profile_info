
import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

const CoffeeLottie: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    const anim = lottie.loadAnimation({
      container: container.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: 'https://assets9.lottiefiles.com/packages/lf20_96bovdur.json'
    });
    return () => anim.destroy();
  }, []);

  return <div ref={container} className="w-32 h-32 mx-auto" />;
};

export default CoffeeLottie;

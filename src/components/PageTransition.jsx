import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const PageTransition = ({ children, pageKey }) => {
  const wrapperRef = useRef(null);
  const prevKeyRef = useRef(pageKey);

  useEffect(() => {
    if (!wrapperRef.current) return;

    if (prevKeyRef.current !== pageKey) {
      // Already handled by parent — skip first render
      prevKeyRef.current = pageKey;
    }

    // Animate in every time this mounts
    gsap.fromTo(
      wrapperRef.current,
      { opacity: 0, y: 22, filter: 'blur(6px)' },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.55,
        ease: 'power3.out',
      }
    );
  }, [pageKey]);

  return (
    <div ref={wrapperRef} className="page-transition-wrapper">
      {children}
      <style dangerouslySetInnerHTML={{__html: `
        .page-transition-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          will-change: opacity, transform, filter;
        }
      `}} />
    </div>
  );
};

export default PageTransition;

import { useEffect } from 'react';

/**
 * Reference-counted body scroll locking utility.
 * Prevents background scrolling when one or more modals are open,
 * and ensures internal modal scrolling works smoothly.
 */
let activeModalsCount = 0;
let originalBodyOverflow = '';
let originalHtmlOverflow = '';
let originalBodyPaddingRight = '';

export const lockBodyScroll = () => {
  if (typeof document === 'undefined') return;

  activeModalsCount++;
  if (activeModalsCount === 1) {
    originalBodyOverflow = document.body.style.overflow;
    originalHtmlOverflow = document.documentElement.style.overflow;
    originalBodyPaddingRight = document.body.style.paddingRight;

    // Compensate for scrollbar disappearance on desktop to avoid layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.body.classList.add('modal-scroll-locked');
    document.documentElement.classList.add('modal-scroll-locked');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }
};

export const unlockBodyScroll = () => {
  if (typeof document === 'undefined') return;

  activeModalsCount = Math.max(0, activeModalsCount - 1);
  if (activeModalsCount === 0) {
    document.body.classList.remove('modal-scroll-locked');
    document.documentElement.classList.remove('modal-scroll-locked');
    document.body.style.overflow = originalBodyOverflow;
    document.documentElement.style.overflow = originalHtmlOverflow;
    document.body.style.paddingRight = originalBodyPaddingRight;
  }
};

export const useBodyScrollLock = (isOpen) => {
  useEffect(() => {
    if (!isOpen) return;

    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, [isOpen]);
};

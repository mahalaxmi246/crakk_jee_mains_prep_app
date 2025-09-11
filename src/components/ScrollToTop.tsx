import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Don't scroll if it's a hash/anchor navigation
    if (location.hash) {
      return;
    }

    // Check if returning from PYQ question to chapter page
    const isReturningFromPYQQuestion = 
      location.state?.source === 'pyq-return' && 
      location.pathname.includes('/pyq/') && 
      !location.pathname.includes('/question/');

    // If returning from PYQ question, don't reset scroll (preserve position)
    if (isReturningFromPYQQuestion) {
      return;
    }

    // For all other navigations, scroll to top immediately
    // Reset window scroll
    window.scrollTo(0, 0);
    
    // Reset any scrollable main content containers
    const mainContainers = document.querySelectorAll('main, [role="main"], .main-content, .content-area');
    mainContainers.forEach(container => {
      if (container.scrollTop > 0) {
        container.scrollTop = 0;
      }
    });

    // Reset any other common scrollable containers
    const scrollableContainers = document.querySelectorAll('.overflow-y-auto, .overflow-auto, .scrollable');
    scrollableContainers.forEach(container => {
      if (container.scrollTop > 0) {
        container.scrollTop = 0;
      }
    });

  }, [location.pathname, location.search, location.key]);

  return null;
};

export default ScrollToTop;
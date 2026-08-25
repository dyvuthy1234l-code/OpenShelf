/**
 * OpenShelf Global Motion Tokens
 * Standardized Framer Motion variants & duration tokens for smooth, premium UI.
 */

export const MOTION_DURATIONS = {
  FAST: 0.15,     // 150ms: Buttons, icons, tooltips, dropdowns
  NORMAL: 0.20,   // 200ms: Page entry, cards, small list items
  MODAL: 0.22,    // 220ms: Dialogs, popups, detail panels
  SIDEBAR: 0.28,  // 280ms: Sidebar collapse/expand, drawer slide
};

export const MOTION_EASINGS = {
  PREMIUM: [0.16, 1, 0.3, 1], // Smooth snappy cubic-bezier
  EASE_OUT: 'easeOut',
  EASE_IN_OUT: 'easeInOut',
};

// Page Entrance Animation Token
export const PAGE_MOTION_VARIANTS = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: MOTION_DURATIONS.NORMAL, ease: MOTION_EASINGS.EASE_OUT },
};

// Subtle Card Hover Token (BookCard, LibraryCard, CategoryCard)
export const CARD_MOTION_PROPS = {
  whileHover: { y: -6, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

// Button Press / Hover Token
export const BUTTON_MOTION_PROPS = {
  whileHover: { y: -1 },
  whileTap: { scale: 0.98 },
  transition: { duration: MOTION_DURATIONS.FAST, ease: MOTION_EASINGS.EASE_OUT },
};

// Dropdown Menu Popover Token
export const DROPDOWN_MOTION_VARIANTS = {
  initial: { opacity: 0, y: -4, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -4, scale: 0.98 },
  transition: { duration: MOTION_DURATIONS.FAST, ease: MOTION_EASINGS.EASE_OUT },
};

// Modal Popup Token
export const MODAL_MOTION_VARIANTS = {
  initial: { opacity: 0, scale: 0.98, y: 4 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98, y: 4 },
  transition: { duration: MOTION_DURATIONS.MODAL, ease: MOTION_EASINGS.PREMIUM },
};

// Modal Backdrop Overlay Token
export const BACKDROP_MOTION_VARIANTS = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: MOTION_DURATIONS.FAST, ease: MOTION_EASINGS.EASE_OUT },
};

// Sidebar Slide Token
export const SIDEBAR_SLIDE_VARIANTS = {
  initial: { x: '-100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '-100%', opacity: 0 },
  transition: { duration: MOTION_DURATIONS.SIDEBAR, ease: MOTION_EASINGS.EASE_OUT },
};

// ---------- List / Grid Stagger Tokens ----------
// Parent container: <motion.div variants={LIST_STAGGER} initial="initial" animate="animate">
// Children:         <motion.div variants={LIST_ITEM}>
export const LIST_STAGGER = {
  animate: {
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
};

export const LIST_ITEM = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: MOTION_DURATIONS.NORMAL, ease: MOTION_EASINGS.PREMIUM } },
};

// Scroll-triggered reveal for public page sections
export const REVEAL_VARIANTS = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.45, ease: MOTION_EASINGS.PREMIUM },
};

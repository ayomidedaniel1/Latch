const fs = require('fs');
const path = require('path');

const targetDir = 'c:\\Users\\ADMIN\\OneDrive\\Documents\\Neon\\Scouting\\banks-excavation-and-land-clearing';

// 1. STYLES.CSS (COMPREHENSIVE FULL RESPONSIVE MOBILE-FIRST & DESKTOP SYSTEM)
const cssContent = `/* ==========================================================================
   BANKS EXCAVATION & LAND CLEARING — 100% FLAT & MOBILE-RESPONSIVE SYSTEM
   LOCATION: Chatsworth, GA (Murray County)
   STRICT RULES:
   - NO GRADIENTS ANYWHERE (Pure solid color blocks only)
   - NO BOX SHADOWS, TEXT SHADOWS, OR DROP SHADOWS
   - 100% MOBILE & TABLET RESPONSIVE (320px to 4K)
   - TOUCH-FRIENDLY TAP TARGETS (>= 44px)
   - ZERO HORIZONTAL OVERFLOW
   ========================================================================== */

:root {
  /* Solid Color Palette - Heavy Equipment & Local Contractor Theme */
  --color-orange-primary: #E65100;
  --color-orange-hover: #BF360C;
  --color-amber-accent: #FFB300;
  --color-amber-hover: #FFA000;
  
  --color-charcoal-dark: #121212;
  --color-charcoal-card: #1C1C1C;
  --color-charcoal-surface: #262626;
  --color-charcoal-light: #333333;
  
  --color-stone-light: #F8F8F8;
  --color-stone-card: #FFFFFF;
  --color-stone-border: #E0E0E0;
  
  --color-white: #FFFFFF;
  --color-black: #000000;
  
  --color-text-main: #1F1F1F;
  --color-text-muted: #616161;
  --color-text-light: #F0F0F0;
  --color-text-light-muted: #A0A0A0;
  
  --color-border-dark: #2E2E2E;
  --color-border-light: #E0E0E0;
  --color-border-orange: #E65100;
  --color-border-amber: #FFB300;
  
  /* Typography */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --font-display: 'Montserrat', 'Inter', sans-serif;
  
  /* Spacing */
  --max-width-container: 1200px;
  --header-height: 72px;
}

/* Base Reset & Global Rules */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  box-shadow: none !important;
  text-shadow: none !important;
  background-image: none !important; /* STRICT ENFORCEMENT: NO GRADIENTS */
}

html {
  scroll-behavior: smooth;
  font-size: 16px;
  background-color: var(--color-white);
  color: var(--color-text-main);
  font-family: var(--font-primary);
  line-height: 1.65;
  overflow-x: hidden;
  width: 100%;
}

body {
  overflow-x: hidden;
  width: 100%;
  position: relative;
  background-color: var(--color-white);
  -webkit-text-size-adjust: 100%;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

a {
  color: inherit;
  text-decoration: none;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

button, input, select, textarea {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  border: none;
  outline: none;
}

ul, ol {
  list-style: none;
}

/* Container */
.container {
  width: 100%;
  max-width: var(--max-width-container);
  margin-left: auto;
  margin-right: auto;
  padding-left: 24px;
  padding-right: 24px;
}

/* Typography & Headings */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.01em;
  color: inherit;
  word-break: break-word;
}

.kicker {
  display: inline-block;
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 4px 10px;
  background-color: var(--color-orange-primary);
  color: var(--color-white);
  margin-bottom: 16px;
}

.kicker.kicker-yellow {
  background-color: var(--color-amber-accent);
  color: var(--color-charcoal-dark);
}

.kicker.kicker-dark {
  background-color: var(--color-charcoal-dark);
  color: var(--color-amber-accent);
  border: 1px solid var(--color-border-dark);
}

.section-title-wrap {
  text-align: center;
  max-width: 760px;
  margin: 0 auto 56px auto;
}

.section-title {
  font-size: 2.25rem;
  margin-bottom: 16px;
  line-height: 1.2;
}

.section-subtitle {
  font-size: 1.0625rem;
  color: var(--color-text-muted);
  line-height: 1.7;
}

/* Solid Flat Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 0.875rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  padding: 12px 24px;
  cursor: pointer;
  border-radius: 0;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  text-align: center;
  white-space: nowrap;
  min-height: 44px;
}

.btn-orange {
  background-color: var(--color-orange-primary);
  color: var(--color-white);
  border: 2px solid var(--color-orange-primary);
}
.btn-orange:hover {
  background-color: var(--color-orange-hover);
  border-color: var(--color-orange-hover);
}

.btn-yellow {
  background-color: var(--color-amber-accent);
  color: var(--color-charcoal-dark);
  border: 2px solid var(--color-amber-accent);
}
.btn-yellow:hover {
  background-color: var(--color-amber-hover);
  border-color: var(--color-amber-hover);
}

.btn-charcoal {
  background-color: var(--color-charcoal-dark);
  color: var(--color-white);
  border: 2px solid var(--color-charcoal-dark);
}
.btn-charcoal:hover {
  background-color: var(--color-orange-primary);
  border-color: var(--color-orange-primary);
}

.btn-outline-white {
  background-color: transparent;
  color: var(--color-white);
  border: 2px solid var(--color-white);
}
.btn-outline-white:hover {
  background-color: var(--color-white);
  color: var(--color-charcoal-dark);
}

.btn-outline-orange {
  background-color: transparent;
  color: var(--color-orange-primary);
  border: 2px solid var(--color-orange-primary);
}
.btn-outline-orange:hover {
  background-color: var(--color-orange-primary);
  color: var(--color-white);
}

.btn-lg {
  padding: 16px 32px;
  font-size: 1rem;
  min-height: 52px;
}

.btn-sm {
  padding: 10px 18px;
  font-size: 0.8125rem;
  min-height: 40px;
}

/* ==========================================================================
   TOP ANNOUNCEMENT BAR
   ========================================================================== */

.top-announcement-bar {
  background-color: var(--color-black);
  color: var(--color-text-light);
  border-bottom: 1px solid var(--color-charcoal-surface);
  font-size: 0.8125rem;
  padding: 8px 0;
}
.top-announcement-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.announcement-left {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}
.announcement-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.announcement-item svg {
  fill: var(--color-amber-accent);
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
.announcement-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.announcement-right a {
  color: var(--color-amber-accent);
  font-weight: 700;
}
.announcement-right a:hover {
  text-decoration: underline;
}

/* ==========================================================================
   MAIN NAVIGATION HEADER (DESKTOP & RESPONSIVE MOBILE)
   ========================================================================== */

.main-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: var(--color-charcoal-dark);
  border-bottom: 3px solid var(--color-orange-primary);
  width: 100%;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
  gap: 16px;
}

/* Brand Logo Block */
.logo-link {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  z-index: 1002;
}
.logo-img {
  width: 44px;
  height: 44px;
  object-fit: cover;
  border: 2px solid var(--color-orange-primary);
  flex-shrink: 0;
}
.logo-text-block {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.logo-title {
  font-size: 1.0625rem;
  font-weight: 800;
  color: var(--color-white);
  letter-spacing: 0.02em;
  text-transform: uppercase;
  line-height: 1.15;
}
.logo-subtitle {
  font-size: 0.6875rem;
  color: var(--color-amber-accent);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-top: 2px;
}

/* Desktop Navigation Menu */
.nav-menu {
  display: flex;
  align-items: center;
  gap: 28px;
}
.nav-link {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.8125rem;
  color: var(--color-text-light);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 8px 0;
  border-bottom: 2px solid transparent;
}
.nav-link:hover, .nav-link.active {
  color: var(--color-amber-accent);
  border-bottom-color: var(--color-amber-accent);
}

/* Header Right Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.header-call-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-charcoal-card);
  color: var(--color-white);
  border: 2px solid var(--color-border-dark);
  padding: 10px 14px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 0.8125rem;
  letter-spacing: 0.02em;
  min-height: 40px;
}
.header-call-btn:hover {
  border-color: var(--color-amber-accent);
  color: var(--color-amber-accent);
}
.header-call-btn svg {
  fill: var(--color-amber-accent);
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.mobile-menu-toggle {
  display: none;
  background-color: var(--color-charcoal-card);
  border: 2px solid var(--color-border-dark);
  color: var(--color-white);
  padding: 10px 14px;
  cursor: pointer;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 0.875rem;
  min-height: 44px;
  min-width: 44px;
  align-items: center;
  justify-content: center;
  z-index: 1002;
}
.mobile-menu-toggle:hover {
  border-color: var(--color-orange-primary);
  color: var(--color-amber-accent);
}

/* ==========================================================================
   HERO SECTION
   ========================================================================== */

.hero-section {
  background-color: var(--color-charcoal-dark);
  color: var(--color-white);
  padding: 88px 0 80px 0;
  border-bottom: 4px solid var(--color-charcoal-surface);
}

.hero-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 56px;
  align-items: center;
}

.hero-content h1 {
  font-size: 2.75rem;
  line-height: 1.15;
  margin-bottom: 24px;
  color: var(--color-white);
}
.hero-content h1 span.highlight-orange {
  color: var(--color-orange-primary);
}

.hero-subhead {
  font-size: 1.125rem;
  color: var(--color-text-light);
  line-height: 1.7;
  margin-bottom: 36px;
}

.hero-cta-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 48px;
}

.hero-trust-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.hero-trust-badge {
  background-color: var(--color-charcoal-card);
  border-left: 4px solid var(--color-orange-primary);
  border-top: 1px solid var(--color-border-dark);
  border-right: 1px solid var(--color-border-dark);
  border-bottom: 1px solid var(--color-border-dark);
  padding: 16px 18px;
}
.hero-trust-badge .badge-title {
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 800;
  color: var(--color-amber-accent);
  margin-bottom: 4px;
}
.hero-trust-badge .badge-desc {
  font-size: 0.8125rem;
  color: var(--color-text-light-muted);
  line-height: 1.5;
}

.hero-card-panel {
  background-color: var(--color-charcoal-card);
  border: 3px solid var(--color-border-dark);
  padding: 36px 32px;
}
.hero-card-panel-header {
  border-bottom: 2px solid var(--color-charcoal-surface);
  padding-bottom: 18px;
  margin-bottom: 24px;
}
.hero-card-panel-header h3 {
  font-size: 1.375rem;
  color: var(--color-white);
  margin-bottom: 6px;
}
.hero-card-panel-header p {
  font-size: 0.875rem;
  color: var(--color-text-light-muted);
}
.hero-direct-call-box {
  background-color: var(--color-charcoal-surface);
  border-left: 4px solid var(--color-amber-accent);
  padding: 18px;
  margin-top: 28px;
}
.hero-direct-call-box .call-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: var(--color-amber-accent);
}
.hero-direct-call-box .call-number {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--color-white);
  display: block;
  margin-top: 4px;
}

/* ==========================================================================
   SERVICES SECTION
   ========================================================================== */

.services-section {
  background-color: var(--color-white);
  padding: 96px 0;
  border-bottom: 1px solid var(--color-stone-border);
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 36px;
}

.service-card {
  background-color: var(--color-white);
  border: 2px solid var(--color-stone-border);
  display: flex;
  flex-direction: column;
}
.service-card:hover {
  border-color: var(--color-orange-primary);
}

.service-img-wrapper {
  position: relative;
  height: 230px;
  overflow: hidden;
  background-color: var(--color-charcoal-dark);
  border-bottom: 2px solid var(--color-stone-border);
}
.service-img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.service-tag {
  position: absolute;
  top: 14px;
  left: 14px;
  background-color: var(--color-orange-primary);
  color: var(--color-white);
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 8px;
}

.service-content {
  padding: 32px 26px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.service-content h3 {
  font-size: 1.25rem;
  margin-bottom: 12px;
  color: var(--color-charcoal-dark);
}
.service-content p {
  font-size: 0.9375rem;
  color: var(--color-text-muted);
  line-height: 1.65;
  margin-bottom: 24px;
}

.service-feature-list {
  margin-top: auto;
  padding-top: 18px;
  border-top: 1px solid var(--color-stone-border);
  margin-bottom: 24px;
}
.service-feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-charcoal-dark);
  margin-bottom: 10px;
}
.service-feature-item svg {
  width: 16px;
  height: 16px;
  fill: var(--color-orange-primary);
  flex-shrink: 0;
}

/* ==========================================================================
   TERRAIN SOLUTIONS SECTION
   ========================================================================== */

.terrain-section {
  background-color: var(--color-charcoal-dark);
  color: var(--color-white);
  padding: 96px 0;
  border-bottom: 4px solid var(--color-orange-primary);
}

.terrain-header {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 56px auto;
}
.terrain-header h2 {
  font-size: 2.25rem;
  color: var(--color-white);
  margin-bottom: 16px;
  line-height: 1.2;
}
.terrain-header p {
  font-size: 1.0625rem;
  color: var(--color-text-light-muted);
  line-height: 1.7;
}

.terrain-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 36px;
}

.terrain-card {
  background-color: var(--color-charcoal-card);
  border: 2px solid var(--color-border-dark);
  border-top: 4px solid var(--color-amber-accent);
  padding: 36px 32px;
}
.terrain-card:hover {
  border-color: var(--color-orange-primary);
}

.terrain-card-top {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
}
.terrain-icon-box {
  width: 48px;
  height: 48px;
  background-color: var(--color-charcoal-surface);
  border: 1px solid var(--color-border-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.terrain-icon-box svg {
  width: 24px;
  height: 24px;
  fill: var(--color-amber-accent);
}
.terrain-card h3 {
  font-size: 1.1875rem;
  color: var(--color-white);
}
.terrain-card p {
  font-size: 0.9375rem;
  color: var(--color-text-light);
  line-height: 1.65;
}

/* ==========================================================================
   PHOTO GALLERY
   ========================================================================== */

.gallery-section {
  background-color: var(--color-white);
  padding: 96px 0;
  border-bottom: 1px solid var(--color-stone-border);
}

.gallery-filter-tabs {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 44px;
}
.filter-btn {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 10px 18px;
  background-color: var(--color-stone-light);
  color: var(--color-charcoal-dark);
  border: 2px solid var(--color-stone-border);
  cursor: pointer;
  transition: all 0.15s ease;
  min-height: 44px;
}
.filter-btn:hover, .filter-btn.active {
  background-color: var(--color-orange-primary);
  color: var(--color-white);
  border-color: var(--color-orange-primary);
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 24px;
}

.gallery-item {
  position: relative;
  background-color: var(--color-charcoal-dark);
  border: 2px solid var(--color-stone-border);
  overflow: hidden;
  cursor: pointer;
}
.gallery-item:hover {
  border-color: var(--color-orange-primary);
}
.gallery-item img {
  width: 100%;
  height: 230px;
  object-fit: cover;
}
.gallery-caption-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--color-charcoal-dark);
  border-top: 2px solid var(--color-orange-primary);
  padding: 12px 14px;
  color: var(--color-white);
  font-size: 0.8125rem;
  font-weight: 700;
  line-height: 1.4;
}
.gallery-category-badge {
  display: inline-block;
  font-family: var(--font-display);
  font-size: 0.6875rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--color-amber-accent);
  margin-bottom: 2px;
}

/* Flat Lightbox Modal */
.lightbox-modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  background-color: rgba(0, 0, 0, 0.92);
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.lightbox-modal.active {
  display: flex;
}
.lightbox-content {
  background-color: var(--color-charcoal-dark);
  border: 3px solid var(--color-orange-primary);
  max-width: 900px;
  width: 100%;
  position: relative;
}
.lightbox-close {
  position: absolute;
  top: -18px;
  right: -18px;
  width: 38px;
  height: 38px;
  background-color: var(--color-orange-primary);
  color: var(--color-white);
  font-weight: 900;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid var(--color-white);
  z-index: 2001;
}
.lightbox-img-box {
  max-height: 70vh;
  overflow: hidden;
  background-color: var(--color-black);
}
.lightbox-img-box img {
  width: 100%;
  max-height: 70vh;
  object-fit: contain;
  margin: 0 auto;
}
.lightbox-info {
  padding: 16px 20px;
  background-color: var(--color-charcoal-card);
  border-top: 1px solid var(--color-border-dark);
  color: var(--color-white);
  font-size: 0.9375rem;
}

/* ==========================================================================
   REVIEWS & TESTIMONIALS CAROUSEL
   ========================================================================== */

.reviews-section {
  background-color: var(--color-stone-light);
  padding: 96px 0;
  border-bottom: 1px solid var(--color-stone-border);
}

.reviews-carousel-wrapper {
  position: relative;
  max-width: 960px;
  margin: 0 auto 48px auto;
  overflow: hidden;
  width: 100%;
}

.reviews-track {
  display: flex;
  transition: transform 0.35s ease;
  width: 100%;
}

.review-slide {
  min-width: 100%;
  width: 100%;
  padding: 0 10px;
  flex-shrink: 0;
}

.review-card {
  background-color: var(--color-white);
  border: 2px solid var(--color-stone-border);
  border-top: 4px solid var(--color-orange-primary);
  padding: 40px 36px;
  display: flex;
  flex-direction: column;
}

.review-stars {
  display: flex;
  gap: 6px;
  margin-bottom: 20px;
}
.review-stars svg {
  width: 20px;
  height: 20px;
  fill: var(--color-amber-accent);
}

.review-text {
  font-size: 1.0625rem;
  color: var(--color-text-main);
  line-height: 1.7;
  margin-bottom: 28px;
}

.review-author {
  border-top: 1px solid var(--color-stone-border);
  padding-top: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}
.author-name {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1rem;
  color: var(--color-charcoal-dark);
}
.author-location {
  font-size: 0.8125rem;
  color: var(--color-orange-primary);
  font-weight: 700;
  text-transform: uppercase;
}

.carousel-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 24px;
}
.carousel-btn {
  width: 44px;
  height: 44px;
  background-color: var(--color-charcoal-dark);
  color: var(--color-white);
  border: 2px solid var(--color-charcoal-dark);
  font-size: 1.25rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}
.carousel-btn:hover {
  background-color: var(--color-orange-primary);
  border-color: var(--color-orange-primary);
}

.carousel-dots {
  display: flex;
  gap: 8px;
}
.carousel-dot {
  width: 14px;
  height: 14px;
  background-color: var(--color-stone-border);
  border: 2px solid var(--color-stone-border);
  cursor: pointer;
  transition: all 0.15s ease;
}
.carousel-dot.active {
  background-color: var(--color-orange-primary);
  border-color: var(--color-orange-primary);
}

.fb-social-banner {
  background-color: var(--color-charcoal-dark);
  border: 2px solid var(--color-border-dark);
  border-left: 6px solid #1877F2;
  padding: 28px 36px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}
.fb-social-banner-text h4 {
  font-size: 1.25rem;
  color: var(--color-white);
  margin-bottom: 6px;
}
.fb-social-banner-text p {
  font-size: 0.875rem;
  color: var(--color-text-light-muted);
}
.fb-link-btn {
  background-color: #1877F2;
  color: var(--color-white);
  border: 2px solid #1877F2;
}
.fb-link-btn:hover {
  background-color: #166FE5;
  border-color: #166FE5;
}

/* ==========================================================================
   MULTI-STEP ESTIMATE CALCULATOR
   ========================================================================== */

.estimate-section {
  background-color: var(--color-white);
  padding: 96px 0;
  border-bottom: 1px solid var(--color-stone-border);
}

.form-wrapper {
  background-color: var(--color-stone-light);
  border: 3px solid var(--color-charcoal-dark);
  max-width: 860px;
  margin: 0 auto;
}

.form-header-bar {
  background-color: var(--color-charcoal-dark);
  color: var(--color-white);
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}
.form-header-bar h3 {
  font-size: 1.25rem;
  color: var(--color-white);
}
.step-indicator-wrapper {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.step-pill {
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 6px 12px;
  background-color: var(--color-charcoal-surface);
  color: var(--color-text-light-muted);
  border: 1px solid var(--color-border-dark);
}
.step-pill.active {
  background-color: var(--color-orange-primary);
  color: var(--color-white);
  border-color: var(--color-orange-primary);
}
.step-pill.completed {
  background-color: var(--color-amber-accent);
  color: var(--color-charcoal-dark);
  border-color: var(--color-amber-accent);
}

.form-body {
  padding: 40px 36px;
  background-color: var(--color-white);
}

.form-step {
  display: none;
}
.form-step.active {
  display: block;
}

.step-heading {
  font-size: 1.25rem;
  margin-bottom: 8px;
  color: var(--color-charcoal-dark);
}
.step-subtext {
  font-size: 0.9375rem;
  color: var(--color-text-muted);
  margin-bottom: 28px;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.form-group {
  margin-bottom: 24px;
}
.form-label {
  display: block;
  font-family: var(--font-display);
  font-size: 0.8125rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
  color: var(--color-charcoal-dark);
}
.form-control {
  width: 100%;
  padding: 14px 16px;
  background-color: var(--color-white);
  border: 2px solid var(--color-stone-border);
  color: var(--color-charcoal-dark);
  font-size: 1rem;
}
.form-control:focus {
  border-color: var(--color-orange-primary);
  outline: none;
}

.selection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 14px;
  margin-bottom: 24px;
}

.select-card-label {
  display: block;
  cursor: pointer;
}
.select-card-label input {
  display: none;
}
.select-card-box {
  background-color: var(--color-stone-light);
  border: 2px solid var(--color-stone-border);
  padding: 16px 12px;
  text-align: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.875rem;
  color: var(--color-charcoal-dark);
  transition: all 0.15s ease;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.select-card-label input:checked + .select-card-box {
  background-color: var(--color-charcoal-dark);
  color: var(--color-amber-accent);
  border-color: var(--color-orange-primary);
}

.form-nav-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 36px;
  padding-top: 24px;
  border-top: 2px solid var(--color-stone-border);
  gap: 16px;
  flex-wrap: wrap;
}

.form-success-panel {
  display: none;
  background-color: var(--color-charcoal-dark);
  color: var(--color-white);
  border: 3px solid var(--color-orange-primary);
  padding: 56px 36px;
  text-align: center;
}
.form-success-panel h3 {
  font-size: 2rem;
  color: var(--color-amber-accent);
  margin-bottom: 14px;
}
.form-success-panel p {
  font-size: 1.0625rem;
  color: var(--color-text-light);
  max-width: 600px;
  margin: 0 auto 28px auto;
  line-height: 1.7;
}

/* ==========================================================================
   SERVICE AREA MATRIX
   ========================================================================== */

.service-area-section {
  background-color: var(--color-stone-light);
  padding: 96px 0;
  border-bottom: 1px solid var(--color-stone-border);
}

.area-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 56px;
  align-items: center;
}

.area-content h2 {
  font-size: 2.25rem;
  margin-bottom: 18px;
  line-height: 1.2;
}
.area-content p {
  font-size: 1.0625rem;
  color: var(--color-text-muted);
  line-height: 1.7;
  margin-bottom: 28px;
}

.area-tags-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-bottom: 36px;
}
.area-tag-item {
  background-color: var(--color-white);
  border: 1px solid var(--color-stone-border);
  border-left: 3px solid var(--color-orange-primary);
  padding: 12px 16px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.875rem;
  color: var(--color-charcoal-dark);
}

.area-map-card {
  background-color: var(--color-charcoal-dark);
  border: 3px solid var(--color-charcoal-dark);
  padding: 40px 36px;
  color: var(--color-white);
}
.area-map-card h3 {
  font-size: 1.375rem;
  color: var(--color-amber-accent);
  margin-bottom: 14px;
}
.area-map-card p {
  font-size: 0.9375rem;
  color: var(--color-text-light);
  line-height: 1.65;
  margin-bottom: 28px;
}
.area-contact-details {
  border-top: 1px solid var(--color-border-dark);
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.contact-detail-row {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 0.9375rem;
}
.contact-detail-row svg {
  width: 18px;
  height: 18px;
  fill: var(--color-orange-primary);
  flex-shrink: 0;
}

/* ==========================================================================
   FAQS (ACCORDION FLAT UI)
   ========================================================================== */

.faq-section {
  background-color: var(--color-white);
  padding: 96px 0;
  border-bottom: 1px solid var(--color-stone-border);
}

.faq-wrapper {
  max-width: 800px;
  margin: 0 auto;
}

.faq-item {
  background-color: var(--color-stone-light);
  border: 2px solid var(--color-stone-border);
  margin-bottom: 18px;
}
.faq-item.active {
  border-color: var(--color-orange-primary);
  background-color: var(--color-white);
}

.faq-question {
  padding: 22px 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-family: var(--font-display);
  font-size: 1.0625rem;
  font-weight: 800;
  color: var(--color-charcoal-dark);
  user-select: none;
  gap: 16px;
}
.faq-icon {
  width: 28px;
  height: 28px;
  background-color: var(--color-white);
  border: 1px solid var(--color-stone-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 1.25rem;
  color: var(--color-charcoal-dark);
  flex-shrink: 0;
  transition: all 0.15s ease;
}
.faq-item.active .faq-icon {
  background-color: var(--color-orange-primary);
  color: var(--color-white);
  border-color: var(--color-orange-primary);
  transform: rotate(45deg);
}

.faq-answer {
  display: none;
  padding: 0 28px 28px 28px;
  font-size: 0.9375rem;
  color: var(--color-text-muted);
  line-height: 1.7;
  border-top: 1px solid var(--color-stone-border);
  padding-top: 18px;
}
.faq-item.active .faq-answer {
  display: block;
}

/* ==========================================================================
   PRE-FOOTER CTA STRIP & FOOTER
   ========================================================================== */

.pre-footer-cta {
  background-color: var(--color-orange-primary);
  color: var(--color-white);
  padding: 72px 0;
  text-align: center;
}
.pre-footer-content h2 {
  font-size: 2.5rem;
  color: var(--color-white);
  margin-bottom: 18px;
}
.pre-footer-content p {
  font-size: 1.125rem;
  max-width: 680px;
  margin: 0 auto 36px auto;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.7;
}
.pre-footer-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
}

.main-footer {
  background-color: var(--color-charcoal-dark);
  color: var(--color-text-light);
  padding: 80px 0 36px 0;
  border-top: 4px solid var(--color-charcoal-surface);
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1.2fr;
  gap: 48px;
  margin-bottom: 64px;
}

.footer-logo-block {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}
.footer-logo-img {
  width: 44px;
  height: 44px;
  object-fit: cover;
  border: 2px solid var(--color-orange-primary);
  flex-shrink: 0;
}
.footer-desc {
  font-size: 0.875rem;
  color: var(--color-text-light-muted);
  line-height: 1.7;
  margin-bottom: 20px;
}

.footer-heading {
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 800;
  color: var(--color-amber-accent);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 20px;
  border-bottom: 2px solid var(--color-charcoal-surface);
  padding-bottom: 8px;
}

.footer-links li {
  margin-bottom: 12px;
}
.footer-links a {
  font-size: 0.875rem;
  color: var(--color-text-light);
}
.footer-links a:hover {
  color: var(--color-orange-primary);
  padding-left: 4px;
}

.footer-contact-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 0.875rem;
  color: var(--color-text-light);
  line-height: 1.6;
}
.footer-contact-item svg {
  width: 18px;
  height: 18px;
  fill: var(--color-amber-accent);
  flex-shrink: 0;
  margin-top: 2px;
}

.footer-bottom-bar {
  border-top: 1px solid var(--color-charcoal-surface);
  padding-top: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 0.8125rem;
  color: var(--color-text-light-muted);
}
.footer-bottom-bar a {
  color: var(--color-amber-accent);
}

/* Floating Mobile Quick Call */
.floating-mobile-call {
  display: none;
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1500;
  background-color: var(--color-orange-primary);
  color: var(--color-white);
  border: 2px solid var(--color-white);
  padding: 14px 20px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 0.875rem;
  align-items: center;
  gap: 8px;
}
.floating-mobile-call svg {
  width: 18px;
  height: 18px;
  fill: var(--color-white);
}

/* ==========================================================================
   COMPREHENSIVE RESPONSIVE BREAKPOINTS (TABLETS & PHONES)
   ========================================================================== */

/* Tablet Viewports (<= 1024px) */
@media (max-width: 1024px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 48px;
  }
  .services-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 28px;
  }
  .terrain-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 28px;
  }
  .footer-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 40px;
  }
  .area-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

/* Mobile Nav Breakpoint (<= 860px) */
@media (max-width: 860px) {
  :root {
    --header-height: 68px;
  }

  .top-announcement-bar {
    display: none;
  }

  /* Full-width slide-down mobile menu drawer */
  .nav-menu {
    display: none;
    position: absolute;
    top: var(--header-height);
    left: 0;
    width: 100%;
    background-color: var(--color-charcoal-dark);
    border-bottom: 4px solid var(--color-orange-primary);
    flex-direction: column;
    padding: 24px;
    gap: 0;
    z-index: 999;
  }
  .nav-menu.mobile-open {
    display: flex;
  }
  .nav-link {
    width: 100%;
    padding: 16px 12px;
    font-size: 1rem;
    border-bottom: 1px solid var(--color-charcoal-surface);
    display: block;
  }
  .nav-link:last-child {
    border-bottom: none;
  }

  .mobile-menu-toggle {
    display: flex;
  }

  /* Hide the header's Get Free Estimate on mobile so it doesn't crowd */
  .header-actions .btn {
    display: none;
  }

  .floating-mobile-call {
    display: inline-flex;
  }

  .hero-section {
    padding: 60px 0 56px 0;
  }
  .hero-content h1 {
    font-size: 2.25rem;
  }
  .section-title {
    font-size: 1.875rem;
  }

  .services-section,
  .terrain-section,
  .gallery-section,
  .reviews-section,
  .estimate-section,
  .service-area-section,
  .faq-section {
    padding: 68px 0;
  }

  .form-body {
    padding: 28px 20px;
  }
  .form-header-bar {
    padding: 18px 20px;
  }
  .form-grid-2 {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .form-nav-buttons {
    flex-direction: column;
    gap: 12px;
  }
  .form-nav-buttons .btn {
    width: 100%;
  }

  .pre-footer-actions {
    flex-direction: column;
    width: 100%;
  }
  .pre-footer-actions .btn {
    width: 100%;
  }
}

/* Small Smartphone Viewports (<= 600px) */
@media (max-width: 600px) {
  .container {
    padding-left: 18px;
    padding-right: 18px;
  }

  /* On small phones, show icon-only call button in header */
  .header-call-btn span.call-text {
    display: none;
  }
  .header-call-btn {
    padding: 8px 10px;
  }

  .hero-content h1 {
    font-size: 1.875rem;
    line-height: 1.2;
    margin-bottom: 16px;
  }
  .hero-subhead {
    font-size: 1rem;
    margin-bottom: 24px;
  }

  .hero-cta-group {
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }
  .hero-cta-group .btn {
    width: 100%;
  }

  .hero-trust-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .hero-card-panel {
    padding: 24px 18px;
  }

  .services-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .service-content {
    padding: 24px 18px;
  }

  .terrain-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .terrain-card {
    padding: 24px 18px;
  }

  .gallery-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .gallery-filter-tabs {
    flex-direction: column;
    width: 100%;
  }
  .filter-btn {
    width: 100%;
  }

  .review-card {
    padding: 24px 18px;
  }
  .review-text {
    font-size: 0.95rem;
  }

  .area-tags-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .area-map-card {
    padding: 24px 18px;
  }

  .faq-question {
    padding: 16px 18px;
    font-size: 0.95rem;
  }
  .faq-answer {
    padding: 0 18px 18px 18px;
    font-size: 0.875rem;
  }

  .pre-footer-content h2 {
    font-size: 1.75rem;
  }
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .selection-grid {
    grid-template-columns: 1fr 1fr;
  }

  .fb-social-banner {
    padding: 20px 18px;
    flex-direction: column;
    align-items: flex-start;
  }
  .fb-link-btn {
    width: 100%;
  }
}

/* Extra small devices (<= 380px) */
@media (max-width: 380px) {
  .logo-title {
    font-size: 0.9375rem;
  }
  .logo-subtitle {
    font-size: 0.625rem;
  }
  .selection-grid {
    grid-template-columns: 1fr;
  }
}
`;

fs.writeFileSync(path.join(targetDir, 'styles.css'), cssContent, 'utf8');
console.log('Successfully updated styles.css with complete mobile-first responsive architecture');

// 2. INDEX.HTML (ENSURE CALL-TEXT SPAN IS WRAPPED PROPERLY FOR RESPONSIVE COMPACTING)
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Banks Excavation & Land Clearing | Chatsworth, GA</title>
  <meta name="description" content="Banks Excavation & Land Clearing in Chatsworth, GA. Owned & operated by Ira. Commercial & residential land clearing, forestry mulching, basement excavation, house pads, driveway grading, and drainage across Murray County & North Georgia. Call (706) 299-6474.">
  <meta name="keywords" content="Excavation Chatsworth GA, Land Clearing Murray County, Forestry Mulching Dalton GA, Site Preparation North Georgia, House Pad Grading Chatsworth, Basement Digging GA-225, Culvert Installation, Banks Excavation">
  
  <!-- Schema.org Microdata -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "name": "Banks Excavation & Land Clearing",
    "image": "assets/images/logo.jpg",
    "founder": {
      "@type": "Person",
      "name": "Ira"
    },
    "telephone": "(706) 299-6474",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "2968 GA-225",
      "addressLocality": "Chatsworth",
      "addressRegion": "GA",
      "postalCode": "30705",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 34.7673,
      "longitude": -84.7702
    },
    "areaServed": [
      "Chatsworth, GA",
      "Murray County, GA",
      "Dalton, GA",
      "Eton, GA",
      "Crandall, GA",
      "Fort Mountain, GA",
      "Whitfield County, GA",
      "North Georgia"
    ],
    "priceRange": "$$",
    "openingHours": "Mo-Sa 07:00-19:00",
    "url": "https://facebook.com"
  }
  </script>

  <!-- Google Fonts: Inter & Montserrat -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Montserrat:wght@700;800;900&display=swap" rel="stylesheet">
  
  <!-- Flat Design Stylesheet -->
  <link rel="stylesheet" href="styles.css">
</head>
<body>

  <!-- Top Announcement Bar -->
  <div class="top-announcement-bar">
    <div class="container top-announcement-content">
      <div class="announcement-left">
        <span class="announcement-item">
          <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          2968 GA-225, Chatsworth, GA 30705
        </span>
        <span class="announcement-item">
          <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
          Licensed & Insured in Georgia
        </span>
      </div>
      <div class="announcement-right">
        <span>Direct Line to Owner Ira: </span>
        <a href="tel:7062996474">(706) 299-6474</a>
      </div>
    </div>
  </div>

  <!-- Main Navigation Header -->
  <header class="main-header">
    <div class="container header-container">
      <!-- Clean Brand Logo Block -->
      <a href="#hero" class="logo-link">
        <img src="assets/images/logo.jpg" alt="Banks Excavation Logo" class="logo-img">
        <div class="logo-text-block">
          <span class="logo-title">Banks Excavation</span>
          <span class="logo-subtitle">& Land Clearing</span>
        </div>
      </a>

      <!-- Streamlined Navigation Menu -->
      <nav class="nav-menu" id="navMenu">
        <a href="#services" class="nav-link">Services</a>
        <a href="#terrain" class="nav-link">Terrain Solutions</a>
        <a href="#gallery" class="nav-link">Gallery</a>
        <a href="#reviews" class="nav-link">Reviews</a>
        <a href="#faq" class="nav-link">FAQ</a>
      </nav>

      <!-- Header Action Buttons -->
      <div class="header-actions">
        <a href="tel:7062996474" class="header-call-btn">
          <svg viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1.01A11.36 11.36 0 018.57 3.9c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.52c0-.55-.45-1-.99-1z"/></svg>
          <span class="call-text">(706) 299-6474</span>
        </a>
        <a href="#estimate" class="btn btn-orange btn-sm">Get Free Estimate</a>
        <button class="mobile-menu-toggle" id="mobileMenuToggle" aria-label="Toggle Navigation Menu">MENU ☰</button>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="hero-section" id="hero">
    <div class="container hero-grid">
      <div class="hero-content">
        <span class="kicker">CHATSWORTH & MURRAY COUNTY, GA CONTRACTOR</span>
        <h1>Excavation and Land Clearing Contractors in <span class="highlight-orange">Chatsworth, GA</span></h1>
        <p class="hero-subhead">
          Heavy iron land clearing, precision house pad grading, basement excavation, and mountain rock removal across Murray County, Dalton, and North Georgia. Owner Ira is on every job site to get your ground build-ready on time and on budget.
        </p>

        <div class="hero-cta-group">
          <a href="#estimate" class="btn btn-orange btn-lg">Get a Free Estimate</a>
          <a href="tel:7062996474" class="btn btn-charcoal btn-lg">
            <svg style="width:18px;height:18px;fill:var(--color-amber-accent);" viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1.01A11.36 11.36 0 018.57 3.9c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.52c0-.55-.45-1-.99-1z"/></svg>
            Call Ira Directly: (706) 299-6474
          </a>
        </div>

        <div class="hero-trust-grid">
          <div class="hero-trust-badge">
            <div class="badge-title">100% Owner Operated</div>
            <div class="badge-desc">Ira manages, runs machinery & inspects every single parcel</div>
          </div>
          <div class="hero-trust-badge">
            <div class="badge-title">Heavy Iron Capability</div>
            <div class="badge-desc">Excavators, mulchers, track loaders, dozers & dump trucks</div>
          </div>
          <div class="hero-trust-badge">
            <div class="badge-title">North GA Terrain Experts</div>
            <div class="badge-desc">Proven solutions for mountain shale, steep slopes & drainage</div>
          </div>
          <div class="hero-trust-badge">
            <div class="badge-title">Transparent Quotes</div>
            <div class="badge-desc">Honest, upfront pricing with zero hidden surcharges</div>
          </div>
        </div>
      </div>

      <!-- Hero Card Panel -->
      <div class="hero-card-panel">
        <div class="hero-card-panel-header">
          <span class="kicker kicker-yellow">FAST LOCAL RESPONSE</span>
          <h3>Need Dirt Work in Murray County?</h3>
          <p>Talk directly with owner-operator Ira. We evaluate your acreage, soil, and slope to give you an honest quote.</p>
        </div>

        <ul style="display:flex; flex-direction:column; gap:12px; font-size:0.9375rem; color:var(--color-text-light);">
          <li style="display:flex; align-items:center; gap:8px;">
            <span style="color:var(--color-amber-accent); font-weight:900;">✓</span> House & Shop Building Pads
          </li>
          <li style="display:flex; align-items:center; gap:8px;">
            <span style="color:var(--color-amber-accent); font-weight:900;">✓</span> Forestry Mulching & Acreage Clearing
          </li>
          <li style="display:flex; align-items:center; gap:8px;">
            <span style="color:var(--color-amber-accent); font-weight:900;">✓</span> Driveway Cuts & Gravel Spreading
          </li>
          <li style="display:flex; align-items:center; gap:8px;">
            <span style="color:var(--color-amber-accent); font-weight:900;">✓</span> Culverts, Swales & Runoff Control
          </li>
        </ul>

        <div class="hero-direct-call-box">
          <span class="call-label">Direct Cell / Dispatch</span>
          <a href="tel:7062996474" class="call-number">(706) 299-6474</a>
        </div>
      </div>
    </div>
  </section>

  <!-- Triple-Pillar Core Services Section -->
  <section class="services-section" id="services">
    <div class="container">
      <div class="section-title-wrap">
        <span class="kicker">FULL-SERVICE HEAVY EQUIPMENT CONTRACTOR</span>
        <h2 class="section-title">Comprehensive Excavation & Land Services in Murray County</h2>
        <p class="section-subtitle">
          From single residential lots to multi-acre commercial developments, we have the heavy machinery and local ground expertise to get your site build-ready.
        </p>
      </div>

      <div class="services-grid">
        <!-- Service 1: Land Clearing -->
        <div class="service-card">
          <div class="service-img-wrapper">
            <span class="service-tag">Land Clearing</span>
            <img src="assets/images/land-clearing/commercial-lot-clearing-forestry-mulching.jpg" alt="Commercial lot clearing and forestry mulching in Murray County GA">
          </div>
          <div class="service-content">
            <h3>Commercial & Residential Land Clearing</h3>
            <p>
              Tackle dense timber, overgrown brush, and stubborn root systems. Our high-flow forestry mulchers and excavators clear land clean down to bare soil with no messy burn piles required.
            </p>
            <div class="service-feature-list">
              <div class="service-feature-item">
                <svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                Forestry mulching & underbrush shredding
              </div>
              <div class="service-feature-item">
                <svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                Full tree removal & stump extraction
              </div>
              <div class="service-feature-item">
                <svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                Fence line & pasture reclamation
              </div>
              <div class="service-feature-item">
                <svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                Right-of-way & utility corridor clearing
              </div>
            </div>
            <a href="#estimate" class="btn btn-outline-orange btn-sm">Quote Land Clearing</a>
          </div>
        </div>

        <!-- Service 2: Excavation & Dirt Work -->
        <div class="service-card">
          <div class="service-img-wrapper">
            <span class="service-tag">Excavation</span>
            <img src="assets/images/excavation/heavy-excavator-trenching-dirt-work.jpg" alt="Heavy excavator trenching and foundation dirt work in Chatsworth GA">
          </div>
          <div class="service-content">
            <h3>Excavation & Heavy Dirt Work</h3>
            <p>
              Solid structures require precision earthmoving. We execute deep basement cuts, crawlspace digs, footing trenching, and bulk dirt hauling with laser accuracy through mountain rock and red clay.
            </p>
            <div class="service-feature-list">
              <div class="service-feature-item">
                <svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                Basement & crawlspace excavation
              </div>
              <div class="service-feature-item">
                <svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                Structural footings & utility trenching
              </div>
              <div class="service-feature-item">
                <svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                Driveway culverts & storm ditching
              </div>
              <div class="service-feature-item">
                <svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                Pond digging, berms & bulk fill dirt hauling
              </div>
            </div>
            <a href="#estimate" class="btn btn-outline-orange btn-sm">Quote Excavation</a>
          </div>
        </div>

        <!-- Service 3: Site Prep & Grading -->
        <div class="service-card">
          <div class="service-img-wrapper">
            <span class="service-tag">Site Prep</span>
            <img src="assets/images/site-prep/house-pad-preparation-grading-chatsworth.jpg" alt="Engineered house pad preparation and laser grading in Chatsworth GA">
          </div>
          <div class="service-content">
            <h3>Site Preparation & Precision Grading</h3>
            <p>
              A flawless foundation starts with laser-accurate grading. We build compacted house pads, commercial building bases, and long-lasting crowned gravel driveways that channel water away safely.
            </p>
            <div class="service-feature-list">
              <div class="service-feature-item">
                <svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                Engineered house & shop building pads
              </div>
              <div class="service-feature-item">
                <svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                Driveway cuts, gravel spreading & crowning
              </div>
              <div class="service-feature-item">
                <svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                Laser leveling & subgrade compaction
              </div>
              <div class="service-feature-item">
                <svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                Hillside terracing & erosion swales
              </div>
            </div>
            <a href="#estimate" class="btn btn-outline-orange btn-sm">Quote Site Prep</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Local Competitive Edge: North Georgia Terrain Solutions -->
  <section class="terrain-section" id="terrain">
    <div class="container">
      <div class="terrain-header">
        <span class="kicker kicker-yellow">ENGINEERED FOR LOCAL GROUND</span>
        <h2>North Georgia Terrain Solutions: Conquering Rock, Steep Slopes & Water Runoff</h2>
        <p>
          Murray County and the North Georgia foothills present unique site challenges that out-of-town operators struggle with. Here is how Banks Excavation handles our regional ground conditions.
        </p>
      </div>

      <div class="terrain-grid">
        <!-- Terrain 1: Rock & Shale -->
        <div class="terrain-card">
          <div class="terrain-card-top">
            <div class="terrain-icon-box">
              <svg viewBox="0 0 24 24"><path d="M19 12h-2v3h-3v2h5v-5zM7 9h2V6H6v5h1V9zm14-6H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z"/></svg>
            </div>
            <h3>Rocky Ground & Mountain Shale Fracturing</h3>
          </div>
          <p>
            North Georgia soils are notoriously layered with chert, sandstone boulders, and mountain shale. We deploy high-tonnage excavators with heavy rock rippers to clear stubborn subgrade bedrock without stalling your construction schedule.
          </p>
        </div>

        <!-- Terrain 2: Steep Slope Grading -->
        <div class="terrain-card">
          <div class="terrain-card-top">
            <div class="terrain-icon-box">
              <svg viewBox="0 0 24 24"><path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z"/></svg>
            </div>
            <h3>Steep Mountain Slope Stability & Terracing</h3>
          </div>
          <p>
            Working on the ridges of Fort Mountain or rolling Murray County hillsides requires precision balance and terracing expertise. We cut stable benches, construct retaining subgrades, and ensure mountain parcels remain structurally secure year-round.
          </p>
        </div>

        <!-- Terrain 3: Water Runoff & Drainage -->
        <div class="terrain-card">
          <div class="terrain-card-top">
            <div class="terrain-icon-box">
              <svg viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>
            </div>
            <h3>Heavy Rain Runoff & Drainage Management</h3>
          </div>
          <p>
            North Georgia torrential rainstorms can wash out driveways and flood foundations in hours. We design custom swales, deep drainage ditches, rip-rap culverts, and French drains that route stormwater safely away from your structures.
          </p>
        </div>

        <!-- Terrain 4: Red Clay Compaction -->
        <div class="terrain-card">
          <div class="terrain-card-top">
            <div class="terrain-icon-box">
              <svg viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>
            </div>
            <h3>Georgia Red Clay Conditioning & Compaction</h3>
          </div>
          <p>
            Local red clay expands when saturated and hardens when dry. We condition subsoils and utilize heavy vibratory roller compaction to achieve engineered density, preventing future slab settling, cracking, and driveway rutting.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Photo Gallery Section -->
  <section class="gallery-section" id="gallery">
    <div class="container">
      <div class="section-title-wrap">
        <span class="kicker">REAL LOCAL WORK • CHATSWORTH & MURRAY COUNTY</span>
        <h2 class="section-title">Our Heavy Equipment Job Showcase</h2>
        <p class="section-subtitle">
          Explore actual job site photos of land clearing, tree removal, basement cuts, house pads, and gravel driveways completed by owner-operator Ira Banks.
        </p>
      </div>

      <!-- Filter Tabs -->
      <div class="gallery-filter-tabs">
        <button class="filter-btn active" data-filter="all">All Projects (13)</button>
        <button class="filter-btn" data-filter="land-clearing">Land Clearing & Tree Removal</button>
        <button class="filter-btn" data-filter="excavation">Excavation & Dirt Work</button>
        <button class="filter-btn" data-filter="site-prep">Site Prep & Laser Grading</button>
      </div>

      <!-- Gallery Grid -->
      <div class="gallery-grid" id="galleryGrid">
        <!-- Land Clearing Items -->
        <div class="gallery-item" data-category="land-clearing">
          <img src="assets/images/land-clearing/commercial-lot-clearing-forestry-mulching.jpg" alt="Commercial lot clearing and forestry mulching in Murray County GA">
          <div class="gallery-caption-overlay">
            <span class="gallery-category-badge">Land Clearing</span>
            <div>Commercial Lot Clearing & Forestry Mulching • Murray County</div>
          </div>
        </div>

        <div class="gallery-item" data-category="land-clearing">
          <img src="assets/images/land-clearing/tree-removal-stump-grinding-chatsworth.jpg" alt="Tree removal and stump extraction services in Chatsworth GA">
          <div class="gallery-caption-overlay">
            <span class="gallery-category-badge">Land Clearing</span>
            <div>Tree Removal & Root Stump Extraction • Chatsworth, GA</div>
          </div>
        </div>

        <div class="gallery-item" data-category="land-clearing">
          <img src="assets/images/land-clearing/underbrush-overgrowth-clearing-murray-county.jpg" alt="Overgrowth and dense underbrush clearing on residential acreage in Murray County">
          <div class="gallery-caption-overlay">
            <span class="gallery-category-badge">Land Clearing</span>
            <div>Dense Underbrush & Acreage Clearing • Murray County</div>
          </div>
        </div>

        <div class="gallery-item" data-category="land-clearing">
          <img src="assets/images/land-clearing/residential-acreage-lot-clearing-georgia.jpg" alt="Residential acreage land clearing for new home site in North Georgia">
          <div class="gallery-caption-overlay">
            <span class="gallery-category-badge">Land Clearing</span>
            <div>Residential Acreage Home Site Clearing • North GA</div>
          </div>
        </div>

        <!-- Excavation Items -->
        <div class="gallery-item" data-category="excavation">
          <img src="assets/images/excavation/heavy-excavator-trenching-dirt-work.jpg" alt="Heavy excavator trenching and foundation dirt work in Chatsworth GA">
          <div class="gallery-caption-overlay">
            <span class="gallery-category-badge">Excavation</span>
            <div>Heavy Excavator Trenching & Foundation Cuts • Chatsworth</div>
          </div>
        </div>

        <div class="gallery-item" data-category="excavation">
          <img src="assets/images/excavation/basement-footing-digging-contractor.jpg" alt="Basement excavation and structural footing digging in North Georgia">
          <div class="gallery-caption-overlay">
            <span class="gallery-category-badge">Excavation</span>
            <div>Deep Basement & Structural Footing Dig • Murray County</div>
          </div>
        </div>

        <div class="gallery-item" data-category="excavation">
          <img src="assets/images/excavation/drainage-culvert-ditch-excavation.jpg" alt="Driveway culvert pipe installation and drainage ditching Murray County">
          <div class="gallery-caption-overlay">
            <span class="gallery-category-badge">Excavation</span>
            <div>Driveway Culvert Pipe & Storm Drainage Ditch • Chatsworth</div>
          </div>
        </div>

        <div class="gallery-item" data-category="excavation">
          <img src="assets/images/excavation/dirt-hauling-rock-excavation-chatsworth.jpg" alt="Rock excavation, shale removal, and bulk fill dirt hauling in Chatsworth GA">
          <div class="gallery-caption-overlay">
            <span class="gallery-category-badge">Excavation</span>
            <div>Rock Excavation & Bulk Fill Dirt Hauling • GA-225</div>
          </div>
        </div>

        <div class="gallery-item" data-category="excavation">
          <img src="assets/images/excavation/heavy-equipment-earthmoving-murray-co.jpg" alt="Heavy equipment earthmoving and subsoil relocation in Murray County GA">
          <div class="gallery-caption-overlay">
            <span class="gallery-category-badge">Excavation</span>
            <div>Heavy Iron Subsoil Earthmoving • Murray County</div>
          </div>
        </div>

        <!-- Site Prep Items -->
        <div class="gallery-item" data-category="site-prep">
          <img src="assets/images/site-prep/house-pad-preparation-grading-chatsworth.jpg" alt="Engineered house pad preparation and laser grading in Chatsworth GA">
          <div class="gallery-caption-overlay">
            <span class="gallery-category-badge">Site Prep & Grading</span>
            <div>Engineered House Building Pad Prep • Chatsworth</div>
          </div>
        </div>

        <div class="gallery-item" data-category="site-prep">
          <img src="assets/images/site-prep/driveway-grading-gravel-leveling.jpg" alt="Residential gravel driveway grading and finish crowning Chatsworth GA">
          <div class="gallery-caption-overlay">
            <span class="gallery-category-badge">Site Prep & Grading</span>
            <div>Gravel Driveway Grading & Finish Crowning • Murray Co.</div>
          </div>
        </div>

        <div class="gallery-item" data-category="site-prep">
          <img src="assets/images/site-prep/precision-laser-leveling-subgrade-prep.jpg" alt="Precision laser leveling and subgrade compaction for foundation prep">
          <div class="gallery-caption-overlay">
            <span class="gallery-category-badge">Site Prep & Grading</span>
            <div>Precision Laser Leveling & Subgrade Compaction</div>
          </div>
        </div>

        <div class="gallery-item" data-category="site-prep">
          <img src="assets/images/site-prep/hillside-slope-grading-erosion-control.jpg" alt="Mountain slope grading, terracing, and erosion control North Georgia">
          <div class="gallery-caption-overlay">
            <span class="gallery-category-badge">Site Prep & Grading</span>
            <div>Mountain Hillside Slope Grading & Erosion Swales</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Lightbox Modal -->
  <div class="lightbox-modal" id="lightboxModal">
    <div class="lightbox-content">
      <button class="lightbox-close" id="lightboxClose">✕</button>
      <div class="lightbox-img-box">
        <img src="" alt="" id="lightboxImg">
      </div>
      <div class="lightbox-info" id="lightboxCaption"></div>
    </div>
  </div>

  <!-- Reviews & Testimonials Carousel Section -->
  <section class="reviews-section" id="reviews">
    <div class="container">
      <div class="section-title-wrap">
        <span class="kicker kicker-dark">5-STAR LOCAL REPUTATION</span>
        <h2 class="section-title">Trusted by Murray County Property Owners & Builders</h2>
        <p class="section-subtitle">
          Read what local residents and general contractors say about working directly with Ira Banks.
        </p>
      </div>

      <!-- Interactive Carousel Slider -->
      <div class="reviews-carousel-wrapper">
        <div class="reviews-track" id="reviewsTrack">
          <!-- Slide 1 -->
          <div class="review-slide">
            <div class="review-card">
              <div class="review-stars">
                <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              </div>
              <p class="review-text">
                "Ira cleared 4 acres of dense timber and built a laser-leveled house pad for our new custom home in Chatsworth. His equipment made quick work of massive hardwood stumps. Upfront pricing, showed up on time, and left the property spotless."
              </p>
              <div class="review-author">
                <span class="author-name">Cody M.</span>
                <span class="author-location">Murray County, GA</span>
              </div>
            </div>
          </div>

          <!-- Slide 2 -->
          <div class="review-slide">
            <div class="review-card">
              <div class="review-stars">
                <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              </div>
              <p class="review-text">
                "We had severe mountain runoff washing out our long gravel driveway every time heavy rain hit. Ira installed a heavy-gauge culvert pipe and regraded the entire road with a solid crown and drainage ditch. Fixed the problem permanently on the first try."
              </p>
              <div class="review-author">
                <span class="author-name">Dustin T.</span>
                <span class="author-location">Dalton, GA</span>
              </div>
            </div>
          </div>

          <!-- Slide 3 -->
          <div class="review-slide">
            <div class="review-card">
              <div class="review-stars">
                <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              </div>
              <p class="review-text">
                "Top-notch operator who knows how to handle heavy iron in rocky ground. Dug our basement footer in Chatsworth without a hitch. Honest local guy who takes personal pride in his work."
              </p>
              <div class="review-author">
                <span class="author-name">Mark R.</span>
                <span class="author-location">Chatsworth, GA</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Carousel Navigation Controls -->
        <div class="carousel-controls">
          <button class="carousel-btn" id="prevReviewBtn" aria-label="Previous Review">←</button>
          <div class="carousel-dots" id="carouselDots"></div>
          <button class="carousel-btn" id="nextReviewBtn" aria-label="Next Review">→</button>
        </div>
      </div>

      <!-- Facebook Social Proof Banner -->
      <div class="fb-social-banner">
        <div class="fb-social-banner-text">
          <h4>📱 Connect with Banks Excavation on Facebook</h4>
          <p>See our latest daily project videos, machinery in action, and live customer reviews from job sites across North Georgia.</p>
        </div>
        <a href="https://facebook.com" target="_blank" rel="noopener" class="btn fb-link-btn">
          Visit Our Facebook Page ➔
        </a>
      </div>
    </div>
  </section>

  <!-- Multi-Step Estimate Form Section -->
  <section class="estimate-section" id="estimate">
    <div class="container">
      <div class="section-title-wrap">
        <span class="kicker kicker-dark">FREE ON-SITE EVALUATION</span>
        <h2 class="section-title">Request Your Free Estimate in 60 Seconds</h2>
        <p class="section-subtitle">
          Tell us about your property in Chatsworth, Murray County, or surrounding North GA areas. Ira will review your project specs and contact you directly.
        </p>
      </div>

      <div class="form-wrapper">
        <div class="form-header-bar">
          <h3>Online Project Estimate Request</h3>
          <div class="step-indicator-wrapper">
            <span class="step-pill active" id="pillStep1">1. Contact</span>
            <span class="step-pill" id="pillStep2">2. Property</span>
            <span class="step-pill" id="pillStep3">3. Services</span>
          </div>
        </div>

        <form class="form-body" id="estimateForm">
          <!-- Step 1: Contact Basics -->
          <div class="form-step active" id="step1">
            <h4 class="step-heading">Step 1: Your Contact Information</h4>
            <p class="step-subtext">How can Ira reach you with your project estimate?</p>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label" for="custName">Full Name *</label>
                <input type="text" id="custName" class="form-control" placeholder="e.g. John Miller" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="custPhone">Phone Number *</label>
                <input type="tel" id="custPhone" class="form-control" placeholder="(706) 000-0000" required>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="custEmail">Email Address (Optional)</label>
              <input type="email" id="custEmail" class="form-control" placeholder="john@example.com">
            </div>

            <div class="form-nav-buttons" style="justify-content: flex-end;">
              <button type="button" class="btn btn-orange" id="btnNext1">Next: Property Details →</button>
            </div>
          </div>

          <!-- Step 2: Property Location & Acreage -->
          <div class="form-step" id="step2">
            <h4 class="step-heading">Step 2: Property Location & Acreage</h4>
            <p class="step-subtext">Where is the job site located and what is the estimated scope?</p>

            <div class="form-group">
              <label class="form-label" for="projectAddress">Job Site Address / Road / City *</label>
              <input type="text" id="projectAddress" class="form-control" placeholder="e.g. GA-225, Eton / Chatsworth, GA" required>
            </div>

            <div class="form-group">
              <label class="form-label">Estimated Property / Project Size:</label>
              <div class="selection-grid">
                <label class="select-card-label">
                  <input type="radio" name="acreage" value="Under 1 Acre" checked>
                  <div class="select-card-box">&lt; 1 Acre</div>
                </label>
                <label class="select-card-label">
                  <input type="radio" name="acreage" value="1 to 3 Acres">
                  <div class="select-card-box">1 – 3 Acres</div>
                </label>
                <label class="select-card-label">
                  <input type="radio" name="acreage" value="3 to 5 Acres">
                  <div class="select-card-box">3 – 5 Acres</div>
                </label>
                <label class="select-card-label">
                  <input type="radio" name="acreage" value="5 to 10 Acres">
                  <div class="select-card-box">5 – 10 Acres</div>
                </label>
                <label class="select-card-label">
                  <input type="radio" name="acreage" value="10+ Acres Commercial/Farm">
                  <div class="select-card-box">10+ Acres</div>
                </label>
              </div>
            </div>

            <div class="form-nav-buttons">
              <button type="button" class="btn btn-charcoal" id="btnPrev2">← Back</button>
              <button type="button" class="btn btn-orange" id="btnNext2">Next: Services Needed →</button>
            </div>
          </div>

          <!-- Step 3: Specific Services Needed -->
          <div class="form-step" id="step3">
            <h4 class="step-heading">Step 3: Services Needed & Timeline</h4>
            <p class="step-subtext">Select all the machinery work you require on your land:</p>

            <div class="selection-grid">
              <label class="select-card-label">
                <input type="checkbox" name="services" value="Land Clearing / Forestry Mulching" checked>
                <div class="select-card-box">🌲 Land Clearing</div>
              </label>
              <label class="select-card-label">
                <input type="checkbox" name="services" value="House or Shop Building Pad">
                <div class="select-card-box">🏗️ House / Pad</div>
              </label>
              <label class="select-card-label">
                <input type="checkbox" name="services" value="Basement / Footing Excavation">
                <div class="select-card-box">⛏️ Basement Dig</div>
              </label>
              <label class="select-card-label">
                <input type="checkbox" name="services" value="Driveway Grading & Gravel">
                <div class="select-card-box">🚜 Driveway</div>
              </label>
              <label class="select-card-label">
                <input type="checkbox" name="services" value="Culverts & Drainage Ditching">
                <div class="select-card-box">💧 Drainage</div>
              </label>
              <label class="select-card-label">
                <input type="checkbox" name="services" value="Demolition & Dirt Hauling">
                <div class="select-card-box">🚛 Demolition</div>
              </label>
            </div>

            <div class="form-group">
              <label class="form-label" for="projectNotes">Project Details or Timeline Notes</label>
              <textarea id="projectNotes" class="form-control" rows="3" placeholder="Describe any rocks, trees, timeline requirements, or access constraints..."></textarea>
            </div>

            <div class="form-nav-buttons" id="formNav">
              <button type="button" class="btn btn-charcoal" id="btnPrev3">← Back</button>
              <button type="submit" class="btn btn-orange btn-lg" id="btnSubmit">Submit Estimate Request ➔</button>
            </div>
          </div>
        </form>

        <!-- Form Success State -->
        <div class="form-success-panel" id="formSuccess">
          <h3>✓ Estimate Request Received!</h3>
          <p id="estimateSummaryText">
            Thank you! Your property details have been forwarded directly to owner-operator Ira.
          </p>
          <div style="display:flex; justify-content:center; gap:16px; flex-wrap:wrap;">
            <a href="tel:7062996474" class="btn btn-yellow btn-lg">Call Ira Now: (706) 299-6474</a>
            <a href="https://facebook.com" target="_blank" rel="noopener" class="btn btn-outline-white btn-lg">View Our Work on Facebook</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Service Area Coverage Section -->
  <section class="service-area-section" id="service-areas">
    <div class="container area-grid">
      <div class="area-content">
        <span class="kicker">LOCAL SERVICE RADIUS</span>
        <h2>Proudly Serving Chatsworth & Surrounding North GA Communities</h2>
        <p>
          Banks Excavation & Land Clearing is headquartered at 2968 GA-225 in Chatsworth. We mobilize our equipment quickly across Murray County, Whitfield County, and the greater North Georgia mountain region.
        </p>

        <div class="area-tags-grid">
          <div class="area-tag-item">📍 Chatsworth, GA (Hub)</div>
          <div class="area-tag-item">📍 Murray County</div>
          <div class="area-tag-item">📍 Dalton, GA</div>
          <div class="area-tag-item">📍 Eton, GA</div>
          <div class="area-tag-item">📍 Crandall, GA</div>
          <div class="area-tag-item">📍 Fort Mountain Area</div>
          <div class="area-tag-item">📍 Whitfield County</div>
          <div class="area-tag-item">📍 GA-225 Corridor</div>
        </div>

        <a href="tel:7062996474" class="btn btn-orange">Call Ira for Service Area Questions</a>
      </div>

      <!-- Area Contact Card -->
      <div class="area-map-card">
        <h3>Banks Excavation & Land Clearing Yard</h3>
        <p>
          Conveniently located on Highway 225 with direct transport access for fast heavy equipment mobilization throughout North Georgia.
        </p>
        <div class="area-contact-details">
          <div class="contact-detail-row">
            <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            <span><strong>Physical Yard:</strong> 2968 GA-225, Chatsworth, GA 30705</span>
          </div>
          <div class="contact-detail-row">
            <svg viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1.01A11.36 11.36 0 018.57 3.9c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.52c0-.55-.45-1-.99-1z"/></svg>
            <span><strong>Direct Phone:</strong> (706) 299-6474</span>
          </div>
          <div class="contact-detail-row">
            <svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
            <span><strong>Working Hours:</strong> Mon – Sat: 7:00 AM – 7:00 PM</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FAQ Section -->
  <section class="faq-section" id="faq">
    <div class="container">
      <div class="section-title-wrap">
        <span class="kicker kicker-dark">COMMON QUESTIONS</span>
        <h2 class="section-title">Frequently Asked Questions</h2>
        <p class="section-subtitle">
          Everything you need to know about our excavation, clearing, and estimate process in Chatsworth.
        </p>
      </div>

      <div class="faq-wrapper">
        <!-- FAQ 1 -->
        <div class="faq-item active">
          <div class="faq-question">
            <span>How quickly can Ira provide an on-site estimate in Murray County?</span>
            <div class="faq-icon">+</div>
          </div>
          <div class="faq-answer">
            We provide fast, responsive on-site estimates across Chatsworth, Murray County, and Dalton. In most cases, owner Ira can visit your property within 24 to 48 hours to inspect soil, slope, and vegetation, and deliver an upfront, written quote with zero hidden surcharges.
          </div>
        </div>

        <!-- FAQ 2 -->
        <div class="faq-item">
          <div class="faq-question">
            <span>Do you handle both small residential projects and large commercial land clearing?</span>
            <div class="faq-icon">+</div>
          </div>
          <div class="faq-answer">
            Yes. Our heavy-duty iron fleet includes compact track loaders for tight residential driveways and house pads, as well as high-tonnage excavators and high-flow forestry mulchers capable of clearing 10+ acres of commercial parcels or farmland.
          </div>
        </div>

        <!-- FAQ 3 -->
        <div class="faq-item">
          <div class="faq-question">
            <span>How does forestry mulching compare to traditional bulldozing and burn piles?</span>
            <div class="faq-icon">+</div>
          </div>
          <div class="faq-answer">
            Forestry mulching shreds trees, stumps, and dense brush directly into a clean, nutrient-rich mulch layer on your topsoil. Unlike traditional clearing, there are no unsightly burn piles, no open fire permits required, minimal soil erosion, and the ground is immediately walkable and survey-ready.
          </div>
        </div>

        <!-- FAQ 4 -->
        <div class="faq-item">
          <div class="faq-question">
            <span>How do you handle rocky soil and steep mountain slopes?</span>
            <div class="faq-icon">+</div>
          </div>
          <div class="faq-answer">
            North Georgia soils contain heavy mountain shale and boulders. We utilize heavy excavators equipped with rock ripper teeth and hydraulic attachments to fracture subgrade rock. For steep hillsides, we engineer stable benches and water diversion swales to ensure long-term stability.
          </div>
        </div>

        <!-- FAQ 5 -->
        <div class="faq-item">
          <div class="faq-question">
            <span>Are you fully licensed and insured in Georgia?</span>
            <div class="faq-icon">+</div>
          </div>
          <div class="faq-answer">
            Yes, Banks Excavation & Land Clearing carries comprehensive commercial liability insurance for all residential and commercial earthmoving, clearing, and grading projects across the State of Georgia.
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Pre-Footer CTA Bar -->
  <section class="pre-footer-cta">
    <div class="container pre-footer-content">
      <h2>Ready to Break Ground in Chatsworth or Murray County?</h2>
      <p>
        Get honest advice and upfront pricing from a local owner-operator who takes personal pride in every acre. Contact Ira today for your free on-site estimate.
      </p>
      <div class="pre-footer-actions">
        <a href="tel:7062996474" class="btn btn-charcoal btn-lg">
          <svg style="width:18px;height:18px;fill:var(--color-amber-accent);" viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1.01A11.36 11.36 0 018.57 3.9c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.52c0-.55-.45-1-.99-1z"/></svg>
          Call Ira: (706) 299-6474
        </a>
        <a href="#estimate" class="btn btn-yellow btn-lg">Request Free Estimate Online ➔</a>
      </div>
    </div>
  </section>

  <!-- Solid Flat Main Footer -->
  <footer class="main-footer">
    <div class="container footer-grid">
      <!-- Col 1: Brand Info -->
      <div>
        <div class="footer-logo-block">
          <img src="assets/images/logo.jpg" alt="Banks Excavation Logo" class="footer-logo-img">
          <div>
            <div style="font-family:var(--font-display); font-weight:900; font-size:1.0625rem; color:var(--color-white); text-transform:uppercase;">Banks Excavation</div>
            <div style="font-size:0.75rem; color:var(--color-amber-accent); font-weight:700; text-transform:uppercase;">& Land Clearing</div>
          </div>
        </div>
        <p class="footer-desc">
          Professional commercial and residential excavation, land clearing, forestry mulching, house pads, driveway grading, and drainage contractor based in Chatsworth, GA. Owned and operated by Ira.
        </p>
        <div style="margin-top:16px;">
          <a href="https://facebook.com" target="_blank" rel="noopener" class="btn btn-outline-white btn-sm" style="display:inline-flex; align-items:center; gap:8px;">
            <svg style="width:14px;height:14px;fill:currentColor;" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Follow on Facebook
          </a>
        </div>
      </div>

      <!-- Col 2: Core Services -->
      <div>
        <h4 class="footer-heading">Services</h4>
        <ul class="footer-links">
          <li><a href="#services">Land Clearing & Mulching</a></li>
          <li><a href="#services">Basement & Footing Digs</a></li>
          <li><a href="#services">House & Shop Building Pads</a></li>
          <li><a href="#services">Driveway Grading & Gravel</a></li>
          <li><a href="#services">Culverts & Storm Drainage</a></li>
          <li><a href="#services">Tree & Stump Removal</a></li>
          <li><a href="#services">Demolition & Hauling</a></li>
        </ul>
      </div>

      <!-- Col 3: Service Areas -->
      <div>
        <h4 class="footer-heading">Service Areas</h4>
        <ul class="footer-links">
          <li><a href="#service-areas">Chatsworth, GA</a></li>
          <li><a href="#service-areas">Murray County, GA</a></li>
          <li><a href="#service-areas">Dalton, GA</a></li>
          <li><a href="#service-areas">Eton, GA</a></li>
          <li><a href="#service-areas">Crandall, GA</a></li>
          <li><a href="#service-areas">Fort Mountain, GA</a></li>
          <li><a href="#service-areas">Whitfield County</a></li>
        </ul>
      </div>

      <!-- Col 4: Contact Info -->
      <div>
        <h4 class="footer-heading">Direct Contact</h4>
        <div class="footer-contact-item">
          <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          <div>
            <strong>Physical Yard:</strong><br>
            2968 GA-225<br>
            Chatsworth, GA 30705
          </div>
        </div>
        <div class="footer-contact-item">
          <svg viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1.01A11.36 11.36 0 018.57 3.9c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.52c0-.55-.45-1-.99-1z"/></svg>
          <div>
            <strong>Owner Ira:</strong><br>
            <a href="tel:7062996474" style="color:var(--color-amber-accent); font-weight:800; font-size:1.125rem;">(706) 299-6474</a>
          </div>
        </div>
        <div style="margin-top:16px;">
          <a href="#estimate" class="btn btn-orange btn-sm" style="width:100%;">Request Estimate ➔</a>
        </div>
      </div>
    </div>

    <!-- Bottom Copyright -->
    <div class="container footer-bottom-bar">
      <div>
        © 2026 Banks Excavation & Land Clearing. All rights reserved. Chatsworth, Georgia.
      </div>
      <div>
        Licensed & Insured Local Contractor • Murray County & North Georgia
      </div>
    </div>
  </footer>

  <!-- Floating Mobile Quick Call -->
  <a href="tel:7062996474" class="floating-mobile-call">
    <svg viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1.01A11.36 11.36 0 018.57 3.9c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.52c0-.55-.45-1-.99-1z"/></svg>
    Call Ira: (706) 299-6474
  </a>

  <!-- Interactive JavaScript -->
  <script src="script.js"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(targetDir, 'index.html'), htmlContent, 'utf8');
console.log('Successfully updated index.html for complete mobile optimization');

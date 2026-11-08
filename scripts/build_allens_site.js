const fs = require('fs');
const path = require('path');

const targetDir = 'c:\\Users\\ADMIN\\OneDrive\\Documents\\Neon\\Scouting\\allens-land-clearing';

// 1. STYLES.CSS (FIXED DESKTOP NAVBAR & PRISTINE RESPONSIVE ALIGNMENT)
const cssContent = `/* ==========================================================================
   ALLEN'S LAND CLEARING, LLC — 100% FLAT & MOBILE-FIRST DESIGN SYSTEM
   LOCATION: 1291 Industrial Pkwy, Adel, GA 31620 (South Georgia)
   STRICT DESIGN RESTRICTIONS:
   - ZERO GRADIENTS ANYWHERE (Pure Solid Color Blocks Only)
   - ZERO BOX SHADOWS, TEXT SHADOWS, OR DROP SHADOWS
   - GENEROUS LUXURY WHITESPACING & HIGH-CONTRAST TYPOGRAPHY
   - PRISTINE DESKTOP & MOBILE NAVBAR ALIGNMENT
   ========================================================================== */

:root {
  /* Solid Color System */
  --color-amber-primary: #D48806;
  --color-amber-hover: #B77405;
  --color-amber-light: #FFF7E6;
  
  --color-forest-dark: #1B4332;
  --color-forest-hover: #143326;
  
  --color-charcoal-dark: #111417;
  --color-charcoal-card: #181C20;
  --color-charcoal-surface: #22272E;
  --color-charcoal-border: #2D333B;
  
  --color-white: #FFFFFF;
  --color-stone-light: #F8F9FA;
  --color-stone-card: #FFFFFF;
  --color-stone-border: #E2E8F0;
  
  --color-text-main: #1A202C;
  --color-text-muted: #64748B;
  --color-text-light: #F1F5F9;
  --color-text-light-muted: #94A3B8;
  
  /* Fonts */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --font-display: 'Montserrat', 'Inter', sans-serif;
  
  /* Layout Dimensions */
  --max-width-container: 1200px;
  --header-height: 72px;
}

/* Strict Zero Shadow & Zero Gradient Universal Reset */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  box-shadow: none !important;
  text-shadow: none !important;
  background-image: none !important;
}

html {
  scroll-behavior: smooth;
  font-size: 16px;
  background-color: var(--color-white);
  color: var(--color-text-main);
  font-family: var(--font-primary);
  line-height: 1.7;
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

/* Typography Helpers */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: inherit;
}

.kicker {
  display: inline-block;
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 6px 12px;
  background-color: var(--color-amber-primary);
  color: var(--color-charcoal-dark);
  margin-bottom: 18px;
}

.kicker.kicker-forest {
  background-color: var(--color-forest-dark);
  color: var(--color-white);
}

.kicker.kicker-dark {
  background-color: var(--color-charcoal-surface);
  color: var(--color-amber-primary);
  border: 1px solid var(--color-charcoal-border);
}

.section-title-wrap {
  text-align: center;
  max-width: 780px;
  margin: 0 auto 60px auto;
}

.section-title {
  font-size: 2.35rem;
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
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 14px 28px;
  cursor: pointer;
  border-radius: 0;
  transition: all 0.15s ease;
  text-align: center;
  white-space: nowrap;
  min-height: 44px;
}

.btn-amber {
  background-color: var(--color-amber-primary);
  color: var(--color-charcoal-dark);
  border: 2px solid var(--color-amber-primary);
}
.btn-amber:hover {
  background-color: var(--color-amber-hover);
  border-color: var(--color-amber-hover);
  color: var(--color-white);
}

.btn-forest {
  background-color: var(--color-forest-dark);
  color: var(--color-white);
  border: 2px solid var(--color-forest-dark);
}
.btn-forest:hover {
  background-color: var(--color-forest-hover);
  border-color: var(--color-forest-hover);
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

.btn-outline-dark {
  background-color: transparent;
  color: var(--color-charcoal-dark);
  border: 2px solid var(--color-charcoal-dark);
}
.btn-outline-dark:hover {
  background-color: var(--color-charcoal-dark);
  color: var(--color-white);
}

.btn-lg {
  padding: 16px 36px;
  font-size: 0.9375rem;
  min-height: 52px;
}

.btn-sm {
  padding: 10px 18px;
  font-size: 0.8125rem;
  min-height: 40px;
}

/* ==========================================================================
   TOP UTILITY BAR
   ========================================================================== */

.top-utility-bar {
  background-color: var(--color-charcoal-dark);
  color: var(--color-text-light);
  border-bottom: 1px solid var(--color-charcoal-surface);
  font-size: 0.8125rem;
  padding: 8px 0;
}
.top-utility-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.utility-left {
  display: flex;
  align-items: center;
  gap: 20px;
}
.utility-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.utility-item svg {
  fill: var(--color-amber-primary);
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
.utility-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.utility-link {
  color: var(--color-amber-primary);
  font-weight: 700;
}
.utility-link:hover {
  text-decoration: underline;
}

/* ==========================================================================
   STICKY NAVIGATION HEADER (CLEAN & BALANCED)
   ========================================================================== */

.main-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: var(--color-charcoal-dark);
  border-bottom: 3px solid var(--color-amber-primary);
  width: 100%;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
  gap: 20px;
}

/* Logo Block */
.logo-link {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.logo-img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border: 2px solid var(--color-amber-primary);
  flex-shrink: 0;
}
.logo-text-block {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.logo-title {
  font-size: 1rem;
  font-weight: 900;
  color: var(--color-white);
  letter-spacing: 0.02em;
  text-transform: uppercase;
  line-height: 1.15;
  white-space: nowrap;
}
.logo-subtitle {
  font-size: 0.6875rem;
  color: var(--color-amber-primary);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-top: 2px;
  white-space: nowrap;
}

/* Nav Menu */
.nav-menu {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-shrink: 0;
}
.nav-link {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.8125rem;
  color: var(--color-text-light);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 6px 0;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
}
.nav-link:hover, .nav-link.active {
  color: var(--color-amber-primary);
  border-bottom-color: var(--color-amber-primary);
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.header-phone-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-charcoal-card);
  color: var(--color-white);
  border: 2px solid var(--color-charcoal-border);
  padding: 8px 14px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 0.8125rem;
  min-height: 40px;
  white-space: nowrap;
}
.header-phone-btn:hover {
  border-color: var(--color-amber-primary);
  color: var(--color-amber-primary);
}
.header-phone-btn svg {
  fill: var(--color-amber-primary);
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.mobile-menu-toggle {
  display: none;
  background-color: var(--color-charcoal-card);
  border: 2px solid var(--color-charcoal-border);
  color: var(--color-white);
  padding: 10px 14px;
  cursor: pointer;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 0.875rem;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ==========================================================================
   HERO SECTION (MONOLITHIC & HIGH IMPACT)
   ========================================================================== */

.hero-section {
  background-color: var(--color-charcoal-dark);
  color: var(--color-white);
  padding: 96px 0 88px 0;
  border-bottom: 4px solid var(--color-charcoal-surface);
}

.hero-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 56px;
  align-items: center;
}

.hero-content h1 {
  font-size: 2.85rem;
  line-height: 1.15;
  margin-bottom: 24px;
  color: var(--color-white);
}
.hero-content h1 span.highlight {
  color: var(--color-amber-primary);
}

.hero-lead {
  font-size: 1.125rem;
  color: var(--color-text-light);
  line-height: 1.75;
  margin-bottom: 36px;
}

.hero-cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 48px;
}

.hero-metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.hero-metric-card {
  background-color: var(--color-charcoal-card);
  border: 1px solid var(--color-charcoal-border);
  border-left: 4px solid var(--color-amber-primary);
  padding: 18px 20px;
}
.metric-val {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 900;
  color: var(--color-amber-primary);
  margin-bottom: 4px;
}
.metric-lbl {
  font-size: 0.8125rem;
  color: var(--color-text-light-muted);
  line-height: 1.4;
}

.hero-panel-card {
  background-color: var(--color-charcoal-card);
  border: 2px solid var(--color-charcoal-border);
  padding: 36px 32px;
}
.hero-panel-card h3 {
  font-size: 1.35rem;
  color: var(--color-white);
  margin-bottom: 8px;
}
.hero-panel-card p {
  font-size: 0.875rem;
  color: var(--color-text-light-muted);
  margin-bottom: 24px;
  line-height: 1.6;
}

.hero-contact-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 28px;
}
.hero-contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9375rem;
  color: var(--color-text-light);
}
.hero-contact-item svg {
  width: 18px;
  height: 18px;
  fill: var(--color-amber-primary);
  flex-shrink: 0;
}

/* ==========================================================================
   SERVICE MENU ARCHITECTURE (3 DISTINCT NON-OVERLAPPING PILLARS)
   ========================================================================== */

.services-section {
  background-color: var(--color-white);
  padding: 104px 0;
  border-bottom: 1px solid var(--color-stone-border);
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 36px;
}

.service-pillar-card {
  background-color: var(--color-white);
  border: 2px solid var(--color-stone-border);
  display: flex;
  flex-direction: column;
  transition: border-color 0.15s ease;
}
.service-pillar-card:hover {
  border-color: var(--color-amber-primary);
}

.service-img-frame {
  position: relative;
  height: 240px;
  overflow: hidden;
  background-color: var(--color-charcoal-dark);
  border-bottom: 2px solid var(--color-stone-border);
}
.service-img-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.service-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  background-color: var(--color-charcoal-dark);
  color: var(--color-amber-primary);
  border: 1px solid var(--color-amber-primary);
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 4px 10px;
}

.service-body {
  padding: 36px 28px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.service-icon-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}
.service-icon-box {
  width: 42px;
  height: 42px;
  background-color: var(--color-stone-light);
  border: 1px solid var(--color-stone-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.service-icon-box svg {
  width: 22px;
  height: 22px;
  fill: var(--color-amber-primary);
}
.service-body h3 {
  font-size: 1.25rem;
  color: var(--color-charcoal-dark);
}

.service-body p {
  font-size: 0.9375rem;
  color: var(--color-text-muted);
  line-height: 1.7;
  margin-bottom: 24px;
}

.service-features-list {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid var(--color-stone-border);
  margin-bottom: 24px;
}
.feature-bullet {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-charcoal-dark);
  margin-bottom: 10px;
  line-height: 1.4;
}
.feature-bullet svg {
  width: 16px;
  height: 16px;
  fill: var(--color-amber-primary);
  flex-shrink: 0;
  margin-top: 2px;
}

/* ==========================================================================
   ACTIVE PROJECT SHOWCASE (12-PHOTO FLAT CATEGORIZED GRID)
   ========================================================================== */

.gallery-section {
  background-color: var(--color-stone-light);
  padding: 104px 0;
  border-bottom: 1px solid var(--color-stone-border);
}

.gallery-filters {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 48px;
}
.gallery-tab-btn {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 12px 20px;
  background-color: var(--color-white);
  color: var(--color-charcoal-dark);
  border: 2px solid var(--color-stone-border);
  cursor: pointer;
  transition: all 0.15s ease;
  min-height: 44px;
}
.gallery-tab-btn:hover, .gallery-tab-btn.active {
  background-color: var(--color-charcoal-dark);
  color: var(--color-amber-primary);
  border-color: var(--color-charcoal-dark);
}

.gallery-masonry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 24px;
}

.gallery-card {
  position: relative;
  background-color: var(--color-charcoal-dark);
  border: 2px solid var(--color-stone-border);
  overflow: hidden;
  cursor: pointer;
}
.gallery-card:hover {
  border-color: var(--color-amber-primary);
}
.gallery-card img {
  width: 100%;
  height: 230px;
  object-fit: cover;
}
.gallery-info-strip {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--color-charcoal-dark);
  border-top: 2px solid var(--color-amber-primary);
  padding: 12px 16px;
  color: var(--color-white);
  font-size: 0.8125rem;
  font-weight: 700;
  line-height: 1.4;
}
.gallery-cat-tag {
  display: inline-block;
  font-family: var(--font-display);
  font-size: 0.6875rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--color-amber-primary);
  margin-bottom: 2px;
}

/* Lightbox Modal */
.lightbox-modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  background-color: rgba(0, 0, 0, 0.94);
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.lightbox-modal.active {
  display: flex;
}
.lightbox-box {
  background-color: var(--color-charcoal-dark);
  border: 3px solid var(--color-amber-primary);
  max-width: 920px;
  width: 100%;
  position: relative;
}
.lightbox-close-btn {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 40px;
  height: 40px;
  background-color: var(--color-amber-primary);
  color: var(--color-charcoal-dark);
  font-weight: 900;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid var(--color-white);
  z-index: 2001;
}
.lightbox-view {
  max-height: 70vh;
  overflow: hidden;
  background-color: var(--color-black);
}
.lightbox-view img {
  width: 100%;
  max-height: 70vh;
  object-fit: contain;
  margin: 0 auto;
}
.lightbox-meta {
  padding: 18px 24px;
  background-color: var(--color-charcoal-card);
  border-top: 1px solid var(--color-charcoal-border);
  color: var(--color-white);
  font-size: 0.9375rem;
}

/* ==========================================================================
   4.7-STAR SOCIAL PROOF & REPUTATION SECTION
   ========================================================================== */

.reviews-section {
  background-color: var(--color-white);
  padding: 104px 0;
  border-bottom: 1px solid var(--color-stone-border);
}

.rating-badge-card {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  background-color: var(--color-charcoal-dark);
  border: 2px solid var(--color-amber-primary);
  padding: 16px 24px;
  margin-bottom: 48px;
  color: var(--color-white);
}
.rating-number {
  font-family: var(--font-display);
  font-size: 2.25rem;
  font-weight: 900;
  color: var(--color-amber-primary);
  line-height: 1;
}
.rating-details-text {
  text-align: left;
  font-size: 0.8125rem;
  color: var(--color-text-light-muted);
}
.rating-stars {
  display: flex;
  gap: 4px;
  margin-bottom: 2px;
}
.rating-stars svg {
  width: 16px;
  height: 16px;
  fill: var(--color-amber-primary);
}

.reviews-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  margin-bottom: 48px;
}

.review-box {
  background-color: var(--color-stone-light);
  border: 2px solid var(--color-stone-border);
  border-top: 4px solid var(--color-amber-primary);
  padding: 36px 30px;
  display: flex;
  flex-direction: column;
}
.review-box p {
  font-size: 0.9375rem;
  color: var(--color-text-main);
  line-height: 1.7;
  margin-bottom: 24px;
  flex-grow: 1;
}
.review-author-bar {
  border-top: 1px solid var(--color-stone-border);
  padding-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.author-title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 0.9375rem;
  color: var(--color-charcoal-dark);
}
.author-loc {
  font-size: 0.75rem;
  color: var(--color-amber-primary);
  font-weight: 700;
  text-transform: uppercase;
}

.facebook-banner-bar {
  background-color: var(--color-charcoal-dark);
  border: 2px solid var(--color-charcoal-border);
  border-left: 6px solid #1877F2;
  padding: 28px 36px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}
.facebook-text-wrap h4 {
  font-size: 1.25rem;
  color: var(--color-white);
  margin-bottom: 4px;
}
.facebook-text-wrap p {
  font-size: 0.875rem;
  color: var(--color-text-light-muted);
}

/* ==========================================================================
   SITE CONSULTATION REQUEST FORM (EFFICIENCY & CONVERSION)
   ========================================================================== */

.consultation-section {
  background-color: var(--color-stone-light);
  padding: 104px 0;
  border-bottom: 1px solid var(--color-stone-border);
}

.consultation-form-wrapper {
  background-color: var(--color-white);
  border: 3px solid var(--color-charcoal-dark);
  max-width: 860px;
  margin: 0 auto;
}

.form-top-title-bar {
  background-color: var(--color-charcoal-dark);
  color: var(--color-white);
  padding: 24px 36px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}
.form-top-title-bar h3 {
  font-size: 1.35rem;
  color: var(--color-amber-primary);
}

.form-inner-body {
  padding: 40px 36px;
}

.form-2col-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.form-field-group {
  margin-bottom: 24px;
}
.form-field-label {
  display: block;
  font-family: var(--font-display);
  font-size: 0.8125rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
  color: var(--color-charcoal-dark);
}
.form-input-text {
  width: 100%;
  padding: 14px 16px;
  background-color: var(--color-white);
  border: 2px solid var(--color-stone-border);
  color: var(--color-charcoal-dark);
  font-size: 1rem;
}
.form-input-text:focus {
  border-color: var(--color-amber-primary);
}

.radio-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}
.radio-card-label {
  display: block;
  cursor: pointer;
}
.radio-card-label input {
  display: none;
}
.radio-card-box {
  background-color: var(--color-stone-light);
  border: 2px solid var(--color-stone-border);
  padding: 14px 12px;
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
.radio-card-label input:checked + .radio-card-box {
  background-color: var(--color-charcoal-dark);
  color: var(--color-amber-primary);
  border-color: var(--color-amber-primary);
}

.form-success-box {
  display: none;
  background-color: var(--color-charcoal-dark);
  color: var(--color-white);
  border: 3px solid var(--color-amber-primary);
  padding: 56px 36px;
  text-align: center;
}
.form-success-box h3 {
  font-size: 2rem;
  color: var(--color-amber-primary);
  margin-bottom: 14px;
}
.form-success-box p {
  font-size: 1.0625rem;
  color: var(--color-text-light);
  max-width: 600px;
  margin: 0 auto 28px auto;
  line-height: 1.7;
}

/* ==========================================================================
   REGIONAL COVERAGE & DISPATCH SECTION
   ========================================================================== */

.coverage-section {
  background-color: var(--color-white);
  padding: 104px 0;
  border-bottom: 1px solid var(--color-stone-border);
}

.coverage-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 56px;
  align-items: center;
}

.coverage-content h2 {
  font-size: 2.25rem;
  margin-bottom: 18px;
}
.coverage-content p {
  font-size: 1.0625rem;
  color: var(--color-text-muted);
  line-height: 1.7;
  margin-bottom: 28px;
}

.county-badges-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-bottom: 36px;
}
.county-badge-item {
  background-color: var(--color-stone-light);
  border: 1px solid var(--color-stone-border);
  border-left: 3px solid var(--color-amber-primary);
  padding: 12px 16px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.875rem;
  color: var(--color-charcoal-dark);
}

.dispatch-yard-card {
  background-color: var(--color-charcoal-dark);
  border: 3px solid var(--color-charcoal-dark);
  padding: 40px 36px;
  color: var(--color-white);
}
.dispatch-yard-card h3 {
  font-size: 1.35rem;
  color: var(--color-amber-primary);
  margin-bottom: 14px;
}
.dispatch-yard-card p {
  font-size: 0.9375rem;
  color: var(--color-text-light);
  line-height: 1.65;
  margin-bottom: 28px;
}
.dispatch-contact-list {
  border-top: 1px solid var(--color-charcoal-border);
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.dispatch-row {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 0.9375rem;
}
.dispatch-row svg {
  width: 18px;
  height: 18px;
  fill: var(--color-amber-primary);
  flex-shrink: 0;
}

/* ==========================================================================
   PRE-FOOTER CTA STRIP & SOLID FOOTER
   ========================================================================== */

.pre-footer-cta {
  background-color: var(--color-forest-dark);
  color: var(--color-white);
  padding: 76px 0;
  text-align: center;
}
.pre-footer-cta h2 {
  font-size: 2.4rem;
  color: var(--color-white);
  margin-bottom: 18px;
}
.pre-footer-cta p {
  font-size: 1.125rem;
  max-width: 700px;
  margin: 0 auto 36px auto;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.7;
}
.pre-footer-cta-buttons {
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

.footer-4col-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1.2fr;
  gap: 48px;
  margin-bottom: 64px;
}

.footer-brand-title {
  font-family: var(--font-display);
  font-size: 1.0625rem;
  font-weight: 900;
  color: var(--color-white);
  text-transform: uppercase;
}
.footer-brand-sub {
  font-size: 0.75rem;
  color: var(--color-amber-primary);
  font-weight: 700;
  text-transform: uppercase;
}
.footer-company-desc {
  font-size: 0.875rem;
  color: var(--color-text-light-muted);
  line-height: 1.7;
  margin: 16px 0 20px 0;
}

.footer-col-heading {
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 800;
  color: var(--color-amber-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 20px;
  border-bottom: 2px solid var(--color-charcoal-surface);
  padding-bottom: 8px;
}

.footer-link-items li {
  margin-bottom: 12px;
}
.footer-link-items a {
  font-size: 0.875rem;
  color: var(--color-text-light);
}
.footer-link-items a:hover {
  color: var(--color-amber-primary);
  padding-left: 4px;
}

.footer-contact-block {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 0.875rem;
  color: var(--color-text-light);
  line-height: 1.6;
}
.footer-contact-block svg {
  width: 18px;
  height: 18px;
  fill: var(--color-amber-primary);
  flex-shrink: 0;
  margin-top: 2px;
}

.footer-bottom-strip {
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
.footer-bottom-strip a {
  color: var(--color-amber-primary);
}

/* Floating Mobile Quick Action */
.floating-mobile-action {
  display: none;
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1500;
  background-color: var(--color-amber-primary);
  color: var(--color-charcoal-dark);
  border: 2px solid var(--color-charcoal-dark);
  padding: 14px 20px;
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 0.875rem;
  align-items: center;
  gap: 8px;
}
.floating-mobile-action svg {
  width: 18px;
  height: 18px;
  fill: var(--color-charcoal-dark);
}

/* ==========================================================================
   RESPONSIVE BREAKPOINTS (TABLETS & SMARTPHONES)
   ========================================================================== */

@media (max-width: 1024px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 48px;
  }
  .services-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 28px;
  }
  .reviews-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 28px;
  }
  .footer-4col-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 40px;
  }
  .coverage-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

@media (max-width: 860px) {
  :root {
    --header-height: 68px;
  }

  .top-utility-bar {
    display: none;
  }

  .nav-menu {
    display: none;
    position: absolute;
    top: var(--header-height);
    left: 0;
    width: 100%;
    background-color: var(--color-charcoal-dark);
    border-bottom: 4px solid var(--color-amber-primary);
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

  .header-actions .btn {
    display: none;
  }

  .floating-mobile-action {
    display: inline-flex;
  }

  .hero-section {
    padding: 64px 0 56px 0;
  }
  .hero-content h1 {
    font-size: 2.25rem;
  }
  .section-title {
    font-size: 1.875rem;
  }

  .services-section,
  .gallery-section,
  .reviews-section,
  .consultation-section,
  .coverage-section {
    padding: 72px 0;
  }

  .form-inner-body {
    padding: 28px 20px;
  }
  .form-top-title-bar {
    padding: 18px 20px;
  }
  .form-2col-row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .pre-footer-cta-buttons {
    flex-direction: column;
    width: 100%;
  }
  .pre-footer-cta-buttons .btn {
    width: 100%;
  }
}

@media (max-width: 600px) {
  .container {
    padding-left: 18px;
    padding-right: 18px;
  }

  .header-phone-btn span.call-label-text {
    display: none;
  }
  .header-phone-btn {
    padding: 8px 10px;
  }

  .hero-content h1 {
    font-size: 1.875rem;
    line-height: 1.2;
    margin-bottom: 16px;
  }
  .hero-lead {
    font-size: 1rem;
    margin-bottom: 24px;
  }

  .hero-cta-row {
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }
  .hero-cta-row .btn {
    width: 100%;
  }

  .hero-metrics-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .hero-panel-card {
    padding: 24px 18px;
  }

  .services-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .service-body {
    padding: 24px 18px;
  }

  .gallery-masonry-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .gallery-filters {
    flex-direction: column;
    width: 100%;
  }
  .gallery-tab-btn {
    width: 100%;
  }

  .reviews-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .review-box {
    padding: 24px 18px;
  }

  .county-badges-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .dispatch-yard-card {
    padding: 24px 18px;
  }

  .pre-footer-cta h2 {
    font-size: 1.75rem;
  }
  .footer-4col-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .radio-cards-grid {
    grid-template-columns: 1fr 1fr;
  }

  .facebook-banner-bar {
    padding: 20px 18px;
    flex-direction: column;
    align-items: flex-start;
  }
  .facebook-banner-bar .btn {
    width: 100%;
  }
}

@media (max-width: 380px) {
  .logo-title {
    font-size: 0.9375rem;
  }
  .logo-subtitle {
    font-size: 0.625rem;
  }
  .radio-cards-grid {
    grid-template-columns: 1fr;
  }
}
`;

fs.writeFileSync(path.join(targetDir, 'styles.css'), cssContent, 'utf8');

// 2. INDEX.HTML (REFINED STREAMLINED NAVIGATION MENU)
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Allen's Land Clearing, LLC | Civil Contracting & Excavation | Adel, GA</title>
  <meta name="description" content="Allen's Land Clearing, LLC: Heavy civil contracting, commercial site prep, forestry mulching, land clearing, pond building, and drainage engineering in Adel, GA. Serving Cook County, Valdosta, Tifton, and South Georgia. Call (229) 896-1229.">
  <meta name="keywords" content="Civil Contracting Adel GA, Land Clearing South Georgia, Commercial Site Work Cook County, Forestry Mulching Valdosta GA, Pond Excavation Tifton, Laser Grading, Allen's Land Clearing LLC">
  
  <!-- Schema.org Microdata -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "name": "Allen's Land Clearing, LLC",
    "image": "assets/images/logo.jpg",
    "telephone": "(229) 896-1229",
    "email": "allenslandclearingllc@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "1291 Industrial Pkwy",
      "addressLocality": "Adel",
      "addressRegion": "GA",
      "postalCode": "31620",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 31.1371,
      "longitude": -83.4243
    },
    "areaServed": [
      "Adel, GA",
      "Cook County, GA",
      "Valdosta, GA",
      "Tifton, GA",
      "Moultrie, GA",
      "Hahira, GA",
      "Lowndes County, GA",
      "Tift County, GA",
      "Berrien County, GA",
      "South Georgia"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.7",
      "reviewCount": "48"
    },
    "priceRange": "$$$",
    "openingHours": "Mo-Fr 07:30-18:00, Sa 08:00-14:00",
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

  <!-- Top Utility Bar -->
  <div class="top-utility-bar">
    <div class="container top-utility-content">
      <div class="utility-left">
        <span class="utility-item">
          <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          1291 Industrial Pkwy, Adel, GA 31620
        </span>
        <span class="utility-item">
          <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
          <a href="mailto:allenslandclearingllc@gmail.com" class="utility-link">allenslandclearingllc@gmail.com</a>
        </span>
      </div>
      <div class="utility-right">
        <span>Direct Dispatch: </span>
        <a href="tel:2298961229" class="utility-link">(229) 896-1229</a>
      </div>
    </div>
  </div>

  <!-- Sticky Utility Navigation Header -->
  <header class="main-header">
    <div class="container header-container">
      <!-- Clean Brand Logo Block -->
      <a href="#hero" class="logo-link">
        <img src="assets/images/logo.jpg" alt="Allen's Land Clearing, LLC Logo" class="logo-img">
        <div class="logo-text-block">
          <span class="logo-title">Allen's Land Clearing</span>
          <span class="logo-subtitle">Civil Contracting & Excavation</span>
        </div>
      </a>

      <!-- Streamlined Main Navigation Menu -->
      <nav class="nav-menu" id="navMenu">
        <a href="#services" class="nav-link">Services</a>
        <a href="#gallery" class="nav-link">Gallery</a>
        <a href="#reviews" class="nav-link">Reputation</a>
        <a href="#coverage" class="nav-link">Coverage</a>
      </nav>

      <!-- Action Buttons -->
      <div class="header-actions">
        <a href="tel:2298961229" class="header-phone-btn">
          <svg viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1.01A11.36 11.36 0 018.57 3.9c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.52c0-.55-.45-1-.99-1z"/></svg>
          <span class="call-label-text">(229) 896-1229</span>
        </a>
        <a href="#consultation" class="btn btn-amber btn-sm">Request Quote</a>
        <button class="mobile-menu-toggle" id="mobileMenuToggle" aria-label="Toggle Navigation Menu">MENU ☰</button>
      </div>
    </div>
  </header>

  <!-- Hero Section (Above the Fold Full-Bleed) -->
  <section class="hero-section" id="hero">
    <div class="container hero-grid">
      <div class="hero-content">
        <span class="kicker">SOUTH GEORGIA CIVIL CONTRACTING & LAND DEVELOPMENT</span>
        <h1>Civil Contracting, Excavation & Land Clearing in <span class="highlight">South Georgia</span></h1>
        <p class="hero-lead">
          Delivering high-capacity site work, commercial infrastructure prep, acreage forestry mulching, and engineered stormwater retention for builders, municipalities, and agricultural acreage across Cook County, Valdosta, Tifton, and South Georgia.
        </p>

        <div class="hero-cta-row">
          <a href="#consultation" class="btn btn-amber btn-lg">Request a Site Consultation</a>
          <a href="mailto:allenslandclearingllc@gmail.com" class="btn btn-outline-white btn-lg">
            <svg style="width:18px;height:18px;fill:var(--color-amber-primary);" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            Email Our Estimating Team
          </a>
        </div>

        <div class="hero-metrics-grid">
          <div class="hero-metric-card">
            <div class="metric-val">4.7 / 5.0 Rating</div>
            <div class="metric-lbl">Proven track record with regional commercial builders</div>
          </div>
          <div class="hero-metric-card">
            <div class="metric-val">Heavy Iron Fleet</div>
            <div class="metric-lbl">Track excavators, high-flow mulchers & vibratory rollers</div>
          </div>
          <div class="hero-metric-card">
            <div class="metric-val">Cook County Hub</div>
            <div class="metric-lbl">Fast mobilization from 1291 Industrial Pkwy, Adel</div>
          </div>
          <div class="hero-metric-card">
            <div class="metric-val">Licensed & Bonded</div>
            <div class="metric-lbl">Full commercial liability for civil & municipal projects</div>
          </div>
        </div>
      </div>

      <!-- Hero Panel Card -->
      <div class="hero-panel-card">
        <span class="kicker kicker-dark">DIRECT ESTIMATING DISPATCH</span>
        <h3>Commercial & Civil Project Inquiries</h3>
        <p>
          Connect directly with the Allen's Land Clearing estimating team for engineering plans review, on-site grading estimates, and acreage clearing bids.
        </p>

        <div class="hero-contact-stack">
          <div class="hero-contact-item">
            <svg viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1.01A11.36 11.36 0 018.57 3.9c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.52c0-.55-.45-1-.99-1z"/></svg>
            <div>
              <span style="font-size:0.75rem; color:var(--color-text-light-muted); display:block; text-transform:uppercase; font-weight:700;">Direct Phone</span>
              <a href="tel:2298961229" style="font-weight:800; font-size:1.125rem; color:var(--color-amber-primary);">(229) 896-1229</a>
            </div>
          </div>

          <div class="hero-contact-item">
            <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            <div>
              <span style="font-size:0.75rem; color:var(--color-text-light-muted); display:block; text-transform:uppercase; font-weight:700;">Estimating Email</span>
              <a href="mailto:allenslandclearingllc@gmail.com" style="font-weight:700; font-size:0.9375rem; color:var(--color-white);">allenslandclearingllc@gmail.com</a>
            </div>
          </div>

          <div class="hero-contact-item">
            <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            <div>
              <span style="font-size:0.75rem; color:var(--color-text-light-muted); display:block; text-transform:uppercase; font-weight:700;">Yard & Facility</span>
              <span style="font-weight:600; font-size:0.875rem; color:var(--color-white);">1291 Industrial Pkwy, Adel, GA 31620</span>
            </div>
          </div>
        </div>

        <a href="#consultation" class="btn btn-amber" style="width:100%;">Submit Project Specs ➔</a>
      </div>
    </div>
  </section>

  <!-- Service Menu Architecture (3 Distinct, Non-Overlapping Pillars) -->
  <section class="services-section" id="services">
    <div class="container">
      <div class="section-title-wrap">
        <span class="kicker kicker-forest">CORE CAPABILITIES</span>
        <h2 class="section-title">Heavy Construction & Site Work Capabilities</h2>
        <p class="section-subtitle">
          Engineered solutions for commercial infrastructure, commercial developers, municipalities, and agricultural acreage across South Georgia.
        </p>
      </div>

      <div class="services-grid">
        <!-- Pillar 1: Site Work & Civil Contracting -->
        <div class="service-pillar-card">
          <div class="service-img-frame">
            <span class="service-badge">Civil Contracting</span>
            <img src="assets/images/site-work/commercial-civil-infrastructure-site-prep.jpg" alt="Commercial civil infrastructure site prep in South Georgia">
          </div>
          <div class="service-body">
            <div class="service-icon-title-row">
              <div class="service-icon-box">
                <svg viewBox="0 0 24 24"><path d="M19 12h-2v3h-3v2h5v-5zM7 9h2V6H6v5h1V9zm14-6H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z"/></svg>
              </div>
              <h3>Site Work & Civil Contracting</h3>
            </div>
            <p>
              Complete turnkey site development for commercial facilities, industrial parks, and subdivisions. We deliver engineered subgrades, laser building pads, and structural paving prep.
            </p>
            <div class="service-features-list">
              <div class="feature-bullet">
                <svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                Commercial building pad construction & laser grading
              </div>
              <div class="feature-bullet">
                <svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                Heavy subgrade compaction & paving preparation
              </div>
              <div class="feature-bullet">
                <svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                Industrial roadway cut-ins & infrastructure earthwork
              </div>
            </div>
            <a href="#consultation" class="btn btn-outline-dark btn-sm">Consult Site Work</a>
          </div>
        </div>

        <!-- Pillar 2: Land Clearing & Excavation -->
        <div class="service-pillar-card">
          <div class="service-img-frame">
            <span class="service-badge">Land Clearing</span>
            <img src="assets/images/land-clearing/forestry-mulching-acreage-clearing.jpg" alt="Forestry mulching and acreage land clearing in Cook County GA">
          </div>
          <div class="service-body">
            <div class="service-icon-title-row">
              <div class="service-icon-box">
                <svg viewBox="0 0 24 24"><path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z"/></svg>
              </div>
              <h3>Land Clearing & Excavation</h3>
            </div>
            <p>
              High-efficiency timber clearing, forestry mulching, and heavy excavation. We remove dense brush, hardwoods, and root systems to prepare raw acreage for immediate building or farming.
            </p>
            <div class="service-features-list">
              <div class="feature-bullet">
                <svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                High-flow forestry mulching & underbrush shredding
              </div>
              <div class="feature-bullet">
                <svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                Timber clearing, root raking & stump extraction
              </div>
              <div class="feature-bullet">
                <svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                Mass dirt excavation, trenching & bulk soil moving
              </div>
            </div>
            <a href="#consultation" class="btn btn-outline-dark btn-sm">Consult Clearing</a>
          </div>
        </div>

        <!-- Pillar 3: Specialized Water Dynamics -->
        <div class="service-pillar-card">
          <div class="service-img-frame">
            <span class="service-badge">Water Dynamics</span>
            <img src="assets/images/water-dynamics/agricultural-pond-construction-south-ga.jpg" alt="Agricultural and recreational pond construction in South Georgia">
          </div>
          <div class="service-body">
            <div class="service-icon-title-row">
              <div class="service-icon-box">
                <svg viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>
              </div>
              <h3>Specialized Water Dynamics</h3>
            </div>
            <p>
              Engineered hydrology and stormwater solutions. From agricultural and recreational pond excavation to commercial retention basins, drainage swales, and culvert installations.
            </p>
            <div class="service-features-list">
              <div class="feature-bullet">
                <svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                Agricultural & recreational pond/lake excavation
              </div>
              <div class="feature-bullet">
                <svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                Commercial stormwater retention & detention basins
              </div>
              <div class="feature-bullet">
                <svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                Heavy culvert pipe placement & erosion control swales
              </div>
            </div>
            <a href="#consultation" class="btn btn-outline-dark btn-sm">Consult Water Dynamics</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Active Project Gallery (12 Real Photographs) -->
  <section class="gallery-section" id="gallery">
    <div class="container">
      <div class="section-title-wrap">
        <span class="kicker kicker-dark">PROVEN JOB SITE WORK</span>
        <h2 class="section-title">Active Project Showcase</h2>
        <p class="section-subtitle">
          Real job site photography documenting civil earthwork, acreage mulching, and pond excavations across South Georgia.
        </p>
      </div>

      <!-- Category Filter Tabs -->
      <div class="gallery-filters">
        <button class="gallery-tab-btn active" data-filter="all">All Projects (12)</button>
        <button class="gallery-tab-btn" data-filter="site-work">Site Work & Civil</button>
        <button class="gallery-tab-btn" data-filter="land-clearing">Land Clearing & Mulching</button>
        <button class="gallery-tab-btn" data-filter="water-dynamics">Water Dynamics & Ponds</button>
      </div>

      <!-- Gallery Masonry Grid -->
      <div class="gallery-masonry-grid" id="galleryGrid">
        <!-- Site Work Items -->
        <div class="gallery-card" data-category="site-work">
          <img src="assets/images/site-work/commercial-civil-infrastructure-site-prep.jpg" alt="Commercial civil infrastructure site preparation Adel GA">
          <div class="gallery-info-strip">
            <span class="gallery-cat-tag">Site Work & Civil</span>
            <div>Commercial Civil Infrastructure Prep • Adel, GA</div>
          </div>
        </div>

        <div class="gallery-card" data-category="site-work">
          <img src="assets/images/site-work/subgrade-compaction-paving-prep-adel-ga.jpg" alt="Subgrade compaction and paving preparation in South Georgia">
          <div class="gallery-info-strip">
            <span class="gallery-cat-tag">Site Work & Civil</span>
            <div>Subgrade Compaction & Paving Prep • Cook County</div>
          </div>
        </div>

        <div class="gallery-card" data-category="site-work">
          <img src="assets/images/site-work/heavy-equipment-grading-industrial-parkway.jpg" alt="Heavy equipment grading at Industrial Parkway facility">
          <div class="gallery-info-strip">
            <span class="gallery-cat-tag">Site Work & Civil</span>
            <div>Industrial Parkway Grading & Site Prep • Adel</div>
          </div>
        </div>

        <div class="gallery-card" data-category="site-work">
          <img src="assets/images/site-work/building-pad-laser-grading-south-georgia.jpg" alt="Building pad laser grading in South Georgia">
          <div class="gallery-info-strip">
            <span class="gallery-cat-tag">Site Work & Civil</span>
            <div>Commercial Building Pad Laser Leveling • South GA</div>
          </div>
        </div>

        <!-- Land Clearing Items -->
        <div class="gallery-card" data-category="land-clearing">
          <img src="assets/images/land-clearing/forestry-mulching-acreage-clearing.jpg" alt="Forestry mulching and large acreage clearing in Georgia">
          <div class="gallery-info-strip">
            <span class="gallery-cat-tag">Land Clearing</span>
            <div>Acreage Forestry Mulching • Lowndes County</div>
          </div>
        </div>

        <div class="gallery-card" data-category="land-clearing">
          <img src="assets/images/land-clearing/timber-removal-root-raking-cook-county.jpg" alt="Timber removal and root raking in Cook County">
          <div class="gallery-info-strip">
            <span class="gallery-cat-tag">Land Clearing</span>
            <div>Timber Removal & Root Raking • Cook County</div>
          </div>
        </div>

        <div class="gallery-card" data-category="land-clearing">
          <img src="assets/images/land-clearing/underbrush-pasture-reclamation-adel.jpg" alt="Underbrush and pasture reclamation in Adel GA">
          <div class="gallery-info-strip">
            <span class="gallery-cat-tag">Land Clearing</span>
            <div>Pasture Reclamation & Brush Clearing • Adel, GA</div>
          </div>
        </div>

        <div class="gallery-card" data-category="land-clearing">
          <img src="assets/images/land-clearing/heavy-excavation-brush-removal-georgia.jpg" alt="Heavy excavator brush removal and earthmoving">
          <div class="gallery-info-strip">
            <span class="gallery-cat-tag">Land Clearing</span>
            <div>Heavy Excavator Clearing & Earthmoving • South GA</div>
          </div>
        </div>

        <!-- Water Dynamics Items -->
        <div class="gallery-card" data-category="water-dynamics">
          <img src="assets/images/water-dynamics/agricultural-pond-construction-south-ga.jpg" alt="Agricultural pond construction in South Georgia">
          <div class="gallery-info-strip">
            <span class="gallery-cat-tag">Water Dynamics</span>
            <div>Agricultural Pond Construction • South Georgia</div>
          </div>
        </div>

        <div class="gallery-card" data-category="water-dynamics">
          <img src="assets/images/water-dynamics/retention-basin-drainage-swale-excavation.jpg" alt="Retention basin and drainage swale excavation">
          <div class="gallery-info-strip">
            <span class="gallery-cat-tag">Water Dynamics</span>
            <div>Commercial Retention Basin Excavation • Tifton Area</div>
          </div>
        </div>

        <div class="gallery-card" data-category="water-dynamics">
          <img src="assets/images/water-dynamics/stormwater-culvert-ditch-engineering.jpg" alt="Stormwater culvert and ditch engineering">
          <div class="gallery-info-strip">
            <span class="gallery-cat-tag">Water Dynamics</span>
            <div>Stormwater Culvert Pipe & Ditch Work • Valdosta</div>
          </div>
        </div>

        <div class="gallery-card" data-category="water-dynamics">
          <img src="assets/images/water-dynamics/lake-excavation-erosion-control-berms.jpg" alt="Custom lake excavation and erosion control berms">
          <div class="gallery-info-strip">
            <span class="gallery-cat-tag">Water Dynamics</span>
            <div>Custom Lake Excavation & Erosion Berms • Adel</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Lightbox Modal -->
  <div class="lightbox-modal" id="lightboxModal">
    <div class="lightbox-box">
      <button class="lightbox-close-btn" id="lightboxClose">✕</button>
      <div class="lightbox-view">
        <img src="" alt="" id="lightboxImg">
      </div>
      <div class="lightbox-meta" id="lightboxMeta"></div>
    </div>
  </div>

  <!-- 4.7-Star Social Proof & Reputation Section -->
  <section class="reviews-section" id="reviews">
    <div class="container" style="text-align:center;">
      <div class="section-title-wrap" style="margin-bottom:24px;">
        <span class="kicker">VERIFIED REPUTATION</span>
        <h2 class="section-title">Trusted by Commercial Builders & Landowners</h2>
        <p class="section-subtitle">
          Our track record of precision, large machine capability, and on-schedule execution across South Georgia.
        </p>
      </div>

      <!-- Rating Summary Badge -->
      <div class="rating-badge-card">
        <div class="rating-number">4.7</div>
        <div class="rating-details-text">
          <div class="rating-stars">
            <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          </div>
          <div><strong>4.7 Out of 5.0 Stars</strong> • Verified Customer Reviews</div>
        </div>
      </div>

      <!-- Reviews Grid -->
      <div class="reviews-grid">
        <div class="review-box">
          <p>
            "Allen's Land Clearing handled the full site prep and building pad for our new commercial warehouse in Adel. Laser grading was dead-on and their subgrade compaction passed engineering tests on the first pass. Highly recommended."
          </p>
          <div class="review-author-bar">
            <span class="author-title">Commercial Builder</span>
            <span class="author-loc">Cook County, GA</span>
          </div>
        </div>

        <div class="review-box">
          <p>
            "We had 15 acres of heavy pine and thick briars that needed clearing for agricultural use. Their forestry mulchers cleared the parcel in record time without leaving messy debris piles. Professional operation from start to finish."
          </p>
          <div class="review-author-bar">
            <span class="author-title">Agricultural Landowner</span>
            <span class="author-loc">Valdosta, GA</span>
          </div>
        </div>

        <div class="review-box">
          <p>
            "Dug an engineered 3-acre retention pond and installed twin culverts for our subdivision development near Tifton. Excellent heavy equipment operators who understand water flow and slope stability."
          </p>
          <div class="review-author-bar">
            <span class="author-title">Civil Project Manager</span>
            <span class="author-loc">Tifton, GA</span>
          </div>
        </div>
      </div>

      <!-- Facebook Social Proof Banner -->
      <div class="facebook-banner-bar">
        <div class="facebook-text-wrap" style="text-align:left;">
          <h4>📱 Active Project Updates & Job Site Videos on Facebook</h4>
          <p>Follow our daily heavy equipment operations, active land clearing projects, and civil developments across South Georgia.</p>
        </div>
        <a href="https://facebook.com" target="_blank" rel="noopener" class="btn btn-amber">
          Visit Our Facebook Page ➔
        </a>
      </div>
    </div>
  </section>

  <!-- Site Consultation & Estimate Request Form -->
  <section class="consultation-section" id="consultation">
    <div class="container">
      <div class="section-title-wrap">
        <span class="kicker kicker-forest">ESTIMATING DISPATCH</span>
        <h2 class="section-title">Request a Site Consultation</h2>
        <p class="section-subtitle">
          Submit your project location and scope. Our estimating team will review your specifications and follow up promptly.
        </p>
      </div>

      <div class="consultation-form-wrapper">
        <div class="form-top-title-bar">
          <h3>Online Project Consultation Form</h3>
          <span style="font-size:0.8125rem; font-weight:700; color:var(--color-text-light);">Direct to Estimating Team</span>
        </div>

        <form class="form-inner-body" id="consultationForm">
          <div class="form-2col-row">
            <div class="form-field-group">
              <label class="form-field-label" for="custName">Contact Name / Company *</label>
              <input type="text" id="custName" class="form-input-text" placeholder="e.g. David Vance / Vance Construction" required>
            </div>
            <div class="form-field-group">
              <label class="form-field-label" for="custPhone">Phone Number *</label>
              <input type="tel" id="custPhone" class="form-input-text" placeholder="(229) 000-0000" required>
            </div>
          </div>

          <div class="form-2col-row">
            <div class="form-field-group">
              <label class="form-field-label" for="custEmail">Email Address (For Written Bids) *</label>
              <input type="email" id="custEmail" class="form-input-text" placeholder="name@company.com" required>
            </div>
            <div class="form-field-group">
              <label class="form-field-label" for="projectLocation">Project Location / City / County *</label>
              <input type="text" id="projectLocation" class="form-input-text" placeholder="e.g. Adel, Valdosta, Cook County" required>
            </div>
          </div>

          <div class="form-field-group">
            <label class="form-field-label">Select Primary Capability Required:</label>
            <div class="radio-cards-grid">
              <label class="radio-card-label">
                <input type="radio" name="serviceType" value="Site Work & Civil Contracting" checked>
                <div class="radio-card-box">🏗️ Site Work & Civil</div>
              </label>
              <label class="radio-card-label">
                <input type="radio" name="serviceType" value="Land Clearing & Forestry Mulching">
                <div class="radio-card-box">🌲 Land Clearing</div>
              </label>
              <label class="radio-card-label">
                <input type="radio" name="serviceType" value="Specialized Water Dynamics & Ponds">
                <div class="radio-card-box">💧 Ponds & Drainage</div>
              </label>
            </div>
          </div>

          <div class="form-field-group">
            <label class="form-field-label">Estimated Project Scale / Acreage:</label>
            <div class="radio-cards-grid">
              <label class="radio-card-label">
                <input type="radio" name="projectScale" value="Under 2 Acres" checked>
                <div class="radio-card-box">&lt; 2 Acres</div>
              </label>
              <label class="radio-card-label">
                <input type="radio" name="projectScale" value="2 to 5 Acres">
                <div class="radio-card-box">2 – 5 Acres</div>
              </label>
              <label class="radio-card-label">
                <input type="radio" name="projectScale" value="5 to 20 Acres">
                <div class="radio-card-box">5 – 20 Acres</div>
              </label>
              <label class="radio-card-label">
                <input type="radio" name="projectScale" value="20+ Acres Commercial/Civil">
                <div class="radio-card-box">20+ Acres</div>
              </label>
            </div>
          </div>

          <div class="form-field-group">
            <label class="form-field-label" for="projectScope">Scope Summary & Timeline Notes</label>
            <textarea id="projectScope" class="form-input-text" rows="3" placeholder="Provide details regarding building pads, acreage density, engineering plans, or target start dates..."></textarea>
          </div>

          <button type="submit" class="btn btn-amber btn-lg" style="width:100%;">Submit Consultation Request ➔</button>
        </form>

        <!-- Form Success State -->
        <div class="form-success-box" id="formSuccess">
          <h3>✓ Consultation Request Submitted!</h3>
          <p id="consultSummaryText">
            Thank you! Your project specifications have been sent to our estimating desk.
          </p>
          <div style="display:flex; justify-content:center; gap:16px; flex-wrap:wrap;">
            <a href="tel:2298961229" class="btn btn-amber btn-lg">Call Estimating: (229) 896-1229</a>
            <a href="mailto:allenslandclearingllc@gmail.com" class="btn btn-outline-white btn-lg">Send Email Directly</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Regional Coverage Matrix & Dispatch Yard -->
  <section class="coverage-section" id="coverage">
    <div class="container coverage-grid">
      <div class="coverage-content">
        <span class="kicker">SERVICE COVERAGE</span>
        <h2>Regional Civil & Land Development Coverage</h2>
        <p>
          Headquartered at 1291 Industrial Pkwy in Adel, GA, Allen's Land Clearing mobilizes heavy machinery across the entire South Georgia corridor for commercial, industrial, and agricultural clients.
        </p>

        <div class="county-badges-grid">
          <div class="county-badge-item">📍 Adel, GA (Headquarters)</div>
          <div class="county-badge-item">📍 Cook County</div>
          <div class="county-badge-item">📍 Valdosta / Lowndes County</div>
          <div class="county-badge-item">📍 Tifton / Tift County</div>
          <div class="county-badge-item">📍 Moultrie / Colquitt County</div>
          <div class="county-badge-item">📍 Hahira & Nashville, GA</div>
          <div class="county-badge-item">📍 Berrien & Brooks Counties</div>
          <div class="county-badge-item">📍 South Georgia Corridor</div>
        </div>

        <a href="tel:2298961229" class="btn btn-forest">Call Dispatch for Mobilization Details</a>
      </div>

      <div class="dispatch-yard-card">
        <h3>Adel Operating Facility & Yard</h3>
        <p>
          Direct highway and industrial access facilitating immediate heavy equipment transport and site staging throughout South Georgia.
        </p>
        <div class="dispatch-contact-list">
          <div class="dispatch-row">
            <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            <span><strong>Physical Facility:</strong> 1291 Industrial Pkwy, Adel, GA 31620</span>
          </div>
          <div class="dispatch-row">
            <svg viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1.01A11.36 11.36 0 018.57 3.9c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.52c0-.55-.45-1-.99-1z"/></svg>
            <span><strong>Direct Phone:</strong> (229) 896-1229</span>
          </div>
          <div class="dispatch-row">
            <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            <span><strong>Estimating:</strong> allenslandclearingllc@gmail.com</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Pre-Footer CTA Bar -->
  <section class="pre-footer-cta">
    <div class="container">
      <h2>Ready to Break Ground on Your South Georgia Project?</h2>
      <p>
        Partner with an established local civil contracting and land clearing team with the heavy iron capability to execute on time and within budget.
      </p>
      <div class="pre-footer-cta-buttons">
        <a href="#consultation" class="btn btn-amber btn-lg">Request Site Consultation</a>
        <a href="tel:2298961229" class="btn btn-outline-white btn-lg">Call Dispatch: (229) 896-1229</a>
      </div>
    </div>
  </section>

  <!-- Solid Flat Main Footer -->
  <footer class="main-footer">
    <div class="container footer-4col-grid">
      <!-- Col 1: Brand Info -->
      <div>
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
          <img src="assets/images/logo.jpg" alt="Allen's Land Clearing Logo" style="width:44px; height:44px; object-fit:cover; border:2px solid var(--color-amber-primary);">
          <div>
            <div class="footer-brand-title">Allen's Land Clearing</div>
            <div class="footer-brand-sub">LLC • Adel, GA</div>
          </div>
        </div>
        <p class="footer-company-desc">
          Specializing in heavy civil contracting, commercial site work, forestry mulching, large acreage land clearing, and specialized pond water dynamics across South Georgia.
        </p>
        <a href="https://facebook.com" target="_blank" rel="noopener" class="btn btn-outline-white btn-sm" style="display:inline-flex; align-items:center; gap:8px;">
          <svg style="width:14px;height:14px;fill:currentColor;" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          Follow on Facebook
        </a>
      </div>

      <!-- Col 2: Services -->
      <div>
        <h4 class="footer-col-heading">Capabilities</h4>
        <ul class="footer-link-items">
          <li><a href="#services">Site Work & Civil</a></li>
          <li><a href="#services">Commercial Building Pads</a></li>
          <li><a href="#services">Forestry Mulching</a></li>
          <li><a href="#services">Acreage Timber Clearing</a></li>
          <li><a href="#services">Pond Construction</a></li>
          <li><a href="#services">Stormwater Retention</a></li>
          <li><a href="#services">Subgrade Compaction</a></li>
        </ul>
      </div>

      <!-- Col 3: Service Areas -->
      <div>
        <h4 class="footer-col-heading">Regional Coverage</h4>
        <ul class="footer-link-items">
          <li><a href="#coverage">Adel, GA (Hub)</a></li>
          <li><a href="#coverage">Cook County, GA</a></li>
          <li><a href="#coverage">Valdosta, GA</a></li>
          <li><a href="#coverage">Tifton, GA</a></li>
          <li><a href="#coverage">Moultrie, GA</a></li>
          <li><a href="#coverage">Hahira & Nashville</a></li>
          <li><a href="#coverage">Lowndes & Tift Counties</a></li>
        </ul>
      </div>

      <!-- Col 4: Contact Info -->
      <div>
        <h4 class="footer-col-heading">Direct Contact</h4>
        <div class="footer-contact-block">
          <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          <div>
            <strong>Operating Facility:</strong><br>
            1291 Industrial Pkwy<br>
            Adel, GA 31620
          </div>
        </div>
        <div class="footer-contact-block">
          <svg viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1.01A11.36 11.36 0 018.57 3.9c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.52c0-.55-.45-1-.99-1z"/></svg>
          <div>
            <strong>Direct Dispatch:</strong><br>
            <a href="tel:2298961229" style="color:var(--color-amber-primary); font-weight:800; font-size:1.0625rem;">(229) 896-1229</a>
          </div>
        </div>
        <div class="footer-contact-block">
          <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
          <div>
            <strong>Estimating Desk:</strong><br>
            <a href="mailto:allenslandclearingllc@gmail.com" style="color:var(--color-text-light); font-size:0.8125rem;">allenslandclearingllc@gmail.com</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="container footer-bottom-strip">
      <div>
        © 2026 Allen's Land Clearing, LLC. All rights reserved. Adel, Georgia.
      </div>
      <div>
        Commercial Civil Contracting • Land Clearing • South Georgia
      </div>
    </div>
  </footer>

  <!-- Floating Mobile Quick Action -->
  <a href="tel:2298961229" class="floating-mobile-action">
    <svg viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1.01A11.36 11.36 0 018.57 3.9c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.52c0-.55-.45-1-.99-1z"/></svg>
    Call (229) 896-1229
  </a>

  <!-- Script -->
  <script src="script.js"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(targetDir, 'index.html'), htmlContent, 'utf8');
console.log('Successfully updated index.html and styles.css for clean desktop navbar alignment');

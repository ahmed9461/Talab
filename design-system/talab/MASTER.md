# Talab — Master Design System

Source of truth for Talab UI. Built from the UI/UX Pro Max priority model: accessibility → touch/interaction → performance → coherent style → responsive layout → typography/color → motion → forms/feedback → navigation.

## Product direction
Customer service portal. Arabic RTL first. Mobile-first. Visual character: trustworthy, calm, premium SaaS; clean surfaces, deep navy brand field, restrained blue accents, subtle depth. Avoid decorative clutter, neon gradients, excessive glassmorphism, emoji icons, tiny body text, and color-only status communication.

## Tokens
- Brand 900: `#10234A`
- Brand 800: `#163B8C`
- Brand 600: `#245BDB`
- Brand 100: `#EAF0FF`
- Background: `#F5F7FB`
- Surface: `#FFFFFF`
- Text: `#14213D`
- Muted: `#697386`
- Border: `#DFE5EF`
- Success: `#067647`
- Warning: `#B54708`
- Danger: `#B42318`

## Typography
Noto Sans Arabic via `next/font`. Body 16px/1.65. Labels 14px+; no essential text below 12px. Headings use 700–800 weight with controlled line-height.

## Geometry
Main card radius 24–28px; controls 14–16px; badges 999px. Minimum interactive target 44×44px. Forms use 52–56px controls and 8px+ separation.

## Layout
Registration: desktop split story/workspace, mobile single-column form. Dashboard max width 1180px, three metric cards then 2-column content. Collapse to one column below 900px. Never introduce horizontal scrolling.

## Accessibility
Visible `:focus-visible` ring; contrast target ≥4.5:1 for normal text; semantic labels; status badges include icon + text; icon buttons include aria-label; reduced-motion respected. Error feedback is adjacent to the form and announced with `role=alert`.

## Motion
120–220ms for hover/focus feedback; only opacity/transform. No infinite decorative animation. Respect `prefers-reduced-motion`.

## Page overrides
Use `pages/<page>.md` only when a page needs a documented exception. Otherwise this file controls all Talab UI.

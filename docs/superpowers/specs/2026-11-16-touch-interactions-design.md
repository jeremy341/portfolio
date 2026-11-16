# Touch interactions

The user approved adding touch previews, heading feedback and row press feedback.

## Approach

Reuse existing preview content and heading/cursor ownership. Add a separate preview button to supported links in reading content and open a native modal dialog styled as a bottom sheet. This keeps normal link navigation and text selection available. Long press conflicts with browser selection, and intercepting the first link tap makes navigation surprising, so neither is used.

Touch taps briefly ripple heading weights and retain the existing title cursor behavior. Row presses highlight immediately and clear on scrolling, cancellation or release. Desktop hover effects remain available.

## Constraints

Use existing Astro, TypeScript, CSS and palette; no dependencies. Localize controls in English and German. Use native dialog focus containment, focus return, Escape, a visible close button and backdrop dismissal. Respect reduced motion and normal scrolling. Verify phone, tablet, mouse and keyboard inputs. Do not publish or commit without a new request.

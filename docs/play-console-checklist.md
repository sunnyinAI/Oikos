# Play Console Submission Checklist

Use this checklist when releasing Kharcha on Google Play.

## App setup

- [ ] App title finalized
- [ ] Default language and translations reviewed
- [ ] Package name verified as `com.kharcha.app`
- [ ] App category selected
- [ ] Contact email set to `support@kharcha.app` (or your real support email)

## Store listing assets

- [ ] App icon (512x512 PNG)
- [ ] Feature graphic (1024x500 PNG)
- [ ] Phone screenshots (minimum 2, recommended 6+)
- [ ] Optional promo video URL
- [ ] Short description and full description added

## Policy and legal

- [ ] Privacy policy published at `/privacy-policy.html`
- [ ] Account deletion page published at `/account-deletion.html`
- [ ] Data Safety form completed accurately
- [ ] Ads declaration completed (usually "No" if no ads SDK)
- [ ] Content rating questionnaire completed
- [ ] Target audience and news app declarations reviewed

## App content and quality

- [ ] Login/OTP flow tested
- [ ] Finance add/delete tested (coin sounds verified)
- [ ] Assistant chat tested with `GEMINI_API_KEY`
- [ ] Meal generation tested
- [ ] Grocery/pantry core flows tested
- [ ] Offline behavior tested
- [ ] Back navigation and deep links tested

## Release build

- [ ] Release keystore created and backed up securely
- [ ] Signed AAB generated from Android Studio
- [ ] Version code incremented
- [ ] Version name updated
- [ ] Internal testing track upload done
- [ ] Testers validated app install/update path

## Pre-production environment checks

- [ ] Backend uses persistent database
- [ ] Production HTTPS domain active
- [ ] CORS origins restricted correctly
- [ ] API health endpoint returns success
- [ ] Gemini API key configured on server

## Launch

- [ ] Release notes written
- [ ] Rollout strategy selected (staged recommended)
- [ ] Monitoring plan prepared for first 48 hours

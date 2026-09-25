# Campaign links

App Store links tagged with a campaign name. Downloads that come through each one show up separately in App Store Connect, under Analytics > Acquisition > Campaigns, so you can see which channels send people who install.

## How App Store Connect handles them

- The "Generate a campaign link" form only builds a URL. It doesn't save or register anything, so nothing appears in the Campaigns list straight after you click Done.
- A campaign appears in the list once people have downloaded through it. Apple holds back rows with very few downloads for privacy, so small campaigns may take a while to show, or not show at all.
- Any `ct` value works in a link. You don't need to generate each one in App Store Connect; editing the `ct=` part of the URL is enough.
- Apple only credits a download to a campaign if it happens within 24 hours of someone tapping the link, and some users' privacy settings keep them out of the counts. Treat the numbers as a sample rather than a full count.

Provider token: `129380591`. It's the same for every link.

## Links

Campaign names can be up to 40 characters.

| Where it's used | Link |
|---|---|
| Landing page button (already in `docs/index.html`) | https://apps.apple.com/app/apple-store/id6806774681?pt=129380591&ct=website&mt=8 |
| QR code at the end of the promo video | https://apps.apple.com/app/apple-store/id6806774681?pt=129380591&ct=promo-qr&mt=8 |
| TikTok profile link | https://apps.apple.com/app/apple-store/id6806774681?pt=129380591&ct=tiktok-bio&mt=8 |
| Instagram profile link | https://apps.apple.com/app/apple-store/id6806774681?pt=129380591&ct=instagram-bio&mt=8 |
| YouTube channel and video descriptions | https://apps.apple.com/app/apple-store/id6806774681?pt=129380591&ct=youtube&mt=8 |
| Reddit posts (change the subreddit) | https://apps.apple.com/app/apple-store/id6806774681?pt=129380591&ct=reddit-iosapps&mt=8 |
| Email signature | https://apps.apple.com/app/apple-store/id6806774681?pt=129380591&ct=email-signature&mt=8 |
| Anything handed out in person (flyers, cards) | https://apps.apple.com/app/apple-store/id6806774681?pt=129380591&ct=print&mt=8 |

When one post or video matters enough to measure on its own, give it its own name, e.g. `ct=tiktok-box-breathing-1`.

## Notes

- The QR code in the promo (`apple.co/4haLK5y`) has no campaign name, so those downloads show as web referrals with no source. If you regenerate it, point it at the `promo-qr` link above.
- Social apps often open links in their own in-app browser. The campaign still counts, as long as the person then opens the App Store and downloads within 24 hours.

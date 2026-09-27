---
title: "Multi-brand headless storefront for a global FMCG company"
updatedDate: 2026-09-26
---

When the French storefront moved to the new platform at 100% of traffic, it shipped with 247 redirect rules mapping old URLs to new ones. I wrote them. That change is a fair summary of my part of the project: most of the risk sat in the platform around the pages, not in the pages themselves.

The storefront serves two premium coffee brands across many European locales from one codebase: Next.js and GraphCommerce in front of Magento 2, with content from Hygraph, stitched together by GraphQL Mesh. The team was around eight engineers over two years. I was co-architect and split my time between architecture and hands-on work, most of it on the platform.

## Leaving Vercel

The first version deployed to Vercel. The client's infrastructure was on Azure, so I moved the storefront to containers: a production Dockerfile, GitHub Actions that build and push images, and deployment to Azure App Service. Later I added deployments into specific App Service slots, so a new release could be verified in a slot and swapped in without downtime.

Moving into containers surfaced things Vercel had been handling silently. The custom redirect rules and the middleware had to be copied into the runtime image explicitly, security headers such as `X-Content-Type-Options: nosniff` had to be set by the app, and production source maps had to be turned off by hand.

## A cache shared by every instance

With more than one container running, each instance kept its own copy of statically regenerated pages, so two requests could get two different versions of the same page. I replaced the default Next.js cache with a Redis-backed cache handler, with an in-memory LRU handler as the fallback, and added response caching in GraphQL Mesh so repeated catalog queries are served from cache.

## Rolling out locales

Locales moved to the new platform in stages. For each cutover, old URLs had to land on the right new page, and nothing that previously worked could return a 404. The French release needed 247 redirect rules. Subdomains were handled by a small middleware that redirects by host. Later I extended the redirect filter to every page type, not only content pages, and added explicit handling for 302 and 308 responses.

Once most locales were live, I wrote a crawler that walks every locale path for both brands with bounded concurrency and retries, and screenshots each page for review. It catches broken pages that unit tests never see.

## Observability and releases

I added New Relic instrumentation to GraphQL Mesh, so slow upstream calls to Magento or the CMS show up per operation, and later moved log forwarding to a new New Relic account. A GitHub Action creates the Jira release for each deployment.

## Multi-brand by design tokens

The second brand is where the architecture paid off. Brand differences live in design tokens and a brand folder, not in forked components. Onboarding the second brand took 2 months, against 9 for the first.

## What I would do differently

I would build the crawler before the first locale cutover, not after most of them. It became the most useful release check we had, and every locale that moved without it carried more risk than it needed to.

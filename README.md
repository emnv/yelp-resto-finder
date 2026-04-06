# Restaurant Finder

A Next.js App Router app for finding restaurants by city with the Yelp Fusion API. The browser sends the search term to a secure internal API route, and the server calls Yelp using `process.env.YELP_API_KEY` so the API key never reaches the client.

## Features

- Search restaurants by city name
- Quick-search city buttons for common searches
- Secure server-side Yelp API integration through `/api/yelp`
- Results sorted by rating within the searched location and 5-mile radius
- 10 restaurants per page with numbered pagination
- Featured restaurant images when Yelp provides them
- Restaurant cards showing name, rating, address, and coordinates
- Skeleton loading state and inline error handling
- Compact full-width search bar after the first search

## Tech Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- Framer Motion
- Yelp Fusion API

## Prerequisites

Before running the app, make sure you have:

- Node.js installed
- npm installed
- A Yelp Fusion API key

You can create a Yelp API key from the Yelp for Developers portal.

## Environment Setup

Create or update a local environment file named `.env.local` in the project root:

```env
YELP_API_KEY=your_yelp_api_key_here
```

Important:

- Do not expose the API key to the client.
- Do not rename it to `NEXT_PUBLIC_YELP_API_KEY`.
- Restart the dev server after changing `.env.local`.

## Install Dependencies

```bash
npm install
```

## Run the App Locally

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## How to Use

1. Open the app in your browser.
2. Enter a city name or click one of the quick-search city buttons.
3. Submit the search.
4. The app sends a request to the internal API route.
5. The server fetches restaurant results from Yelp.
6. The UI shows restaurants sorted by rating.
7. Use the numbered pagination controls to browse more results 10 at a time.

Each restaurant card displays:

- Featured image when available
- Name
- Rating
- Address
- Latitude and longitude

## Available Scripts

Run the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Start the production server after building:

```bash
npm run start
```

Run ESLint:

```bash
npm run lint
```

## Project Structure

```text
app/
	api/
		yelp/
			route.js      # Secure server-side Yelp API proxy with pagination metadata
	globals.css       # Global styles and skeleton shimmer effect
	layout.js         # Root layout and metadata
	page.js           # Main search UI, results view, and pagination controls
next.config.mjs     # Remote image configuration for Yelp CDN images
.env.local          # Local Yelp API key
```

## API Flow

1. The browser submits the city name from the search form.
2. The frontend calls the internal route using a request like:

```text
/api/yelp?location=<city>&page=<page>&limit=10
```

3. The route reads `process.env.YELP_API_KEY` on the server.
4. The server requests Yelp business search data using:
	 - `location`
	 - `radius=8046`
	 - `categories=restaurants`
	 - `sort_by=rating`
	 - `limit=10`
	 - `offset=(page - 1) * limit`
5. The route returns cleaned restaurant data plus pagination metadata.

Restaurant fields returned to the client:

- `id`
- `name`
- `imageUrl`
- `rating`
- `address`
- `coordinates`

Pagination fields returned to the client:

- `page`
- `pageSize`
- `totalResults`
- `totalPages`
- `hasPreviousPage`
- `hasNextPage`

## Pagination Notes

- The UI shows 10 items per page.
- This app caps paging to the first 240 results because Yelp search offsets are limited to that range.

## Image Handling

- Restaurant images are loaded with `next/image`.
- Remote Yelp CDN images are allowed through `next.config.mjs`.
- If Yelp does not provide an image, the UI shows a fallback placeholder.

## Troubleshooting

### Missing API key

If you see an error about the Yelp API key not being configured:

- Confirm `.env.local` exists in the project root.
- Confirm the variable name is exactly `YELP_API_KEY`.
- Restart the dev server after editing `.env.local`.

### Yelp request fails

If the Yelp request fails:

- Verify the API key is valid and active.
- Check whether the Yelp API quota has been exceeded.
- Confirm your internet connection is working.

### No restaurants returned

If no restaurants appear for a search:

- Try a larger or more specific city name.
- Check whether Yelp has restaurant listings for that location.
- Verify the search input is not empty.

### Pagination stops early

If you cannot page beyond a certain point:

- This app intentionally limits pagination to the first 240 Yelp results.
- Try a more specific city or search term to narrow the result set.

## Notes

- The Yelp API key is only used on the server.
- No database is required for this project.
- State is managed locally in the page component.
- The UI uses Framer Motion for section transitions and loading states.

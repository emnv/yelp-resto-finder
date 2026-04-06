"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const PAGE_SIZE = 10;
const skeletonCards = [0, 1, 2];
const suggestedCities = [
  { name: "New York", className: "bg-amber-50 ring-amber-200 text-amber-700" },
  { name: "Chicago", className: "bg-cyan-50 ring-cyan-200 text-cyan-700" },
  { name: "Seattle", className: "bg-emerald-50 ring-emerald-200 text-emerald-700" },
];
const revealTransition = {
  duration: 0.4,
  ease: [0.22, 1, 0.36, 1],
};

function buildPaginationItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items = [1];
  const startPage = Math.max(2, currentPage - 1);
  const endPage = Math.min(totalPages - 1, currentPage + 1);

  if (startPage > 2) {
    items.push("left-ellipsis");
  }

  for (let page = startPage; page <= endPage; page += 1) {
    items.push(page);
  }

  if (endPage < totalPages - 1) {
    items.push("right-ellipsis");
  }

  items.push(totalPages);

  return items;
}

function StarIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.364 1.118l1.286 3.96c.3.922-.755 1.688-1.539 1.118l-3.366-2.446a1 1 0 00-1.176 0l-3.366 2.446c-.784.57-1.838-.196-1.539-1.118l1.286-3.96a1 1 0 00-.364-1.118L2.063 9.387c-.783-.57-.38-1.81.588-1.81H6.813a1 1 0 00.95-.69l1.286-3.96z" />
    </svg>
  );
}

function RestaurantSkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[30px] border border-white/70 bg-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="grid lg:grid-cols-[320px_1fr]">
        <div className="skeleton-shimmer min-h-72 bg-stone-200/80" />
        <div className="space-y-5 p-6 sm:p-7">
          <div className="skeleton-shimmer h-4 w-24 rounded-full bg-stone-200/70" />
          <div className="skeleton-shimmer h-8 w-2/3 rounded-full bg-stone-200/80" />
          <div className="skeleton-shimmer h-4 w-full rounded-full bg-stone-200/70" />
          <div className="skeleton-shimmer h-4 w-3/4 rounded-full bg-stone-200/70" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
              <div className="skeleton-shimmer h-3 w-20 rounded-full bg-stone-200/70" />
              <div className="skeleton-shimmer h-4 w-full rounded-full bg-stone-200/70" />
              <div className="skeleton-shimmer h-4 w-4/5 rounded-full bg-stone-200/70" />
            </div>
            <div className="space-y-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
              <div className="skeleton-shimmer h-3 w-24 rounded-full bg-stone-200/70" />
              <div className="skeleton-shimmer h-4 w-2/3 rounded-full bg-stone-200/70" />
              <div className="skeleton-shimmer h-4 w-1/2 rounded-full bg-stone-200/70" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [city, setCity] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [lastSearch, setLastSearch] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: PAGE_SIZE,
    totalResults: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  async function runSearch(searchTerm, page = 1) {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    setCity(trimmed);
    setLoading(true);
    setError(null);
    setRestaurants([]);
    setSearched(true);
    setLastSearch(trimmed);

    try {
      const res = await fetch(
        `/api/yelp?location=${encodeURIComponent(trimmed)}&page=${page}&limit=${PAGE_SIZE}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setRestaurants(data.restaurants);
      setPagination(
        data.pagination || {
          page,
          pageSize: PAGE_SIZE,
          totalResults: data.restaurants?.length || 0,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        }
      );
    } catch {
      setError("Failed to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    await runSearch(city);
  }

  async function handleSuggestionClick(suggestedCity) {
    if (loading) return;
    await runSearch(suggestedCity);
  }

  async function handlePageChange(nextPage) {
    if (loading || nextPage === pagination.page) return;

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    await runSearch(lastSearch || city, nextPage);
  }

  const canSearch = city.trim().length > 0 && !loading;
  const isCompactSearch = searched;
  const currentStart = pagination.totalResults === 0
    ? 0
    : (pagination.page - 1) * pagination.pageSize + 1;
  const currentEnd = Math.min(
    pagination.page * pagination.pageSize,
    pagination.totalResults
  );
  const paginationItems = buildPaginationItems(
    pagination.page,
    pagination.totalPages
  );

  function renderSearchForm({ compact = false } = {}) {
    return (
      <form
        onSubmit={handleSearch}
        className={
          compact
            ? "flex w-full flex-col gap-3 rounded-[28px] border border-white/80 bg-white/88 p-3 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur sm:flex-row"
            : "mt-8 flex flex-col gap-3 rounded-[28px] border border-white/80 bg-white/85 p-3 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur sm:flex-row"
        }
      >
        <label htmlFor="city" className="sr-only">
          City
        </label>
        <input
          id="city"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Search a city like Austin, Seattle, or Miami"
          className="min-h-14 flex-1 rounded-2xl border border-slate-200 bg-white px-5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
        />
        <motion.button
          type="submit"
          disabled={!canSearch}
          className="min-h-14 w-44 shrink-0 cursor-pointer rounded-2xl bg-slate-950 px-6 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.24)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? "Searching..." : "Search"}
        </motion.button>
      </form>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden font-sans text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-5rem] top-[-4rem] h-72 w-72 rounded-full bg-amber-200/60 blur-3xl" />
        <div className="absolute right-[-4rem] top-20 h-80 w-80 rounded-full bg-cyan-200/45 blur-3xl" />
        <div className="absolute inset-x-0 top-72 h-72 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.10),transparent_60%)]" />
      </div>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6 lg:py-12">
        <AnimatePresence mode="wait" initial={false}>
          {isCompactSearch ? (
            <motion.section
              key="compact-search"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={revealTransition}
              className="w-full"
            >
              {renderSearchForm({ compact: true })}
            </motion.section>
          ) : (
            <motion.section
              key="expanded-search"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={revealTransition}
              className="overflow-hidden rounded-[32px] border border-white/70 bg-white/75 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur xl:p-8"
            >
              <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                    Find standout restaurants in any city with a cleaner, faster search.
                  </h1>

                  <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                    Search by city, then browse a polished single-column feed with featured imagery, ratings, addresses, and coordinates from Yelp.
                  </p>

                  {renderSearchForm()}
                </div>

                <motion.div
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...revealTransition, delay: 0.08 }}
                  className="rounded-[30px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.85),rgba(255,247,237,0.95))] p-6 shadow-inner"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Search snapshot
                  </p>
                  <div className="mt-5 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                    <div className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-slate-200/60">
                      <p className="text-3xl font-semibold text-slate-950">10</p>
                      <p className="mt-2 text-sm text-slate-600">
                        Restaurants per page
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-slate-200/60">
                      <p className="text-3xl font-semibold text-slate-950">5 miles</p>
                      <p className="mt-2 text-sm text-slate-600">
                        Search radius around the selected city
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-slate-200/60">
                      <p className="text-3xl font-semibold text-slate-950">1</p>
                      <p className="mt-2 text-sm text-slate-600">
                        Single-column feed for easier scanning
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <section className="mt-8">
          <AnimatePresence mode="wait" initial={false}>
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={revealTransition}
                className="space-y-5"
              >
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Loading results
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                      Searching restaurants in {lastSearch}
                    </h2>
                  </div>
                </div>
                {skeletonCards.map((index) => (
                  <RestaurantSkeletonCard key={index} />
                ))}
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={revealTransition}
                className="rounded-[28px] border border-rose-200 bg-rose-50/90 p-8 shadow-[0_18px_50px_rgba(190,24,93,0.10)]"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rose-600">
                  Search error
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-rose-950">
                  Yelp could not return restaurants for this search.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-rose-800">
                  {error}
                </p>
              </motion.div>
            ) : !searched ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={revealTransition}
                className="rounded-[28px] border border-white/70 bg-white/80 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Ready to search
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                  Enter a city to load a curated list of restaurants.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  The search uses Yelp restaurant listings within a 5-mile radius, sorts them by rating, and returns 10 results per page with address, coordinates, and featured imagery when Yelp provides it.
                </p>
                <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-500">
                  {suggestedCities.map((suggestion) => (
                    <motion.button
                      key={suggestion.name}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion.name)}
                      disabled={loading}
                      className={`cursor-pointer rounded-full px-4 py-2 ring-1 transition hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60 ${suggestion.className}`}
                    >
                      {suggestion.name}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : restaurants.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={revealTransition}
                className="rounded-[28px] border border-white/70 bg-white/80 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  No results
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                  No restaurants were found for {lastSearch}.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  Try another city name or a larger metro area to widen the available restaurant listings.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={revealTransition}
              >
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Search results
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                      Restaurant{pagination.totalResults === 1 ? "" : "s"} in {lastSearch}
                    </h2>
                  </div>
                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    {pagination.totalPages > 1 && (
                      <p className="text-sm text-slate-500">
                        Page {pagination.page} of {pagination.totalPages}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {restaurants.map((restaurant, index) => (
                    <article
                      key={restaurant.id}
                      className="group overflow-hidden rounded-[30px] border border-white/70 bg-white/85 shadow-[0_22px_60px_rgba(15,23,42,0.10)] backdrop-blur"
                    >
                      <div className="grid lg:grid-cols-[320px_1fr]">
                        <div className="relative min-h-72 overflow-hidden bg-slate-100">
                          {restaurant.imageUrl ? (
                            <>
                              <Image
                                src={restaurant.imageUrl}
                                alt={restaurant.name}
                                fill
                                unoptimized
                                sizes="(max-width: 1024px) 100vw, 320px"
                                className="object-cover transition duration-700 group-hover:scale-105"
                              />
                            </>
                          ) : (
                            <div className="flex h-full flex-col items-center justify-center bg-[linear-gradient(135deg,#f8fafc,#fef3c7)] px-6 text-center">
                              <p className="text-sm font-medium text-slate-600">
                                No featured photo available
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="p-6 sm:p-7">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                                {restaurant.name}
                              </h3>
                            </div>

                            <div className="inline-flex items-center gap-2 self-start rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 ring-1 ring-amber-200">
                              <StarIcon className="h-4 w-4 text-amber-500" />
                              <span>
                                {typeof restaurant.rating === "number"
                                  ? restaurant.rating.toFixed(1)
                                  : "N/A"}
                                /5
                              </span>
                            </div>
                          </div>

                          <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                                Address
                              </p>
                              <p className="mt-3 text-sm leading-7 text-slate-700">
                                {restaurant.address}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                                Coordinates
                              </p>
                              <p className="mt-3 text-sm leading-7 text-slate-700">
                                {restaurant.coordinates.latitude != null
                                  ? `Lat: ${restaurant.coordinates.latitude.toFixed(5)}`
                                  : "Lat: N/A"}
                              </p>
                              <p className="text-sm leading-7 text-slate-700">
                                {restaurant.coordinates.longitude != null
                                  ? `Lng: ${restaurant.coordinates.longitude.toFixed(5)}`
                                  : "Lng: N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPreviousPage || loading}
                        className="cursor-pointer rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Previous
                      </button>
                      {paginationItems.map((item) =>
                        typeof item === "number" ? (
                          <button
                            key={item}
                            type="button"
                            onClick={() => handlePageChange(item)}
                            disabled={loading || item === pagination.page}
                            aria-current={item === pagination.page ? "page" : undefined}
                            className={
                              item === pagination.page
                                ? "cursor-default rounded-full border border-slate-950 bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm"
                                : "cursor-pointer rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            }
                          >
                            {item}
                          </button>
                        ) : (
                          <span
                            key={item}
                            aria-hidden="true"
                            className="px-1 text-sm font-medium text-slate-400"
                          >
                            ...
                          </span>
                        )
                      )}
                      <button
                        type="button"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNextPage || loading}
                        className="cursor-pointer rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}


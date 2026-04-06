import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location");
  const rawPage = Number.parseInt(searchParams.get("page") || "1", 10);
  const rawLimit = Number.parseInt(searchParams.get("limit") || "10", 10);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(rawLimit, 1), 50)
    : 10;
  const offset = (page - 1) * limit;

  if (!location || location.trim().length === 0) {
    return NextResponse.json(
      { error: "A location query parameter is required." },
      { status: 400 }
    );
  }

  if (offset >= 240) {
    return NextResponse.json(
      { error: "Pagination is limited to the first 240 Yelp results." },
      { status: 400 }
    );
  }

  const apiKey = process.env.YELP_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Yelp API key is not configured on the server." },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    location: location.trim(),
    radius: "8046",
    categories: "restaurants",
    sort_by: "rating",
    limit: String(limit),
    offset: String(offset),
  });

  try {
    const response = await fetch(
      `https://api.yelp.com/v3/businesses/search?${params}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const message =
        errorBody?.error?.description ||
        "Failed to fetch restaurants from Yelp.";
      return NextResponse.json(
        { error: message },
        { status: response.status }
      );
    }

    const data = await response.json();

    const restaurants = (data.businesses || [])
      .map((biz) => ({
        id: biz.id,
        name: biz.name,
        imageUrl: biz.image_url || null,
        rating: biz.rating,
        address: biz.location?.display_address?.join(", ") || "N/A",
        coordinates: {
          latitude: biz.coordinates?.latitude ?? null,
          longitude: biz.coordinates?.longitude ?? null,
        },
      }))
      .sort((left, right) => (right.rating ?? 0) - (left.rating ?? 0));

    const totalResults = Math.min(data.total || restaurants.length, 240);
    const totalPages = Math.max(1, Math.ceil(totalResults / limit));

    return NextResponse.json({
      restaurants,
      pagination: {
        page,
        pageSize: limit,
        totalResults,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "An unexpected error occurred while contacting Yelp." },
      { status: 500 }
    );
  }
}

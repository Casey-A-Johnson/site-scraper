interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
}

export async function searchBusinesses(
  city: string,
  niche: string,
  maxResults: number = 20
): Promise<PlaceResult[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY!;
  const query = `${niche} in ${city}`;
  const results: PlaceResult[] = [];
  let nextPageToken: string | undefined;

  while (results.length < maxResults) {
    const url = new URL(
      "https://maps.googleapis.com/maps/api/place/textsearch/json"
    );
    url.searchParams.set("query", query);
    url.searchParams.set("key", apiKey);
    if (nextPageToken) {
      url.searchParams.set("pagetoken", nextPageToken);
    }

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(`Google Places API error: ${data.status}`);
    }

    for (const place of data.results || []) {
      if (results.length >= maxResults) break;

      // Get place details for phone and website
      const details = await getPlaceDetails(place.place_id, apiKey);

      results.push({
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address || "",
        phone: details.phone,
        website: details.website,
        rating: place.rating,
        reviewCount: place.user_ratings_total,
      });
    }

    nextPageToken = data.next_page_token;
    if (!nextPageToken) break;

    // Google requires a short delay before using next_page_token
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  return results;
}

async function getPlaceDetails(
  placeId: string,
  apiKey: string
): Promise<{ phone?: string; website?: string }> {
  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/details/json"
  );
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "formatted_phone_number,website");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  const data = await response.json();

  return {
    phone: data.result?.formatted_phone_number,
    website: data.result?.website,
  };
}

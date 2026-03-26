export async function fetchStateCities(stateName) {
  try {
    // Fetch cities
    const cityRes = await fetch(
      `https://nominatim.openstreetmap.org/search?state=${encodeURIComponent(
        stateName,
      )}&country=India&format=json&addressdetails=1&limit=50&featuretype=city`,
      { headers: { "User-Agent": "StartupSeekerApp/1.0" } }
    );
    const cities = await cityRes.json();

    // Respect Nominatim's rate limit (max 1 request per second) to prevent "limit exceeded" blocking
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Fetch towns
    const townRes = await fetch(
      `https://nominatim.openstreetmap.org/search?state=${encodeURIComponent(
        stateName,
      )}&country=India&format=json&addressdetails=1&limit=50&featuretype=town`,
      { headers: { "User-Agent": "StartupSeekerApp/1.0" } }
    );
    const towns = await townRes.json();

    const combined = [...cities, ...towns];

    // Deduplicate by name
    const unique = [];
    const names = new Set();
    for (const place of combined) {
      const name = place.name || (place.address && (place.address.city || place.address.town));
      if (name && !names.has(name.toLowerCase())) {
        names.add(name.toLowerCase());
        unique.push({
          name: name,
          lat: parseFloat(place.lat),
          lon: parseFloat(place.lon),
        });
      }
    }

    return unique.slice(0, 30); // limit to top 30 to not overload LLM
  } catch (error) {
    console.error("Failed to fetch state cities:", error);
    return [];
  }
}

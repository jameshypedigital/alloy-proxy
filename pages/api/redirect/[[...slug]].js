export default async function handler(req, res) {
  try {
    const { slug = [], location_id, ...utm } = req.query;

    const path = Array.isArray(slug)
      ? slug.map(s => s.toLowerCase().trim())
      : [String(slug).toLowerCase().trim()];

    let finalUrl;
    let page_type;
    let location_slug = null;
    let offer_slug = null;     // <-- this is your "offer"
    let blog_slug = null;

    // BLOG: /api/redirect/blog/<blog-slug>
    if (path[0] === "blog" && path[1]) {
      page_type = "blog";
      blog_slug = path.slice(1).join("/");   // supports deeper blog slugs if needed
      finalUrl = `https://alloypersonaltraining.com/${blog_slug}/`;
    }

    // LOCATION PAGE: /api/redirect/locations/<location-slug>
    else if (path[0] === "locations" && path[1]) {
      page_type = "location";
      location_slug = path[1];
      finalUrl = `https://alloypersonaltraining.com/location/${location_slug}/`;
    }

    // OFFER PAGE: /api/redirect/<location-slug>/<offer>
    else if (path.length >= 2) {
      page_type = "offer";
      location_slug = path[0];
      offer_slug = path[1];

      // ✅ Correct final URL format you want:
      finalUrl = `https://www.alloy-promo.com/${location_slug}/${offer_slug}`;
    }

    else {
      return res.status(400).json({ ok: false, error: "Invalid landing page structure" });
    }

    // ✅ Track in n8n (IMPORTANT: send offer_slug + location_id)
    await fetch("https://dashtraq.app.n8n.cloud/webhook/redirect-track", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    brand: "alloy",
    page_type,
    slug: slug_value,          // offer OR blog slug
    location_id,               // normalized from club
    location_slug,
    utm,
    timestamp: Date.now()
  })
});

    return res.redirect(302, finalUrl);

  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}



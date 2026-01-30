export default async function handler(req, res) {
  try {
    const { slug = [] } = req.query;
    const utm = { ...req.query };

    // Remove slug array from UTM payload
    delete utm.slug;

    // Normalize path
    const path = Array.isArray(slug)
      ? slug.map(s => s.toLowerCase().trim())
      : [slug.toLowerCase().trim()];

    let finalUrl = null;
    let location_slug = null;
    let landing_page = null;
    let page_type = null;

    /* ===============================
       BLOG POSTS
       /blog/<blog-slug>
    =============================== */
    if (path[0] === "blog" && path[1]) {
      page_type = "blog";
      finalUrl = `https://alloypersonaltraining.com/${path[1]}/`;
    }

    /* ===============================
       LOCATION PAGE
       /locations/<location_slug>
    =============================== */
    else if (path[0] === "locations" && path[1]) {
      page_type = "location";
      location_slug = path[1];
      finalUrl = `https://alloypersonaltraining.com/location/${location_slug}/`;
    }

    /* ===============================
       OFFER PAGE
       /<location_slug>/<offer>
    =============================== */
    else if (path.length >= 2) {
      page_type = "offer";
      location_slug = path[0];
      landing_page = path[1];

      finalUrl = `https://alloy-promo.com/${location_slug}?location=${landing_page}`;
    }

    /* ===============================
       INVALID ROUTE
    =============================== */
    else {
      return res.status(400).json({
        ok: false,
        error: "Invalid landing page structure"
      });
    }

    /* ===============================
       TRACK EVENT (n8n)
    =============================== */
    await fetch("https://dashtraq.app.n8n.cloud/webhook/redirect-track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brand: "alloy",
        page_type,
        location_slug,
        landing_page,
        utm,
        timestamp: Date.now()
      })
    });

    return res.redirect(302, finalUrl);

  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message
    });
  }
}

export default async function handler(req, res) {
  try {
    const { slug = [], location_slug, ...utm } = req.query;

    const path = Array.isArray(slug)
      ? slug.map(s => s.toLowerCase().trim())
      : [slug.toLowerCase().trim()];

    let finalUrl;
    let page_type;
    let landing_page = null;

    /* ===============================
       BLOG POSTS
       /api/redirect/blog/<blog-slug>
    =============================== */
    if (path[0] === "blog" && path[1]) {
      page_type = "blog";
      landing_page = path[1];
      finalUrl = `https://alloypersonaltraining.com/${landing_page}/`;
    }

    /* ===============================
       LOCATION PAGE
       /api/redirect/locations/<location-slug>
    =============================== */
    else if (path[0] === "locations" && path[1]) {
      page_type = "location";
      finalUrl = `https://alloypersonaltraining.com/location/${path[1]}/`;
    }

    /* ===============================
       OFFER PAGE
       /api/redirect/offer/<offer>
       location_slug comes from query params
    =============================== */
    else if (path[0] === "offer" && path[1] && location_slug) {
      page_type = "offer";
      landing_page = path[1];
      finalUrl = `https://www.alloy-promo.com/${location_slug}/${landing_page}`;
    }

    else {
      return res.status(400).json({
        ok: false,
        error: "Invalid redirect structure"
      });
    }

    /* ===============================
       TRACK EVENT
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
    return res.status(500).json({ ok: false, error: err.message });
  }
}


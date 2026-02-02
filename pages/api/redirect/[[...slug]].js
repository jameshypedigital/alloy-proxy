export default async function handler(req, res) {
  try {
    const { slug = [], club, ...utm } = req.query;

    const path = Array.isArray(slug)
      ? slug.map(s => s.toLowerCase().trim())
      : [slug.toLowerCase().trim()];

    let finalUrl;
    let page_type;
    let location_slug = null;
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
       /api/redirect/locations/<location_slug>
    =============================== */
    else if (path[0] === "locations" && path[1]) {
      page_type = "location";
      location_slug = path[1];

      finalUrl = `https://alloypersonaltraining.com/location/${location_slug}/`;
    }

    /* ===============================
       OFFER PAGE
       /api/redirect/<location_slug>/<offer>
    =============================== */
    else if (path.length >= 2) {
      page_type = "offer";
      location_slug = path[0];
      landing_page = path[1];

      finalUrl = `https://www.alloy-promo.com/${location_slug}/${landing_page}`;
    }

    /* ===============================
       INVALID ROUTE
    =============================== */
    else {
      return res.status(400).json({
        ok: false,
        error: "Invalid redirect structure"
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
        club,       // location identifier
        slug: slug_value, // offer OR blog slug
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


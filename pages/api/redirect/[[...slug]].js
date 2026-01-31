export default async function handler(req, res) {
  try {
    const slugParam = req.query.slug || [];
    const slugArr = Array.isArray(slugParam) ? slugParam : [slugParam];

    // Copy all query params but remove the catch-all slug key
    const utm = { ...req.query };
    delete utm.slug;

    // Normalize path pieces
    const path = slugArr.map(s => String(s || "").toLowerCase().trim()).filter(Boolean);

    // Also allow query-style fallback:
    // /api/redirect?location_slug=slp-st-louis-park-mn&landing_page=3for99
    const locationFromQuery =
      (req.query.location_slug || req.query.location || req.query.location_id || "").toString().trim();
    const offerFromQuery =
      (req.query.landing_page || req.query.offer || "").toString().trim();

    let finalUrl = null;
    let location_slug = null;
    let landing_page = null;
    let page_type = null;

    /* ===============================
       BLOG POSTS
       proxy: /blog/<blog-slug>
       target: https://alloypersonaltraining.com/<blog-slug>/
    =============================== */
    if (path[0] === "blog" && path[1]) {
      page_type = "blog";
      landing_page = path[1];
      finalUrl = `https://alloypersonaltraining.com/${landing_page}/`;
    }

    /* ===============================
       LOCATION PAGE
       proxy: /locations/<location_slug>
       target: https://alloypersonaltraining.com/location/<location_slug>/
    =============================== */
    else if (path[0] === "locations" && path[1]) {
      page_type = "location";
      location_slug = path[1];
      finalUrl = `https://alloypersonaltraining.com/location/${location_slug}/`;
    }

    /* ===============================
       OFFER PAGE (preferred)
       proxy: /<location_slug>/<offer>
       target: https://www.alloy-promo.com/<location_slug>/<offer>
    =============================== */
    else if (path.length >= 2) {
      page_type = "landing_page";
      location_slug = path[0];
      landing_page = path[1];
      finalUrl = `https://www.alloy-promo.com/${location_slug}/${landing_page}`;
    }

    /* ===============================
       OFFER PAGE (query fallback for FB dynamic params)
       proxy: /api/redirect?location_slug=...&landing_page=...
    =============================== */
    else if (locationFromQuery && offerFromQuery) {
      page_type = "landing_page";
      location_slug = locationFromQuery.toLowerCase();
      landing_page = offerFromQuery.toLowerCase();
      finalUrl = `https://www.alloy-promo.com/${location_slug}/${landing_page}`;
    }

    else {
      return res.status(400).json({ ok: false, error: "Invalid landing page structure" });
    }

    // Track event
    await fetch("https://dashtraq.app.n8n.cloud/webhook/redirect-track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brand: "alloy",
        page_type,
        location_slug,
        landing_page,       // <-- this is your offer
        utm,
        timestamp: Date.now()
      })
    });

    return res.redirect(302, finalUrl);

  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}

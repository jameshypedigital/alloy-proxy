export default async function handler(req, res) {
  try {
    const { slug = [] } = req.query;
    const utm = { ...req.query };
    delete utm.slug;

    const path = Array.isArray(slug)
      ? slug.map(s => s.toLowerCase().trim())
      : [slug.toLowerCase().trim()];

    let finalUrl = null;
    let location_slug = null;
    let offer = null;
    let page_type = null;

    /* ===============================
       BLOG POSTS
       /blog/<blog-slug>
       -> https://alloypersonaltraining.com/<blog-slug>/
    =============================== */
    if (path[0] === "blog" && path[1]) {
      page_type = "blog";
      offer = path[1];
      finalUrl = `https://alloypersonaltraining.com/${offer}/`;
    }

    /* ===============================
       LOCATION PAGE
       /locations/<location_slug>
       -> https://alloypersonaltraining.com/location/<location_slug>/
    =============================== */
    else if (path[0] === "locations" && path[1]) {
      page_type = "location";
      location_slug = path[1];
      finalUrl = `https://alloypersonaltraining.com/location/${location_slug}/`;
    }

    /* ===============================
       OFFER PAGE
       /<location_slug>/<offer>
       -> https://www.alloy-promo.com/<location_slug>/<offer>
    =============================== */
    else if (path.length >= 2) {
      page_type = "landing_page";
      location_slug = path[0];
      offer = path[1];

      finalUrl = `https://www.alloy-promo.com/${location_slug}/${offer}`;
    }

    else {
      return res.status(400).json({
        ok: false,
        error: "Invalid landing page structure"
      });
    }

    await fetch("https://dashtraq.app.n8n.cloud/webhook/redirect-track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brand: "alloy",
        page_type,
        location_slug,
        offer,
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


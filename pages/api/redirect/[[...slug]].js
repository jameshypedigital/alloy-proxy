export default async function handler(req, res) {
  try {
    // 1️⃣ Extract identifiers FIRST
    const {
      slug = [],
      location_id,
      club,
      ...rest
    } = req.query;

    // 2️⃣ Normalize club ID (canonical)
    const clubId = club || location_id;

    if (!clubId) {
      return res.status(400).json({
        ok: false,
        error: "Missing club/location_id"
      });
    }

    // 3️⃣ Remaining params are UTMs ONLY
    const utm = { ...rest };

    // Normalize path
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
      landing_page = path[1];
      finalUrl = `https://alloypersonaltraining.com/location/${landing_page}/`;
    }

    /* ===============================
       OFFER PAGE
       /api/redirect/<location-slug>/<offer>
    =============================== */
    else if (path.length >= 2) {
      page_type = "offer";
      landing_page = path[1];
      finalUrl = `https://www.alloy-promo.com/${path[0]}/${landing_page}`;
    }

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
        club: clubId,        // ✅ ALWAYS populated
        slug: landing_page,  // ✅ offer OR blog slug
        page_type,
        utm,                 // ✅ UTMs only
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


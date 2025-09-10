

/**
 * List collections for a site
 */
export const listCollections = async (req, res) => {
  try {
    const siteId = req.params.siteId;
    if (!siteId) {
      return res.status(400).json({ error: 'Missing siteId parameter' });
    }

    const data = await req.webflow.collections.list(siteId);
    // SDK may return data.collections or the array directly
    const collections = data?.collections ?? data ?? [];
    return res.json(collections);
  } catch (error) {
    const details = error?.response?.data || error?.message || 'Unknown error';
    return res.status(500).json({ error: 'Failed to fetch collections', details });
  }
};

/**
 * Get collection details by ID
 */
export const getCollection = async (req, res) => {
  try {
    const collectionId = req.params.collectionId;
    if (!collectionId) {
      return res.status(400).json({ error: 'Missing collectionId parameter' });
    }

    const data = await req.webflow.collections.get(collectionId);
    return res.json(data);
  } catch (error) {
    const details = error?.response?.data || error?.message || 'Unknown error';
    return res.status(500).json({ error: 'Failed to fetch collection', details });
  }
};

/**
 * Get collection fields (SDK first, then fallback to collection.get, then direct HTTP)
 * Returns an array of field objects.
 */
export const getCollectionFields = async (req, res) => {
  const collectionId = req.params.collectionId;
  if (!collectionId) {
    return res.status(400).json({ error: 'Missing collectionId parameter' });
  }

  // 1) Try SDK fields.list if available
  try {
    if (req.webflow?.collections?.fields?.list && typeof req.webflow.collections.fields.list === 'function') {
      const sdkResp = await req.webflow.collections.fields.list(collectionId);
      const fields = sdkResp?.fields ?? sdkResp ?? [];
      return res.json(Array.isArray(fields) ? fields : []);
    }
  } catch (sdkErr) {
    // swallow and continue to fallback
  }

  // 2) Fallback to collections.get and extract fields
  try {
    const collection = await req.webflow.collections.get(collectionId);
    const fields = collection?.fields ?? collection?.collectionFields ?? [];
    return res.json(Array.isArray(fields) ? fields : []);
  } catch (getErr) {
    // swallow and continue to HTTP fallback
  }

  // 3) Final fallback: direct Webflow HTTP API
  try {
    const token = process.env.WEBFLOW_ACCESS_TOKEN;
    if (!token) {
      return res.status(500).json({ error: 'WEBFLOW_ACCESS_TOKEN not configured on server' });
    }

    const url = `https://api.webflow.com/collections/${collectionId}/fields`;
    const httpResp = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept-Version': '1.0.0',
        'Content-Type': 'application/json',
      },
    });

    const httpData = await httpResp.json();
    if (!httpResp.ok) {
      const details = httpData || `HTTP ${httpResp.status}`;
      return res.status(502).json({ error: 'Webflow API error fetching fields', details });
    }

    const fields = httpData?.fields ?? [];
    return res.json(Array.isArray(fields) ? fields : []);
  } catch (httpErr) {
    const details = httpErr?.message || 'Unknown error';
    return res.status(500).json({ error: 'Failed to fetch collection fields', details });
  }
};

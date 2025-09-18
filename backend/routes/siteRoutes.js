import express from "express";

const router = express.Router();

// Get site info
export const getSite = async (req, res) => {
  try {
    console.log('Fetching site info for:', req.params.siteId);
    const data = await req.webflow.sites.get(req.params.siteId);
    res.json(data);
  } catch (error) {
    console.error("Error fetching site info:", error);
    res.status(500).json({ 
      error: "Failed to fetch site info", 
      details: error.message 
    });
  }
};

// Publish site
export const publishSite = async (req, res) => {
  try {
    console.log('Publishing site:', req.params.siteId);
    console.log('Domains:', req.body.domains);
    
    // Default to publishing to webflow.io subdomain if no domains specified
    const publishData = {
      domains: req.body.domains || [],
      publishToWebflowSubdomain: true
    };
    
    const data = await req.webflow.sites.publish(req.params.siteId, publishData);
    
    res.json({
      success: true,
      message: 'Site published successfully',
      data: data
    });
  } catch (error) {
    console.error("Error publishing site:", error);
    res.status(500).json({ 
      error: "Failed to publish site", 
      details: error.message 
    });
  }
};

// Route definitions
router.get("/:siteId", getSite);
router.post("/:siteId/publish", publishSite);

export default router;

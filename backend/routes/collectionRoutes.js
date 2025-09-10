import express from "express";
import {
  listCollections,
  getCollection,
  getCollectionFields,
} from "../controllers/collectionController.js";

const router = express.Router();

// Route to list all collections for a site
router.get("/site/:siteId", listCollections);

// Route to get collection details
router.get("/:collectionId", getCollection);

// Route to get collection fields
router.get("/:collectionId/fields", getCollectionFields);

export default router;

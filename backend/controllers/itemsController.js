// List collection items
export const listItems = async (req, res) => {
  try {
    console.log('Fetching items for collection:', req.params.collectionId);
    const data = await req.webflow.collections.items.listItems(
      req.params.collectionId
    );
    res.json(data.items || []);
  } catch (error) {
    console.error("Error fetching collection items:", error);
    res.status(500).json({ 
      error: "Failed to fetch collection items", 
      details: error.message 
    });
  }
};

// Create collection item
export const createItem = async (req, res) => {
  try {
    console.log('Creating item in collection:', req.params.collectionId);
    console.log('Item data:', req.body);
    
    const data = await req.webflow.collections.items.createItem(
      req.params.collectionId,
      req.body,
      { live: true } // Publish immediately
    );
    res.json(data);
  } catch (error) {
    console.error("Error creating collection item:", error);
    res.status(500).json({ 
      error: "Failed to create collection item", 
      details: error.message 
    });
  }
};

// Update collection item
export const updateItem = async (req, res) => {
  try {
    console.log('Updating item:', req.params.itemId, 'in collection:', req.params.collectionId);
    console.log('Update data:', req.body);
    
    const data = await req.webflow.collections.items.updateItem(
      req.params.collectionId,
      req.params.itemId,
      req.body,
      { live: true } // Publish immediately
    );
    res.json(data);
  } catch (error) {
    console.error("Error updating collection item:", error);
    res.status(500).json({ 
      error: "Failed to update collection item", 
      details: error.message 
    });
  }
};

// Delete collection item
export const deleteItem = async (req, res) => {
  try {
    console.log('Deleting item:', req.params.itemId, 'from collection:', req.params.collectionId);
    
    await req.webflow.collections.items.deleteItem(
      req.params.collectionId,
      req.params.itemId
    );
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ 
      error: "Failed to delete item", 
      details: error.message 
    });
  }
};
import { useState, useEffect } from 'react';
import ItemsList from '../components/ItemsList';
import ItemForm from '../components/ItemForm';
import UpdateItemForm from '../components/UpdateItemForm';
import { api } from '../lib/webflowApi';

export default function Home() {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [collectionsInfo, setCollectionsInfo] = useState({});
  const [publishing, setPublishing] = useState(false);
  
  const siteId = process.env.NEXT_PUBLIC_SITE_ID;

  useEffect(() => {
    checkConnection();
    if (siteId) {
      fetchCollections();
    } else {
      setError('NEXT_PUBLIC_SITE_ID not set in environment variables');
    }
  }, [siteId]);

  useEffect(() => {
    if (selectedCollection) {
      fetchCollectionFields();
    }
  }, [selectedCollection]);

  const checkConnection = async () => {
    try {
      await api.healthCheck();
      console.log('✅ Backend connection successful');
    } catch (err) {
      console.error('❌ Backend connection failed:', err.message);
      setError('Cannot connect to backend server. Make sure it\'s running on port 5000');
    }
  };

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching collections for site:', siteId);
      
      const response = await api.getCollections(siteId);
      const collectionsData = response.data || [];
      setCollections(collectionsData);
      
      console.log('Collections fetched:', collectionsData.length);
      
      // Fetch additional info for each collection
      await fetchCollectionsInfo(collectionsData);
      
    } catch (err) {
      setError(`Failed to fetch collections: ${err.response?.data?.details || err.message}`);
      console.error('Error fetching collections:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollectionsInfo = async (collectionsData) => {
    const info = {};
    
    // Fetch field counts and item counts for each collection
    const promises = collectionsData.map(async (collection) => {
      try {
        // Fetch fields count
        const fieldsResponse = await api.getCollectionFields(collection.id);
        const fieldsCount = fieldsResponse.data?.length || 0;
        
        // Fetch items count
        const itemsResponse = await api.getItems(collection.id);
        const itemsCount = itemsResponse.data?.length || 0;
        
        info[collection.id] = {
          fieldsCount,
          itemsCount,
          lastUpdated: new Date().toISOString()
        };
        
        console.log(`Collection ${collection.displayName}: ${fieldsCount} fields, ${itemsCount} items`);
        
      } catch (error) {
        console.error(`Error fetching info for collection ${collection.displayName}:`, error);
        info[collection.id] = {
          fieldsCount: 0,
          itemsCount: 0,
          error: true
        };
      }
    });
    
    await Promise.all(promises);
    setCollectionsInfo(info);
  };

  const fetchCollectionFields = async () => {
    try {
      console.log('Fetching fields for collection:', selectedCollection);
      const response = await api.getCollectionFields(selectedCollection);
      setFields(response.data || []);
      console.log('Fields fetched:', response.data?.length || 0);
    } catch (err) {
      console.error('Error fetching collection fields:', err);
      setFields([]);
    }
  };

  const handleItemCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    // Update the item count for the selected collection
    if (selectedCollection && collectionsInfo[selectedCollection]) {
      setCollectionsInfo(prev => ({
        ...prev,
        [selectedCollection]: {
          ...prev[selectedCollection],
          itemsCount: prev[selectedCollection].itemsCount + 1
        }
      }));
    }
  };

  const handleItemUpdated = () => {
    setSelectedItem(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleItemDeleted = () => {
    // Update the item count when an item is deleted
    if (selectedCollection && collectionsInfo[selectedCollection]) {
      setCollectionsInfo(prev => ({
        ...prev,
        [selectedCollection]: {
          ...prev[selectedCollection],
          itemsCount: Math.max(0, prev[selectedCollection].itemsCount - 1)
        }
      }));
    }
  };

  const getCollectionDisplayText = (collection) => {
    const info = collectionsInfo[collection.id];
    
    if (!info) {
      return `${collection.displayName} (Loading...)`;
    }
    
    if (info.error) {
      return `${collection.displayName} (Error loading data)`;
    }
    
    const fieldsText = info.fieldsCount === 1 ? 'field' : 'fields';
    const itemsText = info.itemsCount === 1 ? 'item' : 'items';
    
    return `${collection.displayName} (${info.itemsCount} ${itemsText}, ${info.fieldsCount} ${fieldsText})`;
  };

  const handlePublishSite = async () => {
    if (!confirm('Are you sure you want to publish the entire site? This will make all changes live.')) {
      return;
    }
    
    try {
      setPublishing(true);
      console.log('Publishing site:', siteId);
      
      const response = await api.publishSite(siteId);
      
      alert('Site published successfully! Changes are now live.');
      console.log('Site published:', response.data);
      
    } catch (error) {
      console.error('Error publishing site:', error);
      alert(`Failed to publish site: ${error.response?.data?.details || error.message}`);
    } finally {
      setPublishing(false);
    }
  };


  return (
    <div style={{ 
      maxWidth: '1400px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <header style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>
          🌐 Webflow CMS Manager
        </h1>
        <p style={{ color: '#666' }}>
          Manage your Webflow CMS collections and items with support for all field types
        </p>

        {/* Site Publish Button */}
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={handlePublishSite}
            disabled={publishing || loading}
            style={{
              padding: '12px 24px',
              backgroundColor: publishing ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: publishing ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'background-color 0.2s'
            }}
          >
            {publishing ? '🚀 Publishing Site...' : '🚀 Publish Entire Site'}
          </button>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            This will publish all changes to your live website
          </p>
        </div>
      </header>

      {error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '15px', 
          borderRadius: '5px', 
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Select Collection:
        </label>
        <select 
          value={selectedCollection} 
          onChange={(e) => {
            setSelectedCollection(e.target.value);
            setSelectedItem(null);
          }}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px',
            backgroundColor: loading ? '#f5f5f5' : 'white'
          }}
        >
          <option value="">
            {loading ? 'Loading collections...' : 'Choose a collection'}
          </option>
          {collections.map(collection => (
            <option key={collection.id} value={collection.id}>
              {getCollectionDisplayText(collection)}
            </option>
          ))}
        </select>
        
        {/* Display selected collection info */}
        {selectedCollection && collectionsInfo[selectedCollection] && (
          <div style={{ 
            marginTop: '10px', 
            padding: '10px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '4px',
            fontSize: '14px',
            color: '#495057'
          }}>
            <strong>Selected Collection Info:</strong>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>Collection ID: {selectedCollection}</li>
              <li>Fields: {collectionsInfo[selectedCollection].fieldsCount}</li>
              <li>Items: {collectionsInfo[selectedCollection].itemsCount}</li>
              <li>
                Last Updated: {new Date(collectionsInfo[selectedCollection].lastUpdated).toLocaleString()}
              </li>
            </ul>
          </div>
        )}
      </div>

      {selectedCollection && (
        <div style={{ display: 'grid', gap: '30px' }}>
          <ItemForm
            collectionId={selectedCollection}
            fields={fields}
            onItemCreated={handleItemCreated}
          />
          
          <ItemsList 
            collectionId={selectedCollection}
            onItemSelect={setSelectedItem}
            refreshTrigger={refreshTrigger}
            fields={fields}
            onItemDeleted={handleItemDeleted}
          />
        </div>
      )}

      {selectedItem && (
        <UpdateItemForm
          collectionId={selectedCollection}
          item={selectedItem}
          fields={fields}
          onUpdate={handleItemUpdated}
          onCancel={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

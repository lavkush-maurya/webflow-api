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
      setCollections(response.data || []);
      console.log('Collections fetched:', response.data?.length || 0);
    } catch (err) {
      console.error('Error fetching collection fields:', err);
      const details = err.response?.data?.details || err.response?.data?.error || err.message;
      setError(`Failed to fetch fields: ${details}`);
      setFields([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollectionFields = async () => {
    try {
      console.log('Fetching fields for collection:', selectedCollection);
      const response = await api.getCollectionFields(selectedCollection);
      setFields(response.data || []);
      console.log('Fields fetched:', response.data?.length || 0);
    } catch (err) {
      console.error('Error fetching collection fields:', err);
      setFields([]); // Reset fields on error
    }
  };

  const handleItemCreated = () => {
    setRefreshTrigger(prev => prev + 1); // Trigger refresh
  };

  const handleItemUpdated = () => {
    setSelectedItem(null);
    setRefreshTrigger(prev => prev + 1); // Trigger refresh
  };

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <header style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>
          🌐 Webflow CMS Manager
        </h1>
        <p style={{ color: '#666' }}>
          Manage your Webflow CMS collections and items
        </p>
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
            setSelectedItem(null); // Reset selected item
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
              {collection.displayName} ({collection.id})
            </option>
          ))}
        </select>
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

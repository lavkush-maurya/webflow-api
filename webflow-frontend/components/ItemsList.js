import { useState, useEffect } from 'react';
import { api } from '../lib/webflowApi';

export default function ItemsList({ collectionId, onItemSelect, refreshTrigger }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (collectionId) {
      fetchItems();
    }
  }, [collectionId, refreshTrigger]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching items for collection:', collectionId);
      
      const response = await api.getItems(collectionId);
      setItems(response.data || []);
      console.log('Items fetched:', response.data?.length || 0);
    } catch (err) {
      setError(`Failed to fetch items: ${err.response?.data?.details || err.message}`);
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await api.deleteItem(collectionId, itemId);
      setItems(items.filter(item => item.id !== itemId));
      alert('Item deleted successfully!');
    } catch (err) {
      alert(`Error deleting item: ${err.response?.data?.details || err.message}`);
      console.error('Error deleting item:', err);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading items...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Collection Items ({items.length})</h2>
      {items.length === 0 ? (
        <p style={{ color: '#666' }}>No items found in this collection.</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {items.map(item => (
            <div 
              key={item.id} 
              style={{ 
                border: '1px solid #ddd', 
                padding: '15px', 
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}
            >
              <h3>{item.fieldData?.name || item.fieldData?.title || 'Untitled'}</h3>
              <p><strong>ID:</strong> {item.id}</p>
              <p><strong>Status:</strong> {item.isDraft ? 'Draft' : 'Published'}</p>
              {item.isArchived && <p style={{ color: 'orange' }}><strong>Archived</strong></p>}
              
              <div style={{ marginTop: '10px', gap: '10px', display: 'flex' }}>
                <button 
                  onClick={() => onItemSelect && onItemSelect(item)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#0070f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

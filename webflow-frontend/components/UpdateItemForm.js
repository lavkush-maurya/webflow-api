import { useState, useEffect } from 'react';
import { api } from '../lib/webflowApi';

export default function UpdateItemForm({ collectionId, item, fields = [], onUpdate, onCancel }) {
  const [formData, setFormData] = useState({
    isArchived: false,
    isDraft: false,
    fieldData: {},
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        isArchived: item.isArchived || false,
        isDraft: item.isDraft || false,
        fieldData: { ...item.fieldData },
      });
    }
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      console.log('Updating item with data:', formData);
      
      await api.updateItem(collectionId, item.id, formData);
      
      alert('Item updated successfully!');
      if (onUpdate) onUpdate();
      
    } catch (error) {
      alert(`Error updating item: ${error.response?.data?.details || error.message}`);
      console.error('Error updating item:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFieldChange = (fieldSlug, value) => {
    setFormData(prev => ({
      ...prev,
      fieldData: {
        ...prev.fieldData,
        [fieldSlug]: value
      }
    }));
  };

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{ 
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h3>Update Item: {item?.fieldData?.name || 'Untitled'}</h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {fields.map((field) => (
            <div key={field.id}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                {field.displayName}:
              </label>
              <input
                type={field.type === 'Number' ? 'number' : 'text'}
                value={formData.fieldData[field.slug] || ''}
                onChange={(e) => handleFieldChange(field.slug, e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>
          ))}
          
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={formData.isDraft}
                onChange={(e) => setFormData(prev => ({ ...prev, isDraft: e.target.checked }))}
              />
              Save as Draft
            </label>
          </div>
          
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={formData.isArchived}
                onChange={(e) => setFormData(prev => ({ ...prev, isArchived: e.target.checked }))}
              />
              Archive Item
            </label>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button 
              type="submit" 
              disabled={submitting}
              style={{
                padding: '12px 24px',
                backgroundColor: submitting ? '#ccc' : '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                flex: 1
              }}
            >
              {submitting ? 'Updating...' : 'Update Item'}
            </button>
            
            <button 
              type="button"
              onClick={onCancel}
              disabled={submitting}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
                flex: 1
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

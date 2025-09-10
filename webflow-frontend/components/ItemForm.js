import { useState, useEffect } from 'react';
import { api } from '../lib/webflowApi';

export default function ItemForm({ collectionId, onItemCreated, fields = [] }) {
  const [formData, setFormData] = useState({
    isArchived: false,
    isDraft: false,
    fieldData: {},
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Initialize form data based on collection fields
    const fieldData = {};
    fields.forEach((field) => {
      fieldData[field.slug] = '';
    });
    setFormData(prev => ({
      ...prev,
      fieldData,
    }));
  }, [fields]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      console.log('Creating item with data:', formData);
      
      await api.createItem(collectionId, formData);
      
      // Reset form
      const resetFieldData = {};
      fields.forEach((field) => {
        resetFieldData[field.slug] = '';
      });
      setFormData({
        isArchived: false,
        isDraft: false,
        fieldData: resetFieldData,
      });
      
      alert('Item created successfully!');
      if (onItemCreated) onItemCreated();
      
    } catch (error) {
      alert(`Error creating item: ${error.response?.data?.details || error.message}`);
      console.error('Error creating item:', error);
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
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>Create New Item</h3>
      
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
              required={field.required}
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
        
        <button 
          type="submit" 
          disabled={submitting}
          style={{
            padding: '12px 24px',
            backgroundColor: submitting ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {submitting ? 'Creating...' : 'Create Item'}
        </button>
      </form>
    </div>
  );
}

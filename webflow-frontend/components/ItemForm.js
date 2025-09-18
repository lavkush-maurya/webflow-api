import { useState, useEffect, useMemo } from 'react';
import { api } from '../lib/webflowApi';
import dynamic from 'next/dynamic';

// Dynamic import for React Quill (SSR fix)
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>
});

export default function ItemForm({ collectionId, fields = [], onItemCreated }) {
  const [formData, setFormData] = useState({
    isArchived: false,
    isDraft: false,
    fieldData: {},
  });
  const [submitting, setSubmitting] = useState(false);

  // Rich text editor modules and formats
  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['link', 'image', 'video'],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['clean']
      ]
    },
    clipboard: {
      matchVisual: false,
    }
  }), []);

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent',
    'link', 'image', 'video', 'align', 'blockquote', 'code-block'
  ];

  useEffect(() => {
    // Initialize form data based on collection fields
    const fieldData = {};
    fields.forEach((field) => {
      // Set default values based on field type
      switch (field.type) {
        case 'Bool':
        case 'Switch':
          fieldData[field.slug] = false;
          break;
        case 'Number':
          fieldData[field.slug] = '';
          break;
        case 'DateTime':
          fieldData[field.slug] = '';
          break;
        case 'ImageRef':
        case 'Image':
          fieldData[field.slug] = '';
          break;
        case 'ImageRefSet':
        case 'MultiImage':
          fieldData[field.slug] = [];
          break;
        case 'ItemRef':
        case 'Reference':
          fieldData[field.slug] = '';
          break;
        case 'ItemRefSet':
        case 'MultiReference':
          fieldData[field.slug] = [];
          break;
        case 'Color':
          fieldData[field.slug] = '#000000';
          break;
        case 'RichText':
          fieldData[field.slug] = '';
          break;
        case 'VideoLink':
          fieldData[field.slug] = '';
          break;
        default:
          fieldData[field.slug] = '';
      }
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
      
      // Format the data properly before sending
      const formattedData = {
        ...formData,
        fieldData: await formatFieldData(formData.fieldData, fields)
      };
      
      console.log('Creating item with formatted data:', formattedData);
      
      await api.createItem(collectionId, formattedData);
      
      // Reset form
      const resetFieldData = {};
      fields.forEach((field) => {
        switch (field.type) {
          case 'Bool':
          case 'Switch':
            resetFieldData[field.slug] = false;
            break;
          case 'ImageRefSet':
          case 'MultiImage':
          case 'ItemRefSet':
          case 'MultiReference':
            resetFieldData[field.slug] = [];
            break;
          case 'Color':
            resetFieldData[field.slug] = '#000000';
            break;
          default:
            resetFieldData[field.slug] = '';
        }
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

  // Format field data based on field types
  const formatFieldData = async (fieldData, fields) => {
    const formatted = { ...fieldData };
    
    for (const field of fields) {
      const value = fieldData[field.slug];
      
      switch (field.type) {
        case 'DateTime':
          if (value) {
            formatted[field.slug] = new Date(value).toISOString();
          }
          break;
          
        case 'Number':
          if (value !== '') {
            formatted[field.slug] = Number(value);
          }
          break;
          
        case 'ImageRefSet':
        case 'MultiImage':
          if (Array.isArray(value) && value.length > 0) {
            formatted[field.slug] = value.filter(url => url.trim() !== '');
          } else {
            formatted[field.slug] = [];
          }
          break;
          
        case 'ItemRefSet':
        case 'MultiReference':
          if (Array.isArray(value) && value.length > 0) {
            formatted[field.slug] = value.filter(id => id.trim() !== '');
          } else {
            formatted[field.slug] = [];
          }
          break;
      }
    }
    
    return formatted;
  };

  const handleFieldChange = (fieldSlug, value, fieldType) => {
    setFormData(prev => ({
      ...prev,
      fieldData: {
        ...prev.fieldData,
        [fieldSlug]: value
      }
    }));
  };

  const handleMultiValueAdd = (fieldSlug) => {
    const currentValues = formData.fieldData[fieldSlug] || [];
    setFormData(prev => ({
      ...prev,
      fieldData: {
        ...prev.fieldData,
        [fieldSlug]: [...currentValues, '']
      }
    }));
  };

  const handleMultiValueRemove = (fieldSlug, index) => {
    const currentValues = formData.fieldData[fieldSlug] || [];
    const newValues = currentValues.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      fieldData: {
        ...prev.fieldData,
        [fieldSlug]: newValues
      }
    }));
  };

  const handleMultiValueChange = (fieldSlug, index, value) => {
    const currentValues = formData.fieldData[fieldSlug] || [];
    const newValues = [...currentValues];
    newValues[index] = value;
    setFormData(prev => ({
      ...prev,
      fieldData: {
        ...prev.fieldData,
        [fieldSlug]: newValues
      }
    }));
  };

  // Manual video player function
  const renderVideoPreview = (url) => {
    if (!url || typeof url !== 'string') {
      return null;
    }

    const videoUrl = url.trim();

    // YouTube video handling
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      let videoId = '';
      
      if (videoUrl.includes('youtu.be/')) {
        videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
      } else if (videoUrl.includes('watch?v=')) {
        videoId = videoUrl.split('watch?v=')[1]?.split('&')[0];
      } else if (videoUrl.includes('embed/')) {
        videoId = videoUrl.split('embed/')[1]?.split('?')[0];
      }
      
      if (videoId) {
        return (
          <div style={{ 
            marginTop: '10px', 
            border: '1px solid #ddd', 
            borderRadius: '8px',
            overflow: 'hidden',
            maxWidth: '400px'
          }}>
            <div style={{ 
              position: 'relative', 
              paddingBottom: '56.25%', 
              height: 0, 
              overflow: 'hidden'
            }}>
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                allowFullScreen
                title="YouTube Video Preview"
              />
            </div>
            <small style={{ 
              fontSize: '11px', 
              color: '#666',
              display: 'block',
              padding: '8px',
              backgroundColor: '#f5f5f5'
            }}>
              📺 YouTube: {videoId}
            </small>
          </div>
        );
      }
    }

    // Vimeo video handling
    if (videoUrl.includes('vimeo.com')) {
      let videoId = '';
      
      if (videoUrl.includes('vimeo.com/')) {
        videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0]?.split('/')[0];
      }
      
      if (videoId && /^\d+$/.test(videoId)) {
        return (
          <div style={{ 
            marginTop: '10px', 
            border: '1px solid #ddd', 
            borderRadius: '8px',
            overflow: 'hidden',
            maxWidth: '400px'
          }}>
            <div style={{ 
              position: 'relative', 
              paddingBottom: '56.25%', 
              height: 0, 
              overflow: 'hidden'
            }}>
              <iframe
                src={`https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                allowFullScreen
                title="Vimeo Video Preview"
              />
            </div>
            <small style={{ 
              fontSize: '11px', 
              color: '#666',
              display: 'block',
              padding: '8px',
              backgroundColor: '#f5f5f5'
            }}>
              📺 Vimeo: {videoId}
            </small>
          </div>
        );
      }
    }

    // Direct video file handling
    if (/\.(mp4|webm|ogg|mov|avi|mkv|m4v)$/i.test(videoUrl)) {
      return (
        <div style={{ 
          marginTop: '10px', 
          border: '1px solid #ddd', 
          borderRadius: '8px',
          overflow: 'hidden',
          maxWidth: '400px'
        }}>
          <video
            controls
            style={{
              width: '100%',
              height: 'auto',
              backgroundColor: '#000'
            }}
            preload="metadata"
          >
            <source src={videoUrl} type={`video/${videoUrl.split('.').pop()}`} />
            Your browser does not support the video tag.
          </video>
          <small style={{ 
            fontSize: '11px', 
            color: '#666',
            display: 'block',
            padding: '8px',
            backgroundColor: '#f5f5f5'
          }}>
            🎬 {videoUrl.split('/').pop()}
          </small>
        </div>
      );
    }

    // Dailymotion handling
    if (videoUrl.includes('dailymotion.com')) {
      let videoId = '';
      
      if (videoUrl.includes('/video/')) {
        videoId = videoUrl.split('/video/')[1]?.split('?')[0]?.split('_')[0];
      }
      
      if (videoId) {
        return (
          <div style={{ 
            marginTop: '10px', 
            border: '1px solid #ddd', 
            borderRadius: '8px',
            overflow: 'hidden',
            maxWidth: '400px'
          }}>
            <div style={{ 
              position: 'relative', 
              paddingBottom: '56.25%', 
              height: 0, 
              overflow: 'hidden'
            }}>
              <iframe
                src={`https://www.dailymotion.com/embed/video/${videoId}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                allowFullScreen
                title="Dailymotion Video Preview"
              />
            </div>
            <small style={{ 
              fontSize: '11px', 
              color: '#666',
              display: 'block',
              padding: '8px',
              backgroundColor: '#f5f5f5'
            }}>
              📺 Dailymotion: {videoId}
            </small>
          </div>
        );
      }
    }

    // No preview available
    return (
      <div style={{ 
        marginTop: '10px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '6px'
      }}>
        <small style={{ color: '#666', fontSize: '12px' }}>
          🎥 Video URL entered - will be processed when item is saved
        </small>
      </div>
    );
  };

  // Render different input types based on field type
  const renderField = (field) => {
    const value = formData.fieldData[field.slug];
    const fieldStyle = {
      width: '100%',
      padding: '8px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '14px'
    };

    switch (field.type) {
      case 'PlainText':
      case 'Text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.slug, e.target.value, field.type)}
            required={field.required}
            style={fieldStyle}
            placeholder={`Enter ${field.displayName.toLowerCase()}`}
          />
        );

      case 'RichText':
        return (
          <div style={{ minHeight: '200px' }}>
            <ReactQuill
              value={value || ''}
              onChange={(content) => handleFieldChange(field.slug, content, field.type)}
              modules={quillModules}
              formats={quillFormats}
              theme="snow"
              placeholder={`Enter ${field.displayName.toLowerCase()}...`}
              style={{
                minHeight: '150px',
                backgroundColor: 'white'
              }}
            />
            <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '8px' }}>
              Rich text editor with full formatting options
            </small>
          </div>
        );

      case 'Number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.slug, e.target.value, field.type)}
            required={field.required}
            style={fieldStyle}
            placeholder="Enter number"
          />
        );

      case 'Email':
        return (
          <input
            type="email"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.slug, e.target.value, field.type)}
            required={field.required}
            style={fieldStyle}
            placeholder="Enter email address"
          />
        );

      case 'Phone':
        return (
          <input
            type="tel"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.slug, e.target.value, field.type)}
            required={field.required}
            style={fieldStyle}
            placeholder="Enter phone number"
          />
        );

      case 'Link':
        return (
          <input
            type="url"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.slug, e.target.value, field.type)}
            required={field.required}
            style={fieldStyle}
            placeholder="Enter URL (https://...)"
          />
        );

      case 'VideoLink':
        return (
          <div>
            <input
              type="url"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.slug, e.target.value, field.type)}
              required={field.required}
              style={fieldStyle}
              placeholder="Enter video URL (YouTube, Vimeo, MP4, etc.)"
            />
            <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
              Supports YouTube, Vimeo, MP4, and other video formats
            </small>
            {value && renderVideoPreview(value)}
          </div>
        );

      case 'DateTime':
        return (
          <input
            type="datetime-local"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.slug, e.target.value, field.type)}
            required={field.required}
            style={fieldStyle}
          />
        );

      case 'Bool':
      case 'Switch':
        return (
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleFieldChange(field.slug, e.target.checked, field.type)}
              style={{ transform: 'scale(1.2)' }}
            />
            <span>{value ? 'Yes' : 'No'}</span>
          </label>
        );

      case 'Color':
        return (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => handleFieldChange(field.slug, e.target.value, field.type)}
              style={{ width: '50px', height: '40px', border: 'none', borderRadius: '4px' }}
            />
            <input
              type="text"
              value={value || '#000000'}
              onChange={(e) => handleFieldChange(field.slug, e.target.value, field.type)}
              style={{ ...fieldStyle, width: '100px' }}
              placeholder="#000000"
            />
          </div>
        );

      case 'ImageRef':
      case 'Image':
        return (
          <div>
            <input
              type="url"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.slug, e.target.value, field.type)}
              required={field.required}
              style={fieldStyle}
              placeholder="Enter image URL (https://...)"
            />
            <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
              Webflow will download and store the image from this URL
            </small>
            {value && (
              <img 
                src={value} 
                alt="Preview" 
                style={{ 
                  maxWidth: '200px', 
                  maxHeight: '150px', 
                  marginTop: '8px', 
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  objectFit: 'cover'
                }}
                onError={(e) => {e.target.style.display = 'none'}}
              />
            )}
          </div>
        );

      case 'ImageRefSet':
      case 'MultiImage':
        const imageValues = value || [];
        return (
          <div>
            {imageValues.map((imageUrl, index) => (
              <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => handleMultiValueChange(field.slug, index, e.target.value)}
                  style={{ ...fieldStyle, flex: 1 }}
                  placeholder={`Image URL ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => handleMultiValueRemove(field.slug, index)}
                  style={{
                    padding: '8px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
                {imageUrl && (
                  <img 
                    src={imageUrl} 
                    alt={`Preview ${index + 1}`} 
                    style={{ 
                      width: '60px', 
                      height: '60px', 
                      objectFit: 'cover',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                    onError={(e) => {e.target.style.display = 'none'}}
                  />
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleMultiValueAdd(field.slug)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              + Add Image URL
            </button>
            <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
              Add multiple image URLs. Webflow supports up to 25 images per field.
            </small>
          </div>
        );

      case 'ItemRef':
      case 'Reference':
        return (
          <div>
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.slug, e.target.value, field.type)}
              required={field.required}
              style={fieldStyle}
              placeholder="Enter Webflow Item ID"
            />
            <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
              Enter the ID of the item you want to reference from another collection
            </small>
          </div>
        );

      case 'ItemRefSet':
      case 'MultiReference':
        const refValues = value || [];
        return (
          <div>
            {refValues.map((refId, index) => (
              <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={refId}
                  onChange={(e) => handleMultiValueChange(field.slug, index, e.target.value)}
                  style={{ ...fieldStyle, flex: 1 }}
                  placeholder={`Reference ID ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => handleMultiValueRemove(field.slug, index)}
                  style={{
                    padding: '8px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleMultiValueAdd(field.slug)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              + Add Reference ID
            </button>
            <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
              Add multiple reference IDs from other collections
            </small>
          </div>
        );

      case 'Option':
        return (
          <div>
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.slug, e.target.value, field.type)}
              required={field.required}
              style={fieldStyle}
              placeholder="Enter option value"
            />
            <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
              Enter the exact option value as defined in Webflow
            </small>
          </div>
        );

      case 'File':
        return (
          <div>
            <input
              type="url"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.slug, e.target.value, field.type)}
              required={field.required}
              style={fieldStyle}
              placeholder="Enter file URL"
            />
            <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
              Enter a publicly accessible file URL
            </small>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.slug, e.target.value, field.type)}
            required={field.required}
            style={fieldStyle}
            placeholder={`Enter ${field.displayName.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      backgroundColor: '#f9f9f9' 
    }}>
      {/* Import Quill CSS */}
      <style jsx global>{`
        @import url('https://cdn.quilljs.com/1.3.6/quill.snow.css');
        
        .ql-editor {
          min-height: 120px;
        }
        
        .ql-toolbar {
          border-top: 1px solid #ccc;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
        }
        
        .ql-container {
          border-bottom: 1px solid #ccc;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
        }
      `}</style>

      <h3 style={{ marginBottom: '20px', color: '#333' }}>Create New Item</h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {fields.map((field) => (
          <div key={field.id}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              {field.displayName}
              {field.required && <span style={{ color: 'red' }}> *</span>}
              <span style={{ 
                fontSize: '12px', 
                fontWeight: 'normal', 
                color: '#666',
                marginLeft: '8px'
              }}>
                ({field.type})
              </span>
            </label>
            {renderField(field)}
            {field.helpText && (
              <small style={{ 
                color: '#666', 
                fontSize: '12px', 
                display: 'block', 
                marginTop: '4px' 
              }}>
                {field.helpText}
              </small>
            )}
          </div>
        ))}
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '15px',
          padding: '15px',
          backgroundColor: '#fff',
          borderRadius: '6px',
          border: '1px solid #e0e0e0'
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={formData.isDraft}
              onChange={(e) => setFormData(prev => ({ ...prev, isDraft: e.target.checked }))}
              style={{ transform: 'scale(1.2)' }}
            />
            <span style={{ fontSize: '14px' }}>Save as Draft</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={formData.isArchived}
              onChange={(e) => setFormData(prev => ({ ...prev, isArchived: e.target.checked }))}
              style={{ transform: 'scale(1.2)' }}
            />
            <span style={{ fontSize: '14px' }}>Archive Item</span>
          </label>
        </div>
        
        <button 
          type="submit" 
          disabled={submitting}
          style={{
            padding: '15px 30px',
            backgroundColor: submitting ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'background-color 0.2s'
          }}
        >
          {submitting ? 'Creating...' : 'Create Item'}
        </button>
      </form>
    </div>
  );
}

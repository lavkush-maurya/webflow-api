import { useState, useEffect, useMemo } from 'react';
import { api } from '../lib/webflowApi';
import dynamic from 'next/dynamic';

// Dynamic import for React Quill (rich text editor)
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false, loading: () => <p>Loading editor...</p> });

export default function UpdateItemForm({ collectionId, item, fields = [], onUpdate, onCancel }) {
  const [formData, setFormData] = useState({
    isArchived: false,
    isDraft: false,
    fieldData: {},
  });
  const [submitting, setSubmitting] = useState(false);

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  }), []);

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'link', 'image', 'video',
  ];

  useEffect(() => {
    if (item && fields.length) {
      const fieldData = {};
      fields.forEach((field) => {
        const val = item.fieldData[field.slug];
        switch (field.type) {
          case 'Bool':
          case 'Switch':
            fieldData[field.slug] = val || false;
            break;
          case 'Number':
            fieldData[field.slug] = val !== undefined ? val : '';
            break;
          case 'DateTime':
            fieldData[field.slug] = val ? new Date(val).toISOString().slice(0, 16) : '';
            break;
          case 'ImageRef':
          case 'Image':
            fieldData[field.slug] = val ? (typeof val === 'object' ? val.url || '' : val) : '';
            break;
          case 'ImageRefSet':
          case 'MultiImage':
            fieldData[field.slug] = Array.isArray(val) ? val.map(i => typeof i === 'object' ? i.url : i) : [];
            break;
          case 'ItemRefSet':
          case 'MultiReference':
            fieldData[field.slug] = Array.isArray(val) ? val : [];
            break;
          case 'Color':
            fieldData[field.slug] = val || '#000000';
            break;
          case 'RichText':
          case 'Text':
          case 'PlainText':
            fieldData[field.slug] = val || '';
            break;
          case 'VideoLink':
            fieldData[field.slug] = typeof val === 'object' && val.url ? val.url : val || '';
            break;
          default:
            fieldData[field.slug] = val || '';
        }
      });
      setFormData({
        isArchived: item.isArchived || false,
        isDraft: item.isDraft || false,
        fieldData,
      });
    }
  }, [item, fields]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formattedData = {
        ...formData,
        fieldData: await formatFieldData(formData.fieldData, fields),
      };
      await api.updateItem(collectionId, item.id, formattedData);
      alert('Item updated successfully!');
      if(onUpdate) onUpdate();
    } catch (error) {
      alert(`Error updating item: ${error?.response?.data?.details || error.message}`);
      console.error(error);
    }
    setSubmitting(false);
  };

  const formatFieldData = async (fieldData, fields) => {
    const formatted = { ...fieldData };
    for (const field of fields) {
      const val = fieldData[field.slug];
      if ((field.type === 'ImageRefSet' || field.type === 'MultiImage' || field.type === 'ItemRefSet' || field.type === 'MultiReference') && Array.isArray(val)) {
        formatted[field.slug] = val.filter(v => v.trim() !== '');
      }
      if (field.type === 'DateTime' && val) {
        formatted[field.slug] = new Date(val).toISOString();
      }
      if (field.type === 'Number' && val !== '') {
        formatted[field.slug] = Number(val);
      }
    }
    return formatted;
  };

  const handleFieldChange = (slug, value) => {
    setFormData((f) => ({
      ...f,
      fieldData: {
        ...f.fieldData,
        [slug]: value,
      },
    }));
  };

  const handleMultiAdd = (slug) => {
    setFormData((f) => ({
      ...f,
      fieldData: {
        ...f.fieldData,
        [slug]: [...(f.fieldData[slug] || []), ''],
      },
    }));
  };

  const handleMultiRemove = (slug, idx) => {
    setFormData((f) => ({
      ...f,
      fieldData: {
        ...f.fieldData,
        [slug]: f.fieldData[slug].filter((_, i) => i !== idx),
      },
    }));
  };

  const handleMultiChange = (slug, idx, value) => {
    const newArr = [...(formData.fieldData[slug] || [])];
    newArr[idx] = value;
    setFormData((f) => ({
      ...f,
      fieldData: {
        ...f.fieldData,
        [slug]: newArr,
      },
    }));
  };

  // Manual video player preview function
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
            marginTop: '8px', 
            border: '1px solid #ddd', 
            borderRadius: '6px',
            overflow: 'hidden',
            maxWidth: '100%'
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
            marginTop: '8px', 
            border: '1px solid #ddd', 
            borderRadius: '6px',
            overflow: 'hidden',
            maxWidth: '100%'
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
          marginTop: '8px', 
          border: '1px solid #ddd', 
          borderRadius: '6px',
          overflow: 'hidden',
          maxWidth: '100%'
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

    // No preview available
    return (
      <div style={{ 
        marginTop: '8px',
        padding: '8px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '4px'
      }}>
        <small style={{ color: '#666', fontSize: '11px' }}>
          🎥 Video URL - will be processed when saved
        </small>
      </div>
    );
  };

  const renderField = (field) => {
    const value = formData.fieldData[field.slug];
    const baseStyle = { width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #ccc', fontSize: 14 };

    switch (field.type) {
      case 'RichText':
        return (
          <ReactQuill
            value={value || ''}
            onChange={(val) => handleFieldChange(field.slug, val)}
            modules={quillModules}
            formats={quillFormats}
            theme="snow"
            placeholder={`Enter ${field.displayName}...`}
            style={{ minHeight: 150, background: '#fff' }}
          />
        );

      case 'ImageRef':
      case 'Image':
        return (
          <div>
            <input
              type='url'
              value={value || ''}
              onChange={(e) => handleFieldChange(field.slug, e.target.value)}
              placeholder='Image URL https://...'
              style={baseStyle}
            />
            {value && <img src={value} alt='preview' style={{ maxWidth: 150, marginTop: 8, borderRadius: 4 }} />}
          </div>
        );

      case 'MultiImage':
      case 'ImageRefSet':
        const images = value || [];
        return (
          <div>
            {images.map((img, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                <input value={img} onChange={(e) => handleMultiChange(field.slug, i, e.target.value)} placeholder={`Image URL ${i + 1}`} style={{ ...baseStyle, flex: 1 }} />
                <button type="button" onClick={() => handleMultiRemove(field.slug, i)} style={{ background: 'crimson', color: 'white', padding: '8px', borderRadius: 4, border: 'none' }}>×</button>
              </div>
            ))}
            <button type="button" onClick={() => handleMultiAdd(field.slug)} style={{ background: 'green', color: 'white', padding: '6px 12px', borderRadius: 4, border: 'none' }}>
              + Add Image URL
            </button>
          </div>
        );

      case 'VideoLink':
        return (
          <div>
            <input
              type='url'
              value={value || ''}
              onChange={(e) => handleFieldChange(field.slug, e.target.value)}
              placeholder='Video URL (YouTube, Vimeo, MP4...)'
              style={baseStyle}
            />
            <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
              Supports YouTube, Vimeo, MP4, and other video formats
            </small>
            {value && renderVideoPreview(value)}
          </div>
        );

      case 'Bool':
      case 'Switch':
        return (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type='checkbox' checked={value || false} onChange={(e) => handleFieldChange(field.slug, e.target.checked)} />
            {value ? 'Yes' : 'No'}
          </label>
        );

      case 'Number':
        return (
          <input type='number' value={value || ''} onChange={(e) => handleFieldChange(field.slug, e.target.value)} placeholder='Number' style={baseStyle} />
        );

      case 'DateTime':
        return (
          <input type='datetime-local' value={value || ''} onChange={(e) => handleFieldChange(field.slug, e.target.value)} style={baseStyle} />
        );

      case 'Color':
        return (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type='color' value={value || '#000000'} onChange={(e) => handleFieldChange(field.slug, e.target.value)} style={{ width: 60, height: 40, border: 'none', borderRadius: 4 }} />
            <input type="text" value={value || '#000000'} onChange={(e) => handleFieldChange(field.slug, e.target.value)} style={{ ...baseStyle, width: '100px' }} placeholder="#000000" />
          </div>
        );

      default:
        return (
          <input type='text' value={value || ''} onChange={(e) => handleFieldChange(field.slug, e.target.value)} placeholder={`Enter ${field.displayName}`} style={baseStyle} />
        );
    }
  };

  return (
    <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: 20}}>
      <div style={{backgroundColor: 'white', padding: 30, maxWidth: 800, width: '100%', borderRadius: 8, maxHeight: '90vh', overflowY: 'auto'}}>
        <h3>Update Item: {item?.fieldData?.name || item?.fieldData?.title || 'Untitled'}</h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {fields.map(field => (
            <div key={field.id}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 6 }}>
                {field.displayName}
                {field.required && <span style={{ color: 'red' }}> *</span>}
                <span style={{ fontSize: 12, color: '#666', marginLeft: 6 }}>({field.type})</span>
              </label>
              {renderField(field)}
            </div>
          ))}
          
          <div style={{ display: 'flex', gap: 20 }}>
            <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type='checkbox' checked={formData.isDraft} onChange={e => setFormData(f => ({ ...f, isDraft: e.target.checked }))} />
              Save as Draft
            </label>
      
            <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type='checkbox' checked={formData.isArchived} onChange={e => setFormData(f => ({ ...f, isArchived: e.target.checked }))} />
              Archive Item
            </label>
          </div>

          <div style={{ display: 'flex', gap: 20, marginTop: 30 }}>
            <button type="submit" disabled={submitting} style={{ flex: 1, padding: '12px 0', backgroundColor: '#0070f3', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: 6, cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitting ? 'Updating...' : 'Update Item'}
            </button>
            <button type="button" onClick={onCancel} disabled={submitting} style={{ flex: 1, padding: '12px 0', backgroundColor: '#6c757d', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

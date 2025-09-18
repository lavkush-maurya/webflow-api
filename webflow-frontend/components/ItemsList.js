import { useState, useEffect } from 'react';
import { api } from '../lib/webflowApi';

export default function ItemsList({ 
  collectionId, 
  onItemSelect, 
  refreshTrigger, 
  fields = [], 
  onItemDeleted 
}) {
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
      
      if (onItemDeleted) {
        onItemDeleted();
      }
      
      alert('Item deleted successfully!');
    } catch (err) {
      alert(`Error deleting item: ${err.response?.data?.details || err.message}`);
      console.error('Error deleting item:', err);
    }
  };

  // Manual video player function
  const renderVideoPlayer = (url) => {
    if (!url || typeof url !== 'string') {
      return <span style={{ color: '#999', fontStyle: 'italic' }}>N/A</span>;
    }

    const videoUrl = url.trim();
    console.log('Processing video URL:', videoUrl);

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
          <div style={{ width: '100%', maxWidth: '320px', marginBottom: '8px' }}>
            <div style={{ 
              position: 'relative', 
              paddingBottom: '56.25%', 
              height: 0, 
              overflow: 'hidden',
              borderRadius: '8px',
              border: '1px solid #ddd'
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
                title="YouTube Video"
              />
            </div>
            <small style={{ 
              fontSize: '11px', 
              color: '#666',
              display: 'block',
              marginTop: '4px',
              wordBreak: 'break-all'
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
          <div style={{ width: '100%', maxWidth: '320px', marginBottom: '8px' }}>
            <div style={{ 
              position: 'relative', 
              paddingBottom: '56.25%', 
              height: 0, 
              overflow: 'hidden',
              borderRadius: '8px',
              border: '1px solid #ddd'
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
                title="Vimeo Video"
              />
            </div>
            <small style={{ 
              fontSize: '11px', 
              color: '#666',
              display: 'block',
              marginTop: '4px',
              wordBreak: 'break-all'
            }}>
              📺 Vimeo: {videoId}
            </small>
          </div>
        );
      }
    }

    // Direct video file handling (MP4, WebM, etc.)
    if (/\.(mp4|webm|ogg|mov|avi|mkv|m4v)$/i.test(videoUrl)) {
      return (
        <div style={{ width: '100%', maxWidth: '320px', marginBottom: '8px' }}>
          <video
            controls
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '8px',
              border: '1px solid #ddd',
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
            marginTop: '4px',
            wordBreak: 'break-all'
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
          <div style={{ width: '100%', maxWidth: '320px', marginBottom: '8px' }}>
            <div style={{ 
              position: 'relative', 
              paddingBottom: '56.25%', 
              height: 0, 
              overflow: 'hidden',
              borderRadius: '8px',
              border: '1px solid #ddd'
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
                title="Dailymotion Video"
              />
            </div>
            <small style={{ 
              fontSize: '11px', 
              color: '#666',
              display: 'block',
              marginTop: '4px'
            }}>
              📺 Dailymotion: {videoId}
            </small>
          </div>
        );
      }
    }

    // Facebook video handling
    if (videoUrl.includes('facebook.com') && videoUrl.includes('/videos/')) {
      return (
        <div style={{ width: '100%', maxWidth: '320px', marginBottom: '8px' }}>
          <div style={{ 
            position: 'relative', 
            paddingBottom: '56.25%', 
            height: 0, 
            overflow: 'hidden',
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}>
            <iframe
              src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoUrl)}&show_text=0&width=320`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              allowFullScreen
              title="Facebook Video"
            />
          </div>
          <small style={{ 
            fontSize: '11px', 
            color: '#666',
            display: 'block',
            marginTop: '4px'
          }}>
            📺 Facebook Video
          </small>
        </div>
      );
    }

    // TikTok handling (basic embed)
    if (videoUrl.includes('tiktok.com')) {
      return (
        <div style={{ width: '100%', maxWidth: '320px', marginBottom: '8px' }}>
          <div style={{ 
            padding: '20px',
            backgroundColor: '#f0f0f0',
            borderRadius: '8px',
            border: '1px solid #ddd',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎵</div>
            <a 
              href={videoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#0070f3',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              View on TikTok
            </a>
          </div>
          <small style={{ 
            fontSize: '11px', 
            color: '#666',
            display: 'block',
            marginTop: '4px'
          }}>
            📺 TikTok Video
          </small>
        </div>
      );
    }

    // Fallback for any other video URL
    return (
      <div style={{ marginBottom: '8px' }}>
        <a 
          href={videoUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            color: '#0070f3',
            textDecoration: 'none',
            fontSize: '14px'
          }}
        >
          🎥 {videoUrl.length > 40 ? videoUrl.substring(0, 40) + '...' : videoUrl}
        </a>
        <small style={{ 
          fontSize: '11px', 
          color: '#999',
          display: 'block',
          marginTop: '2px'
        }}>
          Video link (click to open)
        </small>
      </div>
    );
  };

  const formatFieldValue = (value, fieldType, fieldSlug) => {
    // Handle null, undefined, or empty values
    if (value === null || value === undefined || value === '' || 
        (typeof value === 'object' && (!value.url && !Array.isArray(value) && Object.keys(value).length === 0))) {
      return <span style={{ color: '#999', fontStyle: 'italic' }}>N/A</span>;
    }

    switch (fieldType) {
      case 'Bool':
      case 'Switch':
        return (
          <span style={{ 
            color: value ? '#28a745' : '#dc3545',
            fontWeight: 'bold'
          }}>
            {value ? '✓ Yes' : '✗ No'}
          </span>
        );

      case 'RichText':
        const textValue = typeof value === 'string' ? value : String(value);
        const cleanText = textValue.replace(/<[^>]*>/g, '');
        return (
          <div>
            <div 
              style={{ 
                fontSize: '14px',
                maxHeight: '80px',
                overflow: 'hidden',
                lineHeight: '1.4',
                border: '1px solid #e0e0e0',
                padding: '8px',
                borderRadius: '4px',
                backgroundColor: '#f9f9f9'
              }}
              dangerouslySetInnerHTML={{ 
                __html: textValue.length > 150 ? textValue.substring(0, 150) + '...' : textValue 
              }}
            />
            <small style={{ color: '#666', fontStyle: 'italic', marginTop: '4px', display: 'block' }}>
              {cleanText.length} characters
            </small>
          </div>
        );

      case 'VideoLink':
        const videoUrl = typeof value === 'object' && value.url ? value.url : 
                        typeof value === 'string' ? value : '';
        return renderVideoPlayer(videoUrl);

      case 'ImageRef':
      case 'Image':
        // Handle different image object structures
        let imageUrl = '';
        let imageAlt = '';
        
        if (typeof value === 'object' && value !== null) {
          if (value.url) {
            imageUrl = value.url;
            imageAlt = value.alt || '';
          } else if (value.src) {
            imageUrl = value.src;
            imageAlt = value.alt || '';
          }
        } else if (typeof value === 'string') {
          imageUrl = value;
        }

        if (imageUrl) {
          return (
            <div>
              <img 
                src={imageUrl} 
                alt={imageAlt || 'Image'} 
                style={{ 
                  maxWidth: '120px', 
                  maxHeight: '80px', 
                  objectFit: 'cover',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              {imageAlt && (
                <small style={{ fontSize: '11px', color: '#666', display: 'block', marginTop: '2px' }}>
                  Alt: {imageAlt}
                </small>
              )}
            </div>
          );
        }
        return <span style={{ color: '#999', fontStyle: 'italic' }}>N/A</span>;

      case 'ImageRefSet':
      case 'MultiImage':
        if (Array.isArray(value) && value.length > 0) {
          return (
            <div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '4px' }}>
                {value.slice(0, 4).map((img, index) => {
                  let imgUrl = '';
                  let imgAlt = '';
                  
                  if (typeof img === 'object' && img !== null) {
                    imgUrl = img.url || img.src || '';
                    imgAlt = img.alt || '';
                  } else if (typeof img === 'string') {
                    imgUrl = img;
                  }

                  return imgUrl ? (
                    <img 
                      key={index}
                      src={imgUrl} 
                      alt={imgAlt || `Image ${index + 1}`}
                      style={{ 
                        width: '50px', 
                        height: '50px', 
                        objectFit: 'cover',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                      }}
                      onError={(e) => {e.target.style.display = 'none'}}
                    />
                  ) : null;
                })}
              </div>
              <small style={{ color: '#666', fontSize: '11px' }}>
                {value.length} image{value.length > 1 ? 's' : ''}
                {value.length > 4 && ` (showing first 4)`}
              </small>
            </div>
          );
        }
        return <span style={{ color: '#999', fontStyle: 'italic' }}>N/A</span>;

      case 'Color':
        const colorValue = typeof value === 'object' && value.hex ? value.hex : 
                          typeof value === 'string' ? value : '#000000';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div 
              style={{ 
                width: '30px', 
                height: '30px', 
                backgroundColor: colorValue,
                border: '2px solid #ddd',
                borderRadius: '4px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            />
            <code style={{ fontSize: '12px', backgroundColor: '#f5f5f5', padding: '2px 4px', borderRadius: '2px' }}>
              {colorValue}
            </code>
          </div>
        );

      case 'DateTime':
        const dateValue = typeof value === 'object' && value.date ? value.date : value;
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) {
          return <span style={{ color: '#999', fontStyle: 'italic' }}>Invalid Date</span>;
        }
        return (
          <div style={{ fontSize: '14px' }}>
            <div>{date.toLocaleDateString()}</div>
            <small style={{ color: '#666' }}>{date.toLocaleTimeString()}</small>
          </div>
        );

      case 'Link':
        const linkUrl = typeof value === 'object' && value.url ? value.url : 
                       typeof value === 'string' ? value : '';
        return linkUrl ? (
          <a 
            href={linkUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: '#0070f3',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            🔗 {linkUrl.length > 35 ? linkUrl.substring(0, 35) + '...' : linkUrl}
          </a>
        ) : <span style={{ color: '#999', fontStyle: 'italic' }}>N/A</span>;

      case 'Email':
        const emailValue = typeof value === 'object' && value.email ? value.email : 
                          typeof value === 'string' ? value : '';
        return emailValue ? (
          <a 
            href={`mailto:${emailValue}`}
            style={{ 
              color: '#0070f3',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            ✉️ {emailValue}
          </a>
        ) : <span style={{ color: '#999', fontStyle: 'italic' }}>N/A</span>;

      case 'Phone':
        const phoneValue = typeof value === 'object' && value.phone ? value.phone : 
                          typeof value === 'string' ? value : '';
        return phoneValue ? (
          <a 
            href={`tel:${phoneValue}`}
            style={{ 
              color: '#0070f3',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            📞 {phoneValue}
          </a>
        ) : <span style={{ color: '#999', fontStyle: 'italic' }}>N/A</span>;

      case 'ItemRefSet':
      case 'MultiReference':
        if (Array.isArray(value) && value.length > 0) {
          return (
            <div>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>
                📎 {value.length} reference{value.length > 1 ? 's' : ''}
              </span>
              <div style={{ fontSize: '11px', color: '#666' }}>
                {value.slice(0, 2).map((ref, index) => {
                  const refId = typeof ref === 'object' && ref.id ? ref.id : 
                               typeof ref === 'string' ? ref : String(ref);
                  return (
                    <div key={index} style={{ fontFamily: 'monospace' }}>
                      {refId.length > 15 ? refId.substring(0, 15) + '...' : refId}
                    </div>
                  );
                })}
                {value.length > 2 && <div>...and {value.length - 2} more</div>}
              </div>
            </div>
          );
        }
        return <span style={{ color: '#999', fontStyle: 'italic' }}>N/A</span>;

      case 'ItemRef':
      case 'Reference':
        const refValue = typeof value === 'object' && value.id ? value.id : 
                        typeof value === 'string' ? value : '';
        return refValue ? (
          <span style={{ fontSize: '14px', fontFamily: 'monospace' }}>
            📎 {refValue.length > 20 ? refValue.substring(0, 20) + '...' : refValue}
          </span>
        ) : (
          <span style={{ color: '#999', fontStyle: 'italic' }}>N/A</span>
        );

      case 'Number':
        const numValue = typeof value === 'object' && value.value ? value.value : 
                        typeof value === 'number' ? value : 
                        typeof value === 'string' ? parseFloat(value) : null;
        return numValue !== null && !isNaN(numValue) ? (
          <span style={{ 
            fontSize: '14px', 
            fontWeight: '500',
            color: '#2563eb'
          }}>
            {Number(numValue).toLocaleString()}
          </span>
        ) : <span style={{ color: '#999', fontStyle: 'italic' }}>N/A</span>;

      case 'File':
        const fileUrl = typeof value === 'object' && value.url ? value.url : 
                       typeof value === 'string' ? value : '';
        return fileUrl ? (
          <a 
            href={fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: '#0070f3',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            📄 {fileUrl.split('/').pop() || 'File'}
          </a>
        ) : (
          <span style={{ color: '#999', fontStyle: 'italic' }}>N/A</span>
        );

      case 'Option':
        const optionValue = typeof value === 'object' && value.label ? value.label : 
                           typeof value === 'string' ? value : String(value);
        return (
          <span style={{ 
            fontSize: '14px', 
            backgroundColor: '#e3f2fd',
            color: '#1565c0',
            padding: '2px 8px',
            borderRadius: '12px',
            fontWeight: '500'
          }}>
            {optionValue}
          </span>
        );

      default:
        // Safe rendering for any other field type
        if (typeof value === 'object' && value !== null) {
          // If it's an object, try to extract meaningful string representation
          const stringValue = value.text || value.value || value.name || value.title || 
                             JSON.stringify(value).substring(0, 60) + '...';
          return <span style={{ fontSize: '14px' }}>{String(stringValue)}</span>;
        } else if (typeof value === 'string') {
          if (value.length > 60) {
            return (
              <span style={{ fontSize: '14px' }}>
                {value.substring(0, 60)}...
              </span>
            );
          }
          return <span style={{ fontSize: '14px' }}>{value}</span>;
        }
        return (
          <span style={{ fontSize: '14px' }}>
            {String(value)}
          </span>
        );
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading items...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>Collection Items ({items.length})</h2>
      {items.length === 0 ? (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          color: '#666',
          border: '2px dashed #ddd',
          borderRadius: '8px'
        }}>
          <p>No items found in this collection.</p>
          <p style={{ fontSize: '14px' }}>Create your first item using the form above!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {items.map(item => (
            <div 
              key={item.id} 
              style={{ 
                border: '1px solid #ddd', 
                padding: '20px', 
                borderRadius: '8px',
                backgroundColor: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'start',
                marginBottom: '15px'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>
                    {item.fieldData?.name || item.fieldData?.title || 'Untitled'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                    <strong>ID:</strong> {item.id}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    fontSize: '12px',
                    backgroundColor: item.isDraft ? '#fff3cd' : '#d4edda',
                    color: item.isDraft ? '#856404' : '#155724',
                    border: `1px solid ${item.isDraft ? '#ffeaa7' : '#c3e6cb'}`
                  }}>
                    {item.isDraft ? 'Draft' : 'Published'}
                  </span>
                  {item.isArchived && (
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      fontSize: '12px',
                      backgroundColor: '#f8d7da',
                      color: '#721c24',
                      border: '1px solid #f5c6cb'
                    }}>
                      Archived
                    </span>
                  )}
                </div>
              </div>

              {/* Display ALL field values */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '15px',
                marginBottom: '15px'
              }}>
                {fields.map(field => (
                  <div key={field.id} style={{ 
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef'
                  }}>
                    <label style={{ 
                      fontSize: '12px', 
                      fontWeight: 'bold', 
                      color: '#495057',
                      display: 'block',
                      marginBottom: '6px'
                    }}>
                      {field.displayName}
                      <span style={{ 
                        fontSize: '10px', 
                        color: '#6c757d',
                        fontWeight: 'normal',
                        marginLeft: '4px'
                      }}>
                        ({field.type})
                      </span>
                    </label>
                    <div>
                      {formatFieldValue(item.fieldData[field.slug], field.type, field.slug)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '10px',
                paddingTop: '15px',
                borderTop: '1px solid #eee'
              }}>
                <button 
                  onClick={() => onItemSelect && onItemSelect(item)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#0070f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
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
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
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

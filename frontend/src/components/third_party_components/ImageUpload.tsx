import React from 'react';
import { Button, Form } from 'react-bootstrap';

interface Props {
  urls: string[]; // Changed from 'value: string' to 'urls: string[]'
  onChange: (urls: string[]) => void; // Changed to accept an array
}

export const ImageUploadField: React.FC<Props> = ({ urls, onChange }) => {
  const openWidget = () => {
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'dmt6cjoij',
        uploadPreset: 'tourist_place_preset',
        multiple: true, // IMPORTANT: Allows multiple selection
      },
      (error: any, result: any) => {
        if (!error && result && result.event === 'success') {
          // Append the new URL to the existing array of URLs
          onChange([...urls, result.info.secure_url]);
        }
      }
    );
    widget.open();
  };

  const removeImage = (indexToRemove: number) => {
    // Filter out the image at the specific index
    onChange(urls.filter((_, index) => index !== indexToRemove));
  };

  return (
    <Form.Group className="mb-4">
      <Form.Label className="small fw-bold">Upload Images</Form.Label>
      <div className="d-flex flex-wrap gap-3 align-items-start">
        <Button variant="outline-primary" onClick={openWidget}>
          Add Images
        </Button>
        
        {urls.map((url, index) => (
          <div key={index} style={{ position: 'relative' }}>
            <img 
              src={url} 
              alt="Preview" 
              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} 
            />
            {/* The "Cross" button */}
            <button
              type="button"
              onClick={() => removeImage(index)}
              style={{
                position: 'absolute', top: '-5px', right: '-5px',
                background: 'red', color: 'white', border: 'none',
                borderRadius: '50%', width: '20px', height: '20px',
                fontSize: '12px', cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </Form.Group>
  );
};
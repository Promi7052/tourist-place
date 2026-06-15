// frontend/src/types.ts

/**
 * Matches PlaceImageSchema
 */
export interface PlaceImage {
    id: number;
    image_path: string;
    uploaded_at: string; // Python datetime converts to an ISO string (e.g., "2026-06-11T14:30:00Z")
  }
  
  /**
   * Matches PlaceCreateSchema (What the frontend sends to POST /places/)
   */
  export interface PlaceCreate {
    name: string;
    location: string;
    country: string;
    description?: string | null; // Optional[str] = None
    image_paths: string[];        // list[str] = []
  }
  
  /**
   * Matches PlaceUpdateSchema (What the frontend sends to PATCH/PUT /places/:id/)
   */
  export interface PlaceUpdate {
    name?: string;
    location?: string;
    country?: string;
    description?: string | null;
    image_paths?: string[];
  }
  
  /**
   * Matches PlaceResponseSchema (What the backend returns)
   */
  export interface PlaceResponse {
    id: number;
    name: string;
    location: string;
    country: string;
    description: string | null;
    created_at: string; // Python datetime converts to an ISO string
    image_paths: string[]; 
  }
/**
 * Upload image to Cloudinary via API
 */
export async function newUploadImageWithAPI(
  formData: FormData,
  fileUid: string
): Promise<{
  success: boolean;
  data?: {
    data: string; // URL of uploaded image
    public_id?: string;
    width?: number;
    height?: number;
    format?: string;
  };
  message?: string;
}> {
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.error?.message || 'Upload failed',
      };
    }

    // Return in the format expected by Multiuploader
    return {
      success: true,
      data: {
        data: result.data.url, // The secure URL from Cloudinary
        public_id: result.data.public_id,
        width: result.data.width,
        height: result.data.height,
        format: result.data.format,
      },
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
    };
  }
}

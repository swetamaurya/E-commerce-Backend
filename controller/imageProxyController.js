const axios = require('axios');
const path = require('path');
const fs = require('fs');

// Admin backend configuration
const ADMIN_BACKEND_URL = process.env.ADMIN_BACKEND_URL || 'https://backend-ecommerce-admin.onrender.com';

// Image proxy controller
class ImageProxyController {
  
  // Proxy image from admin backend or external URLs
  static async proxyImage(req, res) {
    try {
      let { filename } = req.params;
      
      // Decode URL-encoded filename
      const decodedFilename = decodeURIComponent(filename);
      
      // Check if this is an external URL (starts with http:// or https://)
      // But exclude proxy URLs to prevent loops
      const isExternalUrl = decodedFilename && 
        (decodedFilename.startsWith('http://') || decodedFilename.startsWith('https://')) &&
        !decodedFilename.includes('/api/images/proxy/');
      
      let imageUrl;
      
      if (isExternalUrl) {
        // Handle external URLs (like Unsplash, etc.)
        imageUrl = decodedFilename;
        console.log(`[IMAGE PROXY] Fetching external image: ${imageUrl}`);
      } else {
        // Handle local images - serve directly from local uploads directory
        let localFilename = decodedFilename;
        
        // Clean up filename - remove leading slash if present
        if (localFilename && localFilename.startsWith('/')) {
          localFilename = localFilename.substring(1);
        }
        
        // Validate filename - prevent directory traversal
        if (!localFilename || localFilename.includes('..') || localFilename.includes('\\')) {
          return res.status(400).json({
            success: false,
            message: 'Invalid filename'
          });
        }
        
        // Check if file exists locally first
        const localPath = path.join(__dirname, '..', 'uploads', localFilename);
        console.log(`[IMAGE PROXY] Checking local file: ${localPath}`);
        
        if (fs.existsSync(localPath)) {
          // Serve local file directly
          console.log(`[IMAGE PROXY] Serving local file: ${localFilename}`);
          
          // Set appropriate headers
          const ext = path.extname(localFilename).toLowerCase();
          const contentType = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml'
          }[ext] || 'image/jpeg';
          
          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString());
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control');
          res.setHeader('X-Image-Source', 'local');
          
          // Stream the local file
          const fileStream = fs.createReadStream(localPath);
          fileStream.pipe(res);
          
          console.log(`[IMAGE PROXY] Successfully served local file: ${localFilename}`);
          return;
        } else {
          // File doesn't exist locally, serve a placeholder image
          console.log(`[IMAGE PROXY] Local file not found, serving placeholder: ${localFilename}`);
          
          // Create a placeholder image
          const placeholderSvg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#f3f4f6"/>
            <rect x="50" y="50" width="300" height="200" fill="#e5e7eb" stroke="#d1d5db" stroke-width="2" rx="8"/>
            <text x="200" y="120" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#6b7280">
              Product Image
            </text>
            <text x="200" y="140" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af">
              ${localFilename}
            </text>
            <text x="200" y="160" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#9ca3af">
              Image will be available soon
            </text>
          </svg>`;
          
          res.setHeader('Content-Type', 'image/svg+xml');
          res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control');
          res.setHeader('X-Image-Source', 'placeholder');
          
          res.status(200).send(placeholderSvg);
          return;
        }
      }
      
      // Retry logic for better reliability
      let response;
      let lastError;
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`[IMAGE PROXY] Attempt ${attempt}/3 for ${filename}`);
          
          response = await axios.get(imageUrl, {
            responseType: 'stream',
            timeout: 30000, // 30 second timeout
            headers: {
              'User-Agent': 'MainSite-ImageProxy/1.0',
              'Accept': 'image/*',
              'Connection': 'keep-alive'
            }
          });
          
          console.log(`[IMAGE PROXY] Success on attempt ${attempt} for ${filename}`);
          break; // Success, exit retry loop
          
        } catch (error) {
          lastError = error;
          console.log(`[IMAGE PROXY] Attempt ${attempt} failed for ${isExternalUrl ? 'external URL' : filename}:`, error.message);
          
          if (attempt < 3) {
            // Wait before retry (exponential backoff)
            const delay = attempt * 2000; // 2s, 4s
            console.log(`[IMAGE PROXY] Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      // If all attempts failed, throw the last error
      if (!response) {
        throw lastError;
      }
      
      console.log(`[IMAGE PROXY] Response status: ${response.status} for ${isExternalUrl ? 'external URL' : filename}`);
      
      // Set appropriate headers
      const contentType = response.headers['content-type'] || 'image/jpeg';
      const contentLength = response.headers['content-length'];
      
      res.setHeader('Content-Type', contentType);
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString());
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control');
      res.setHeader('X-Image-Source', 'admin-backend');
      
      // Stream the image
      response.data.pipe(res);
      
      console.log(`[IMAGE PROXY] Successfully served: ${isExternalUrl ? 'external URL' : filename}`);
      
    } catch (error) {
      const isExternalUrl = req.params.filename && 
        (req.params.filename.startsWith('http://') || req.params.filename.startsWith('https://')) &&
        !req.params.filename.includes('/api/images/proxy/');
      console.error(`[IMAGE PROXY] Error serving ${isExternalUrl ? 'external URL' : req.params.filename}:`, {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        adminBackendUrl: ADMIN_BACKEND_URL,
        isExternalUrl: isExternalUrl
      });
      
      if (error.response?.status === 404) {
        // Try to serve a placeholder image or return a 404 with helpful message
        const displayName = isExternalUrl ? 'External Image' : req.params.filename;
        console.log(`[IMAGE PROXY] Image not found: ${displayName}, serving placeholder`);
        
        // Return a placeholder image response
        const placeholderSvg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f3f4f6"/>
          <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="16" fill="#6b7280">
            Image Not Found
          </text>
          <text x="50%" y="60%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af">
            ${displayName}
          </text>
        </svg>`;
        
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'no-cache');
        res.status(404).send(placeholderSvg);
        return;
      }
      
      // Handle connection issues
      if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        const displayName = isExternalUrl ? 'External Image' : req.params.filename;
        const errorMessage = isExternalUrl ? 'External Image Unavailable' : 'Admin Backend Unavailable';
        const helpText = isExternalUrl ? 'Please check external image URL' : 'Please check admin backend connection';
        
        console.log(`[IMAGE PROXY] Connection failed: ${displayName}, serving placeholder`);
        
        // Return a placeholder image response
        const placeholderSvg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#fef3c7"/>
          <text x="50%" y="45%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="16" fill="#d97706">
            ${errorMessage}
          </text>
          <text x="50%" y="55%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af">
            ${displayName}
          </text>
          <text x="50%" y="65%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="10" fill="#9ca3af">
            ${helpText}
          </text>
        </svg>`;
        
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'no-cache');
        res.status(503).send(placeholderSvg);
        return;
      }
      
      if (error.code === 'ECONNABORTED') {
        return res.status(504).json({
          success: false,
          message: 'Image request timeout',
          filename: req.params.filename,
          isExternalUrl: isExternalUrl
        });
      }
      
      res.status(500).json({
        success: false,
        message: isExternalUrl ? 'Error fetching external image' : 'Error fetching image from admin backend',
        error: error.message,
        filename: req.params.filename,
        isExternalUrl: isExternalUrl
      });
    }
  }
  
  // Get image info without downloading
  static async getImageInfo(req, res) {
    try {
      let { filename } = req.params;
      
      // Decode URL-encoded filename
      const decodedFilename = decodeURIComponent(filename);
      
      // Check if this is an external URL (starts with http:// or https://)
      // But exclude proxy URLs to prevent loops
      const isExternalUrl = decodedFilename && 
        (decodedFilename.startsWith('http://') || decodedFilename.startsWith('https://')) &&
        !decodedFilename.includes('/api/images/proxy/');
      
      let imageUrl;
      
      if (isExternalUrl) {
        // Handle external URLs (like Unsplash, etc.)
        imageUrl = decodedFilename;
        console.log(`[IMAGE PROXY] Getting info for external URL: ${imageUrl}`);
      } else {
        // Handle local admin backend images
        let localFilename = decodedFilename;
        
        // Clean up filename - remove leading slash if present
        if (localFilename && localFilename.startsWith('/')) {
          localFilename = localFilename.substring(1);
        }
        
        // Validate filename - prevent directory traversal
        if (!localFilename || localFilename.includes('..') || localFilename.includes('\\')) {
          return res.status(400).json({
            success: false,
            message: 'Invalid filename'
          });
        }
        
        // Construct admin backend image URL
        // If filename already has uploads/ prefix, use it as is, otherwise add it
        if (localFilename.startsWith('uploads/')) {
          imageUrl = `${ADMIN_BACKEND_URL}/${localFilename}`;
        } else {
          imageUrl = `${ADMIN_BACKEND_URL}/uploads/${localFilename}`;
        }
        console.log(`[IMAGE PROXY] Getting info for local image: ${localFilename}`);
      }
      
      // Make HEAD request to get image info
      const response = await axios.head(imageUrl, {
        timeout: 5000,
        headers: {
          'User-Agent': 'MainSite-ImageProxy/1.0'
        }
      });
      
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      res.json({
        success: true,
        data: {
          filename: isExternalUrl ? 'External URL' : decodedFilename,
          url: `/api/images/proxy/${req.params.filename}`,
          fullUrl: `${baseUrl}/api/images/proxy/${req.params.filename}`,
          sourceUrl: imageUrl,
          isExternalUrl: isExternalUrl,
          contentType: response.headers['content-type'],
          contentLength: response.headers['content-length'],
          lastModified: response.headers['last-modified'],
          cacheControl: 'public, max-age=31536000, immutable'
        }
      });
      
    } catch (error) {
      const decodedFilename = decodeURIComponent(req.params.filename);
      const isExternalUrl = decodedFilename && 
        (decodedFilename.startsWith('http://') || decodedFilename.startsWith('https://')) &&
        !decodedFilename.includes('/api/images/proxy/');
      console.error(`[IMAGE PROXY] Error getting info for ${isExternalUrl ? 'external URL' : decodedFilename}:`, error.message);
      
      if (error.response?.status === 404) {
        return res.status(404).json({
          success: false,
          message: 'Image not found',
          filename: req.params.filename,
          isExternalUrl: isExternalUrl
        });
      }
      
      res.status(500).json({
        success: false,
        message: isExternalUrl ? 'Error fetching external image info' : 'Error fetching image info',
        error: error.message,
        filename: req.params.filename,
        isExternalUrl: isExternalUrl
      });
    }
  }
  
  // Health check for admin backend
  static async healthCheck(req, res) {
    try {
      const ADMIN_BACKEND_URL = process.env.ADMIN_BACKEND_URL || 'https://backend-ecommerce-admin.onrender.com';
      
      console.log(`[IMAGE PROXY] Health check for admin backend: ${ADMIN_BACKEND_URL}`);
      
      // Try multiple endpoints
      const endpoints = [
        '/api/images/health',
        '/health',
        '/test-image'
      ];
      
      let lastError;
      let success = false;
      
      for (const endpoint of endpoints) {
        try {
          const startTime = Date.now();
          const response = await axios.get(`${ADMIN_BACKEND_URL}${endpoint}`, {
            timeout: 5000,
            headers: {
              'User-Agent': 'MainSite-ImageProxy/1.0'
            }
          });
          const responseTime = Date.now() - startTime;
          
          res.json({
            success: true,
            message: 'Admin backend is accessible',
            data: {
              adminBackendUrl: ADMIN_BACKEND_URL,
              workingEndpoint: endpoint,
              status: response.status,
              responseTime: `${responseTime}ms`,
              timestamp: new Date().toISOString()
            }
          });
          
          success = true;
          break;
          
        } catch (error) {
          lastError = error;
          console.log(`[IMAGE PROXY] Endpoint ${endpoint} failed:`, error.message);
        }
      }
      
      if (!success) {
        // If all endpoints fail, still return success for main site
        res.json({
          success: true,
          message: 'Image proxy is running (admin backend check failed)',
          data: {
            adminBackendUrl: ADMIN_BACKEND_URL,
            status: 'disconnected',
            error: lastError?.message || 'All endpoints failed',
            note: 'Images may not be available until admin backend is accessible',
            timestamp: new Date().toISOString()
          }
        });
      }
      
    } catch (error) {
      console.error('[IMAGE PROXY] Health check failed:', error.message);
      
      res.status(503).json({
        success: false,
        message: 'Image proxy health check failed',
        error: error.message,
        adminBackendUrl: ADMIN_BACKEND_URL,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  // List available images (for debugging)
  static async listImages(req, res) {
    try {
      console.log('[IMAGE PROXY] Listing images from admin backend');
      
      // Try to get a list of images from admin backend
      try {
        const response = await axios.get(`${ADMIN_BACKEND_URL}/api/images/list`, {
          timeout: 10000,
          headers: {
            'User-Agent': 'MainSite-ImageProxy/1.0'
          }
        });
        
        res.json({
          success: true,
          message: 'Images retrieved from admin backend',
          data: response.data,
          adminBackendUrl: ADMIN_BACKEND_URL
        });
      } catch (listError) {
        // If listing endpoint doesn't exist, provide helpful info
        res.json({
          success: true,
          message: 'Image listing endpoint not available on admin backend',
          note: 'Use /api/images/info/:filename to check specific images',
          adminBackendUrl: ADMIN_BACKEND_URL,
          suggestion: 'Check if the image exists by visiting the admin backend directly'
        });
      }
      
    } catch (error) {
      console.error('[IMAGE PROXY] Error listing images:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error listing images',
        error: error.message,
        adminBackendUrl: ADMIN_BACKEND_URL
      });
    }
  }
}

module.exports = ImageProxyController;
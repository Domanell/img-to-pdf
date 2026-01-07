# Image to PDF Converter

A production-ready React application that converts arbitrarily long images into properly formatted multi-page A4 PDFs while maintaining original quality.

## Features

- **Drag & Drop Upload**: Intuitive file upload with drag-and-drop support
- **Quality Preservation**: No downscaling or compression artifacts, pixel-perfect accuracy
- **Memory Efficient**: Processes large images in chunks to avoid browser crashes
- **Progress Tracking**: Real-time progress bar and page-by-page processing status
- **Preview Thumbnails**: Visual preview of all generated PDF pages
- **Responsive Design**: Modern UI with gradient background, works on all devices
- **A4 Format**: Converts images to standard A4 dimensions at 300 DPI (2480×3508 pixels)

## Technical Specifications

### Image Processing

- **Input formats**: PNG, JPG, JPEG (any dimensions)
- **Target page size**: A4 at 300 DPI = 2480×3508 pixels
- **Slicing algorithm**: Divides image height by A4 height, creates N full pages + 1 partial page if remainder exists

### Memory Management

- Reuses single canvas element (2480×3508px) to avoid memory overflow
- Processes images in chunks with async breaks for garbage collection
- Canvas recycling pattern prevents browser crashes on large images

### Technologies Used

- **React 18**: Modern UI with hooks
- **jsPDF**: PDF generation library
- **Canvas API**: Client-side image processing
- **Vite**: Fast development and build tool



## Live Demo

This app can be published as a static site using GitHub Pages.

**Live version:**
https://Domanell.github.io/img-to-pdf/

## Deployment to GitHub Pages

To deploy your own version:

1. Make sure your project is in a GitHub repository (e.g., https://github.com/Domanell/img-to-pdf).
2. In vite.config.js, set the `base` option to `/img-to-pdf/`.
3. Install dependencies:
	```bash
	npm install
	```
4. Deploy with:
	```bash
	npm run deploy
	```
5. After deployment, your app will be available at `https://<your-username>.github.io/img-to-pdf/`.

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

1. **Upload Image**: Click the upload area or drag and drop a PNG/JPG image
2. **View Info**: See file details, dimensions, and calculated page count
3. **Generate PDF**: Click "Generate PDF" button to start processing
4. **Monitor Progress**: Watch the progress bar and page thumbnails as they're created
5. **Download**: Click "Download PDF" when generation is complete

## Project Structure

```
img-to-pdf/
├── src/
│   ├── App.jsx          # Main application component
│   ├── App.css          # Application styles
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies and scripts
```

## Key Features Implementation

### Canvas-Based Slicing

- Creates reusable canvas element for each page slice
- Calculates source rectangles: `sourceY = pageIndex × 3508`
- Uses `ctx.drawImage()` for precise pixel mapping
- Maintains aspect ratio with proportional scaling

### PDF Generation

- Initializes jsPDF with A4 dimensions
- Adds pages sequentially with proper formatting
- Converts canvas to high-quality JPEG (95% quality)
- Generates downloadable blob with original filename

### Progress & Preview

- Real-time progress percentage calculation
- Page-by-page status updates
- Thumbnail generation for each page
- Responsive grid layout for previews

## Browser Compatibility

Works on all modern browsers that support:

- Canvas API
- FileReader API
- Blob/URL APIs
- ES6+ JavaScript

## Performance Notes

- Large images (10000px+ height) are processed efficiently
- Memory usage stays constant through canvas recycling
- Async breaks between pages prevent UI freezing
- Optimized for both mobile and desktop devices

## License

MIT

## Author

Built with expertise in frontend development, canvas processing, and PDF generation.

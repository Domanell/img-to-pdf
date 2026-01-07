import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import './App.css';

// A4 dimensions at 300 DPI
const A4_WIDTH_PX = 2480;
const A4_HEIGHT_PX = 3508;

function App() {
	const [uploadedFile, setUploadedFile] = useState(null);
	const [imageInfo, setImageInfo] = useState(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [progress, setProgress] = useState(0);
	const [progressText, setProgressText] = useState('');
	const [pagePreviews, setPagePreviews] = useState([]);
	const [pdfBlob, setPdfBlob] = useState(null);
	const [isDragging, setIsDragging] = useState(false);

	const fileInputRef = useRef(null);
	const imageRef = useRef(null);

	// Handle file selection
	const handleFileSelect = (file) => {
		if (!file) return;

		// Validate file type
		if (!file.type.match(/image\/(png|jpeg|jpg)/)) {
			alert('Please upload a PNG or JPEG image');
			return;
		}

		setUploadedFile(file);
		setPdfBlob(null);
		setPagePreviews([]);
		setProgress(0);

		// Load image to get dimensions
		const reader = new FileReader();
		reader.onload = (e) => {
			const img = new Image();
			img.onload = () => {
				imageRef.current = img;
				// Calculate scale factor to fit image width to A4 width
				const scaleX = A4_WIDTH_PX / img.width;
				// Calculate how much of original image height fits in one A4 page after scaling
				const sourceHeightPerPage = A4_HEIGHT_PX / scaleX;
				// Calculate total pages needed
				const pageCount = Math.ceil(img.height / sourceHeightPerPage);
				setImageInfo({
					name: file.name,
					size: (file.size / 1024 / 1024).toFixed(2),
					width: img.width,
					height: img.height,
					pageCount,
				});
			};
			img.src = e.target.result;
		};
		reader.readAsDataURL(file);
	};

	// Drag and drop handlers
	const handleDragOver = (e) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (e) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files[0];
		handleFileSelect(file);
	};

	const handleFileInputChange = (e) => {
		const file = e.target.files[0];
		handleFileSelect(file);
	};

	// Main PDF generation function
	const generatePDF = async () => {
		if (!imageRef.current || !imageInfo) return;

		setIsProcessing(true);
		setProgress(0);
		setPagePreviews([]);
		setPdfBlob(null);

		try {
			const img = imageRef.current;
			const totalPages = imageInfo.pageCount;
			const previews = [];

			// Create reusable canvas
			const canvas = document.createElement('canvas');
			canvas.width = A4_WIDTH_PX;
			canvas.height = A4_HEIGHT_PX;
			const ctx = canvas.getContext('2d');

			// Initialize jsPDF
			const pdf = new jsPDF({
				unit: 'px',
				format: [A4_WIDTH_PX, A4_HEIGHT_PX],
				compress: false,
			});

			let isFirstPage = true;

			// Calculate scale factor and source height per page for seamless slicing
			const scaleX = A4_WIDTH_PX / img.width;
			const sourceHeightPerPage = A4_HEIGHT_PX / scaleX;

			// Process each page
			for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
				setProgressText(`Processing page ${pageIndex + 1} of ${totalPages}...`);

				// Calculate source rectangle with proper scaling
				const sourceY = pageIndex * sourceHeightPerPage;
				const remainingHeight = img.height - sourceY;
				const sourceHeight = Math.min(sourceHeightPerPage, remainingHeight);

				// Clear canvas
				ctx.clearRect(0, 0, A4_WIDTH_PX, A4_HEIGHT_PX);

				// Fill with white background for partial pages
				const scaledHeight = sourceHeight * scaleX;
				if (scaledHeight < A4_HEIGHT_PX) {
					ctx.fillStyle = '#ffffff';
					ctx.fillRect(0, 0, A4_WIDTH_PX, A4_HEIGHT_PX);
				}

				// Draw image slice onto canvas - seamless slicing
				ctx.drawImage(
					img,
					0,
					sourceY,
					img.width,
					sourceHeight, // Source rectangle from original image
					0,
					0,
					A4_WIDTH_PX,
					scaledHeight // Destination rectangle on canvas
				);

				// Convert canvas to data URL
				const dataURL = canvas.toDataURL('image/jpeg', 0.95);

				// Add page to PDF
				if (!isFirstPage) {
					pdf.addPage([A4_WIDTH_PX, A4_HEIGHT_PX]);
				}
				pdf.addImage(dataURL, 'JPEG', 0, 0, A4_WIDTH_PX, A4_HEIGHT_PX);
				isFirstPage = false;

				// Create thumbnail for preview
				const thumbnailCanvas = document.createElement('canvas');
				const thumbWidth = 200;
				const thumbHeight = (A4_HEIGHT_PX / A4_WIDTH_PX) * thumbWidth;
				thumbnailCanvas.width = thumbWidth;
				thumbnailCanvas.height = thumbHeight;
				const thumbCtx = thumbnailCanvas.getContext('2d');
				thumbCtx.drawImage(canvas, 0, 0, thumbWidth, thumbHeight);
				previews.push(thumbnailCanvas.toDataURL('image/jpeg', 0.7));

				// Update progress
				const progressPercent = ((pageIndex + 1) / totalPages) * 100;
				setProgress(progressPercent);
				setPagePreviews([...previews]);

				// Allow garbage collection between pages
				await new Promise((resolve) => setTimeout(resolve, 0));
			}

			// Generate PDF blob
			const blob = pdf.output('blob');
			setPdfBlob(blob);
			setProgressText('PDF generated successfully!');
		} catch (error) {
			console.error('Error generating PDF:', error);
			alert('An error occurred while generating the PDF. Please try again.');
		} finally {
			setIsProcessing(false);
		}
	};

	// Download PDF
	const downloadPDF = () => {
		if (!pdfBlob || !uploadedFile) return;

		const url = URL.createObjectURL(pdfBlob);
		const a = document.createElement('a');
		a.href = url;
		const fileName = uploadedFile.name.replace(/\.[^/.]+$/, '') + '.pdf';
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	return (
		<div className="app">
			<div className="container">
				{/* Header */}
				<header className="header">
					<h1>Image to PDF Converter</h1>
					<p>Convert long images into properly formatted multi-page A4 PDFs</p>
				</header>

				{/* Upload Zone */}
				<div
					className={`upload-zone ${isDragging ? 'dragging' : ''} ${uploadedFile ? 'has-file' : ''}`}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					onClick={() => fileInputRef.current?.click()}
				>
					<input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleFileInputChange} style={{ display: 'none' }} />
					<div className="upload-content">
						<svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="17 8 12 3 7 8" />
							<line x1="12" y1="3" x2="12" y2="15" />
						</svg>
						<p className="upload-text">{uploadedFile ? 'Click or drag to change file' : 'Click or drag image here to upload'}</p>
						<p className="upload-hint">Supports PNG, JPG, JPEG</p>
					</div>
				</div>

				{/* File Info Panel */}
				{imageInfo && (
					<div className="info-panel">
						<h3>File Information</h3>
						<div className="info-grid">
							<div className="info-item">
								<span className="info-label">Filename:</span>
								<span className="info-value">{imageInfo.name}</span>
							</div>
							<div className="info-item">
								<span className="info-label">Size:</span>
								<span className="info-value">{imageInfo.size} MB</span>
							</div>
							<div className="info-item">
								<span className="info-label">Dimensions:</span>
								<span className="info-value">
									{imageInfo.width} × {imageInfo.height} px
								</span>
							</div>
							<div className="info-item">
								<span className="info-label">Pages:</span>
								<span className="info-value">
									{imageInfo.pageCount} {imageInfo.pageCount === 1 ? 'page' : 'pages'}
								</span>
							</div>
						</div>
					</div>
				)}

				{/* Generate Button */}
				{imageInfo && !isProcessing && !pdfBlob && (
					<button className="generate-btn" onClick={generatePDF}>
						Generate PDF
					</button>
				)}

				{/* Progress Bar */}
				{isProcessing && (
					<div className="progress-section">
						<div className="progress-bar">
							<div className="progress-fill" style={{ width: `${progress}%` }}></div>
						</div>
						<p className="progress-text">{progressText}</p>
					</div>
				)}

				{/* Preview Grid */}
				{pagePreviews.length > 0 && (
					<div className="preview-section">
						<h3>Preview</h3>
						<div className="preview-grid">
							{pagePreviews.map((preview, index) => (
								<div key={index} className="preview-item">
									<img src={preview} alt={`Page ${index + 1}`} />
									<span className="preview-label">Page {index + 1}</span>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Download Button */}
				{pdfBlob && (
					<button className="download-btn" onClick={downloadPDF}>
						<svg className="download-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="7 10 12 15 17 10" />
							<line x1="12" y1="15" x2="12" y2="3" />
						</svg>
						Download PDF
					</button>
				)}
			</div>
		</div>
	);
}

export default App;

# PDF Professional Suite

## 100+ Professional PDF Tools

### Features:
- 🔄 PDF Conversions (Word, Excel, PowerPoint, Images, HTML, Text)
- 📂 File Management (Merge, Split, Extract, Delete)
- ⚡ Optimization (Compress, Grayscale, Remove Metadata)
- ✏️ Editing (Watermark, Page Numbers, Crop)
- 🔒 Security (Encrypt, Decrypt, Digital Signatures)
- 📊 Data Extraction (Text, Images, Page Count)
- 📌 Barcode & QR Code Reader/Generator

### Deployment on Railway:
1. Push this repository to GitHub
2. Connect Railway to your GitHub repo
3. Railway will automatically deploy using the Procfile

### API Endpoints:
- `POST /api/:endpoint` - Process single file
- `POST /api/pdf/merge` - Merge multiple files
- `GET /health` - Health check

### Environment Variables:
- `PORT` - Server port (default: 3000)

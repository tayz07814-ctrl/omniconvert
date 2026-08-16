export interface LandingPage {
  slug: string;
  title: string;
  description: string;
  from: string;
  to: string;
  intro: string;
  benefits: string[];
  steps: string[];
  faq: { question: string; answer: string }[];
}

export const landingPages: LandingPage[] = [
  {
    slug: 'online-file-converter',
    title: 'Online File Converter — Private and Free',
    description: 'Convert video, audio, images and documents online without uploading your files.',
    from: 'Any supported file', to: 'A format that works for you',
    intro: 'OmniConvert is a fast online file converter for everyday media and document tasks. Unlike upload-first converters, it processes supported files in your browser so your originals stay on your device.',
    benefits: ['No account or upload queue', 'Works with video, audio, images, PDF and common office formats', 'Batch conversion with immediate downloads', 'Open-source browser technologies and clear privacy information'],
    steps: ['Choose one or more files from your device.', 'Select a compatible output format for each file.', 'Convert locally and download your results.'],
    faq: [
      { question: 'Does OmniConvert upload my files?', answer: 'No. Conversion runs inside your browser. The application does not send selected file contents to an OmniConvert upload server.' },
      { question: 'Is the converter free?', answer: 'Yes. There is no account requirement or conversion subscription.' },
    ],
  },
  {
    slug: 'jpg-to-png', title: 'JPG to PNG Converter', description: 'Convert JPG and JPEG images to PNG privately in your browser.', from: 'JPG / JPEG', to: 'PNG',
    intro: 'Convert JPG photos to PNG when you need lossless output, transparency-friendly workflows or a format supported by a design tool. Your image is decoded and encoded locally.',
    benefits: ['Private browser processing', 'No signup or file-size queue', 'Batch image conversion', 'Download immediately after conversion'],
    steps: ['Add JPG or JPEG images.', 'Choose PNG as the output.', 'Click Convert and download the PNG files.'],
    faq: [{ question: 'Does JPG to PNG restore lost quality?', answer: 'No. PNG preserves the pixels it receives, but converting a compressed JPG cannot recover detail that was already discarded.' }],
  },
  {
    slug: 'png-to-jpg', title: 'PNG to JPG Converter', description: 'Convert PNG images to compact JPG files securely and quickly.', from: 'PNG', to: 'JPG',
    intro: 'PNG is excellent for graphics, but JPG is often smaller for photographs and website images. OmniConvert converts PNG images in the browser and lets you download the result without an upload step.',
    benefits: ['Smaller photo files for sharing', 'Local processing for private images', 'Simple quality-preserving browser export', 'Supports multiple files'],
    steps: ['Drop PNG files into the converter.', 'Select JPG.', 'Convert, then download your images.'],
    faq: [{ question: 'Will transparent PNG backgrounds stay transparent?', answer: 'JPG does not support transparency. Transparent areas are rendered against the browser canvas background during conversion.' }],
  },
  {
    slug: 'heic-to-jpg', title: 'HEIC to JPG Converter', description: 'Convert iPhone HEIC photos to JPG locally without uploading private pictures.', from: 'HEIC / HEIF', to: 'JPG',
    intro: 'HEIC is efficient but not supported everywhere. Convert iPhone and Apple HEIC photos to widely compatible JPG files directly in your browser. Private photos remain on your device during conversion.',
    benefits: ['Useful for sharing with Windows and web apps', 'No cloud photo upload', 'Batch-friendly workflow', 'Download standard JPG files'],
    steps: ['Select HEIC or HEIF photos.', 'Choose JPG.', 'Convert and save the compatible images.'],
    faq: [{ question: 'Are HEIC files stored online?', answer: 'No. The HEIC decoder runs in your browser and the selected photo is not uploaded by OmniConvert.' }],
  },
  {
    slug: 'pdf-to-jpg', title: 'PDF to JPG Converter', description: 'Convert PDF pages to JPG images in your browser. Multi-page PDFs download as a ZIP.', from: 'PDF', to: 'JPG images',
    intro: 'Turn PDF pages into JPG images for presentations, previews, social posts or easy sharing. Each page is rendered locally; multi-page results are packaged into a convenient ZIP download.',
    benefits: ['Page-by-page JPG rendering', 'Multi-page ZIP output', 'No server upload', 'Useful on desktop and mobile browsers'],
    steps: ['Choose a PDF.', 'Select JPG.', 'Convert and download one image or a ZIP of pages.'],
    faq: [{ question: 'Can I convert a scanned PDF?', answer: 'Yes, pages can be rendered as images. This does not perform OCR or create editable text.' }],
  },
  {
    slug: 'mp4-to-mp3', title: 'MP4 to MP3 Converter', description: 'Extract audio from MP4 video as an MP3 file locally with FFmpeg WebAssembly.', from: 'MP4 video', to: 'MP3 audio',
    intro: 'Extract the audio track from an MP4 video for listening, editing or archiving. FFmpeg WebAssembly performs the conversion in your browser; the first conversion may take longer while the engine loads.',
    benefits: ['Audio extraction without a cloud upload', 'Adjustable browser-side encoding path', 'Works with batches one at a time', 'Immediate MP3 download'],
    steps: ['Add an MP4 video with an audio track.', 'Select MP3.', 'Wait for the local engine and download the result.'],
    faq: [{ question: 'Why does MP4 to MP3 take time to start?', answer: 'The FFmpeg WebAssembly engine is downloaded and initialized on first use. It is reused while the page remains open.' }],
  },
  {
    slug: 'video-converter', title: 'Online Video Converter', description: 'Convert MP4, WebM, MOV, AVI, MKV and M4V video files privately in your browser.', from: 'Video', to: 'MP4, WebM, MOV and more',
    intro: 'Convert popular video containers and extract audio without sending your footage to a conversion service. OmniConvert uses FFmpeg WebAssembly and keeps the selected media in browser memory.',
    benefits: ['MP4, WebM, MOV, AVI, MKV and M4V support', 'Video-to-audio extraction', 'No account or upload queue', 'Clear progress and downloadable results'],
    steps: ['Choose a supported video.', 'Select the output container or audio format.', 'Start conversion and download when complete.'],
    faq: [{ question: 'Does the video leave my device?', answer: 'No. The conversion happens locally in the browser. Very large files still require sufficient device memory.' }],
  },
  {
    slug: 'pdf-to-word', title: 'PDF to Word Converter', description: 'Convert PDF text into an editable DOCX document locally in your browser.', from: 'PDF', to: 'DOCX',
    intro: 'Create a simple editable Word document from text-based PDFs without uploading the document. OmniConvert extracts readable text and creates a new DOCX file locally.',
    benefits: ['Private text extraction', 'No account or cloud queue', 'Useful for text-based PDFs', 'Download a standard DOCX file'],
    steps: ['Add a text-based PDF.', 'Select Word (DOCX).', 'Convert and download the generated document.'],
    faq: [{ question: 'Does PDF to Word preserve the original layout?', answer: 'This browser tool focuses on readable text. Complex layouts, images, tables and scanned pages may not be reproduced exactly.' }],
  },
];

export interface Article {
  slug: string;
  title: string;
  description: string;
  category: string;
  updated: string;
  sections: { heading: string; paragraphs: string[] }[];
}

export const articles: Article[] = [
  {
    slug: 'how-to-convert-files-online-safely',
    title: 'How to Convert Files Online Safely and Privately',
    description: 'Learn how browser-based file conversion works, what to check before using an online converter and why local processing protects sensitive files.',
    category: 'Privacy', updated: '2026-08-16',
    sections: [
      { heading: 'The upload problem', paragraphs: ['Many online converters require you to upload a file to a remote server. That can be convenient, but it creates another copy to protect, another transfer to trust and another retention policy to understand. Sensitive documents, personal photos and unpublished videos deserve a more private default.'] },
      { heading: 'How local conversion works', paragraphs: ['OmniConvert uses browser technologies such as Canvas, pdf.js, pdf-lib, JSZip and FFmpeg WebAssembly. The browser downloads the application and, when needed, the conversion engine; the selected file is read by the device and the output is created locally.'] },
      { heading: 'A safer conversion checklist', paragraphs: ['Check whether a service explains where files go, how long they are retained and whether an account is required. Prefer tools that process files locally, use HTTPS, explain third-party resources and let you download or delete results immediately.'] },
      { heading: 'What local processing does not mean', paragraphs: ['Local processing does not make every device secure. Use an updated browser, avoid converting confidential files on shared devices and remember that browser extensions, malware and operating-system access can still affect privacy.'] },
    ],
  },
  {
    slug: 'convert-video-to-mp4',
    title: 'How to Convert a Video to MP4',
    description: 'A practical guide to converting WebM, MOV, AVI or MKV video to MP4 in a browser without uploading the footage.',
    category: 'Video', updated: '2026-08-16',
    sections: [
      { heading: 'Why choose MP4?', paragraphs: ['MP4 with H.264 video and AAC audio is widely supported by phones, browsers, messaging apps and editing software. It is often the best compatibility choice when a video will be shared across different devices.'] },
      { heading: 'Convert the video locally', paragraphs: ['Open OmniConvert, choose the video, select MP4 and start conversion. The first run loads FFmpeg WebAssembly. Keep the tab open and avoid closing the browser until the download is ready.'] },
      { heading: 'Troubleshooting', paragraphs: ['If conversion fails, confirm the file has a valid video stream, try a smaller file and use a current browser. Large conversions can require substantial memory, particularly on mobile devices.'] },
    ],
  },
  {
    slug: 'convert-heic-photos-to-jpg',
    title: 'How to Convert HEIC Photos to JPG',
    description: 'Convert iPhone HEIC and HEIF images to JPG for Windows, websites and apps that do not support Apple photo formats.',
    category: 'Images', updated: '2026-08-16',
    sections: [
      { heading: 'Why HEIC is difficult to share', paragraphs: ['HEIC saves space and preserves image quality, but some websites and older devices only accept JPG or PNG. Converting a copy gives you compatibility while leaving the original photo untouched.'] },
      { heading: 'Steps', paragraphs: ['Add HEIC photos to OmniConvert, choose JPG and convert. The HEIC decoder runs in the browser. The result is downloaded to your device and the original remains unchanged.'] },
      { heading: 'Quality tips', paragraphs: ['Keep the original HEIC for archiving. Use JPG for broad compatibility, and use PNG when you need lossless graphics rather than photographic compression.'] },
    ],
  },
  {
    slug: 'convert-pdf-to-images',
    title: 'How to Convert PDF Pages to JPG or PNG',
    description: 'Turn PDF pages into image files for previews, presentations and sharing, with a private browser-based workflow.',
    category: 'Documents', updated: '2026-08-16',
    sections: [
      { heading: 'When PDF-to-image conversion helps', paragraphs: ['Images are convenient for previews, thumbnails and apps that do not accept PDF. Rendering each page also makes it easy to share a single page without sending the entire document.'] },
      { heading: 'Choose JPG or PNG', paragraphs: ['JPG is a compact choice for photographs and ordinary document previews. PNG is better for sharp text, diagrams and graphics where you want lossless output.'] },
      { heading: 'Multi-page PDFs', paragraphs: ['OmniConvert renders each page locally. When there are multiple pages, the images are packaged into a ZIP so you can download them together.'] },
    ],
  },
  {
    slug: 'convert-mp4-to-mp3',
    title: 'How to Extract Audio from MP4 as MP3',
    description: 'Learn how to extract audio from a video privately and download an MP3 without sending the source file to a server.',
    category: 'Audio', updated: '2026-08-16',
    sections: [
      { heading: 'Common uses', paragraphs: ['Extracting audio can be useful for a lecture, interview, personal recording or video you have permission to process. Always respect copyright and the rights of the original creator.'] },
      { heading: 'Browser conversion', paragraphs: ['Add the MP4, choose MP3 and let the local FFmpeg engine process the media. The audio stream is encoded in the browser and the result is offered as a download.'] },
      { heading: 'Choosing quality', paragraphs: ['MP3 at a moderate bitrate is convenient for sharing. For archival or editing work, consider a lossless format such as FLAC when it is available from the source.'] },
    ],
  },
  {
    slug: 'video-conversion-not-working',
    title: 'Video Conversion Not Working? Troubleshooting Guide',
    description: 'Fix common browser video conversion problems, including stuck progress, unsupported codecs, large files and failed downloads.',
    category: 'Troubleshooting', updated: '2026-08-16',
    sections: [
      { heading: 'Give the browser enough resources', paragraphs: ['Browser video conversion uses memory and CPU. Close heavy tabs, use a current browser and try a shorter or smaller copy of the video if a mobile device runs out of memory.'] },
      { heading: 'Check the source file', paragraphs: ['A file extension does not guarantee a valid stream. Try playing the source locally first. Videos with unusual codecs, DRM or damaged metadata may not be readable by the browser engine.'] },
      { heading: 'When progress appears stuck', paragraphs: ['The first video conversion downloads and initializes FFmpeg WebAssembly. Keep the tab open, check your connection and wait for the engine to finish loading. A refreshed page may need to download it again.'] },
      { heading: 'Privacy-first fallback', paragraphs: ['If a file is too large for browser processing, use a trusted desktop converter on a device you control. OmniConvert does not require you to upload a private video to troubleshoot it.'] },
    ],
  },
];

import { useState, useRef, useCallback } from 'react';

import { useTheme } from './hooks/useTheme';
import { StoryCanvas } from './components/layout/StoryCanvas';
import { BackgroundTab } from './components/tabs/BackgroundTab';
import { TextTab } from './components/tabs/TextTab';
import { ImagesTab } from './components/tabs/ImagesTab';
import { ExportPanel } from './components/tabs/ExportPanel';
import { IconSidebar } from './components/layout/IconSidebar';
import { VisualTextEditor } from './components/visual-editor';
import { VisualImageEditor } from './components/visual-editor';
import { TextElement, BackgroundSettings, Tab, ExportFormat, ImageElement } from './lib/types';

function App() {
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('background');
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [backgroundSettings, setBackgroundSettings] = useState<BackgroundSettings>({
    type: 'fit',
    solidColor: '#000000',
    gradientStart: '#667eea',
    gradientEnd: '#764ba2',
    gradientAngle: 45,
    blurMode: 'fit',
  });
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [imageElements, setImageElements] = useState<ImageElement[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleAddText = useCallback(() => {
    const newText: TextElement = {
      id: Date.now().toString(),
      text: 'New Text',
      x: 540,
      y: 960,
      size: 700,
      fontSize: 60,
      fontFamily: 'Arial',
      color: '#ffffff',
      rotation: 0,
      outlineWidth: 0,
      outlineColor: '#000000',
    };
    setTextElements(prev => [...prev, newText]);
    setSelectedTextId(newText.id);
  }, []);

  const handleAddImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const probe = new Image();
      probe.onload = () => {
        const maxInitW = 600;
        const maxInitH = 600;
        const scale = Math.min(maxInitW / probe.naturalWidth, maxInitH / probe.naturalHeight, 1);
        const initW = Math.max(10, Math.round(probe.naturalWidth * scale));
        const initH = Math.max(10, Math.round(probe.naturalHeight * scale));
        const newImage: ImageElement = {
          id: Date.now().toString(),
          src,
          x: 540,
          y: 960,
          width: initW,
          height: initH,
          rotation: 0,
          cornerStyle: 'rounded',
          borderRadius: Math.round(Math.min(initW, initH) / 10),
          outlineWidth: 0,
          outlineColor: '#000000',
          brightness: 1,
          contrast: 1,
          blur: 0,
          mirrorH: false,
          mirrorV: false,
          filter: 'normal',
        };
        setImageElements(prev => [...prev, newImage]);
        setSelectedImageId(newImage.id);
      };
      probe.src = src;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleUpdateImage = useCallback((id: string, updates: Partial<ImageElement>) => {
    setImageElements(prev => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  }, []);

  const handleDeleteImage = useCallback((id: string) => {
    setImageElements(prev => prev.filter((i) => i.id !== id));
    setSelectedImageId(prev => (prev === id ? null : prev));
  }, []);

  const handleUpdateText = useCallback((id: string, updates: Partial<TextElement>) => {
    setTextElements(prev => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const handleDeleteText = useCallback((id: string) => {
    setTextElements(prev => prev.filter((t) => t.id !== id));
    setSelectedTextId(prev => prev === id ? null : prev);
  }, []);

  const handleExport = useCallback((format: ExportFormat) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mimeTypes = {
      jpg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
    };

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `story.${format}`;
        a.click();
        URL.revokeObjectURL(url);
      },
      mimeTypes[format],
      0.95
    );
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-dark-950 flex">
      <IconSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 bg-gray-50 dark:bg-dark-900 relative">
          <StoryCanvas
            image={image}
            backgroundSettings={backgroundSettings}
            textElements={textElements}
            imageElements={imageElements}
            canvasRef={canvasRef}
          />

          {/* Visual editors */}
          {activeTab === 'text' && textElements.length > 0 && (
            <VisualTextEditor
              textElements={textElements}
              selectedTextId={selectedTextId}
              onSelectText={setSelectedTextId}
              onUpdateText={handleUpdateText}
              canvasRef={canvasRef}
              canvasWidth={1080}
              canvasHeight={1920}
            />
          )}

          {activeTab === 'images' && imageElements.length > 0 && (
            <VisualImageEditor
              imageElements={imageElements}
              selectedImageId={selectedImageId}
              onSelectImage={setSelectedImageId}
              onUpdateImage={handleUpdateImage}
              canvasRef={canvasRef}
              canvasWidth={1080}
              canvasHeight={1920}
            />
          )}
        </div>

        <aside className="w-96 bg-white dark:bg-dark-950 border-l border-gray-200 dark:border-dark-800 shadow-xl flex flex-col max-h-screen">
          <div className="p-6 overflow-y-auto flex-1">
            {activeTab === 'background' && (
              <BackgroundTab
                onImageUpload={handleImageUpload}
                backgroundSettings={backgroundSettings}
                onBackgroundChange={setBackgroundSettings}
                hasImage={!!image}
              />
            )}

            {activeTab === 'text' && (
              <TextTab
                textElements={textElements}
                selectedTextId={selectedTextId}
                onAddText={handleAddText}
                onSelectText={setSelectedTextId}
                onUpdateText={handleUpdateText}
                onDeleteText={handleDeleteText}
              />
            )}

            {activeTab === 'images' && (
              <ImagesTab
                imageElements={imageElements}
                selectedImageId={selectedImageId}
                onAddImage={handleAddImage}
                onSelectImage={setSelectedImageId}
                onUpdateImage={handleUpdateImage}
                onDeleteImage={handleDeleteImage}
              />
            )}

            {activeTab === 'export' && (
              <ExportPanel onExport={handleExport} disabled={!image} />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;

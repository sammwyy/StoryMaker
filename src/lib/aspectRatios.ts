import { AspectRatio } from './types';

export const PREDEFINED_ASPECT_RATIOS: AspectRatio[] = [
    // Social Media
    {
        id: 'instagram-story',
        name: 'Instagram Story',
        width: 1080,
        height: 1920,
        ratio: '9:16',
        icon: 'Smartphone',
        category: 'social'
    },
    {
        id: 'instagram-post',
        name: 'Instagram Post',
        width: 1080,
        height: 1080,
        ratio: '1:1',
        icon: 'Image',
        category: 'social'
    },
    {
        id: 'instagram-reel',
        name: 'Instagram Reel',
        width: 1080,
        height: 1920,
        ratio: '9:16',
        icon: 'Video',
        category: 'social'
    },
    {
        id: 'facebook-post',
        name: 'Facebook Post',
        width: 1200,
        height: 630,
        ratio: '1.91:1',
        icon: 'Users',
        category: 'social'
    },
    {
        id: 'twitter-post',
        name: 'Twitter Post',
        width: 1200,
        height: 675,
        ratio: '16:9',
        icon: 'MessageCircle',
        category: 'social'
    },
    {
        id: 'linkedin-post',
        name: 'LinkedIn Post',
        width: 1200,
        height: 627,
        ratio: '1.91:1',
        icon: 'Briefcase',
        category: 'social'
    },
    {
        id: 'tiktok',
        name: 'TikTok',
        width: 1080,
        height: 1920,
        ratio: '9:16',
        icon: 'Music',
        category: 'social'
    },
    {
        id: 'youtube-thumbnail',
        name: 'YouTube Thumbnail',
        width: 1280,
        height: 720,
        ratio: '16:9',
        icon: 'Play',
        category: 'social'
    },

    // Video Formats
    {
        id: 'youtube-video',
        name: 'YouTube Video',
        width: 1920,
        height: 1080,
        ratio: '16:9',
        icon: 'Monitor',
        category: 'video'
    },
    {
        id: 'youtube-shorts',
        name: 'YouTube Shorts',
        width: 1080,
        height: 1920,
        ratio: '9:16',
        icon: 'Zap',
        category: 'video'
    },
    {
        id: 'cinema-21-9',
        name: 'Cinema 21:9',
        width: 2560,
        height: 1080,
        ratio: '21:9',
        icon: 'Film',
        category: 'video'
    },
    {
        id: 'cinema-4-3',
        name: 'Cinema 4:3',
        width: 1440,
        height: 1080,
        ratio: '4:3',
        icon: 'Tv',
        category: 'video'
    },

    // Photo Formats
    {
        id: 'photo-square',
        name: 'Square Photo',
        width: 1080,
        height: 1080,
        ratio: '1:1',
        icon: 'Square',
        category: 'photo'
    },
    {
        id: 'photo-portrait',
        name: 'Portrait Photo',
        width: 1080,
        height: 1350,
        ratio: '4:5',
        icon: 'Camera',
        category: 'photo'
    },
    {
        id: 'photo-landscape',
        name: 'Landscape Photo',
        width: 1920,
        height: 1080,
        ratio: '16:9',
        icon: 'Image',
        category: 'photo'
    },
    {
        id: 'photo-classic',
        name: 'Classic Photo',
        width: 1200,
        height: 800,
        ratio: '3:2',
        icon: 'Camera',
        category: 'photo'
    },

    // Custom
    {
        id: 'custom',
        name: 'Custom',
        width: 1080,
        height: 1920,
        ratio: 'Custom',
        icon: 'Settings',
        category: 'custom'
    }
];

export const getAspectRatioById = (id: string): AspectRatio | undefined => {
    return PREDEFINED_ASPECT_RATIOS.find(ratio => ratio.id === id);
};

export const getAspectRatiosByCategory = (category: AspectRatio['category']): AspectRatio[] => {
    return PREDEFINED_ASPECT_RATIOS.filter(ratio => ratio.category === category);
};

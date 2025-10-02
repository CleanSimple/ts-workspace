export async function convertImageToJpg(blob: Blob): Promise<Blob | null> {
    return new Promise((resolve, reject) => {
        const imageUrl = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(imageUrl);

            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
                canvas.toBlob(resolve, 'image/jpg', 1);
            }
            else {
                reject(new Error('Failed to get 2d canvas context'));
            }
        };
        img.src = imageUrl;
    });
}

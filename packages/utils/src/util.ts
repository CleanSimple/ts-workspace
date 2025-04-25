export function hasKey<T extends object>(obj: T, key: PropertyKey): key is keyof T {
    return key in obj;
}

export function fail(error: Error): never {
    throw error;
}

export function rndInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function base64Encode(string: string): string {
    const bytes = new TextEncoder().encode(string);
    const binaryString = Array.from(bytes)
        .map(byte => String.fromCharCode(byte))
        .join('');
    return window.btoa(binaryString);
}

export function downloadFile(filename: string, textContent: string, mimeType: string): void {
    const elem = document.createElement('a');
    elem.href = `data:${mimeType};base64,` + base64Encode(textContent);
    elem.download = filename;
    elem.style.display = 'none';

    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
}

export async function fileSelect(accept = '', multiple = false): Promise<FileList | null> {
    return new Promise((resolve) => {
        const input = document.createElement('input');

        input.type = 'file';
        input.accept = accept;
        input.multiple = multiple;

        const onFileSelect = () => {
            window.removeEventListener('focus', onFileSelect);
            setTimeout(() => {
                resolve(input.files);
            }, 1000);
        };
        window.addEventListener('focus', onFileSelect);
        input.click();
    });
}

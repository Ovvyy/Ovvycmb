use anyhow::Result;
use image::{DynamicImage, ImageBuffer, Rgba};
use ovvy_core::game::WindowBounds;
use tracing::debug;

pub struct ScreenCapture;

impl ScreenCapture {
    pub async fn capture_window(hwnd: isize) -> Result<DynamicImage> {
        #[cfg(target_os = "windows")]
        {
            tokio::task::spawn_blocking(move || windows_capture(hwnd)).await?
        }
        #[cfg(not(target_os = "windows"))]
        {
            Err(anyhow::anyhow!("Screen capture not available on this platform"))
        }
    }

    pub async fn capture_region(bounds: WindowBounds) -> Result<DynamicImage> {
        #[cfg(target_os = "windows")]
        {
            tokio::task::spawn_blocking(move || windows_capture_region(bounds)).await?
        }
        #[cfg(not(target_os = "windows"))]
        {
            Err(anyhow::anyhow!("Screen capture not available on this platform"))
        }
    }
}

#[cfg(target_os = "windows")]
fn windows_capture(hwnd: isize) -> Result<DynamicImage> {
    use windows::Win32::Foundation::HWND;
    use windows::Win32::Graphics::Gdi::{
        BitBlt, CreateCompatibleBitmap, CreateCompatibleDC, DeleteDC, DeleteObject,
        GetDC, ReleaseDC, SelectObject, SRCCOPY,
    };
    use windows::Win32::UI::WindowsAndMessaging::GetClientRect;
    use windows::Win32::Foundation::RECT;

    unsafe {
        let hwnd = HWND(hwnd as *mut _);
        let hdc = GetDC(hwnd);
        let mut rect = RECT::default();
        GetClientRect(hwnd, &mut rect)?;

        let width = (rect.right - rect.left) as u32;
        let height = (rect.bottom - rect.top) as u32;

        if width == 0 || height == 0 {
            ReleaseDC(hwnd, hdc);
            return Err(anyhow::anyhow!("Window has zero size"));
        }

        let mem_dc = CreateCompatibleDC(hdc);
        let bitmap = CreateCompatibleBitmap(hdc, width as i32, height as i32);
        let old_bitmap = SelectObject(mem_dc, bitmap);

        BitBlt(mem_dc, 0, 0, width as i32, height as i32, hdc, 0, 0, SRCCOPY)?;

        // Read pixel data
        let mut pixels = vec![0u8; (width * height * 4) as usize];
        use windows::Win32::Graphics::Gdi::{GetDIBits, BITMAPINFOHEADER, BI_RGB, DIB_RGB_COLORS, BITMAPINFO};

        let mut bmi = BITMAPINFO {
            bmiHeader: BITMAPINFOHEADER {
                biSize: std::mem::size_of::<BITMAPINFOHEADER>() as u32,
                biWidth: width as i32,
                biHeight: -(height as i32),
                biPlanes: 1,
                biBitCount: 32,
                biCompression: BI_RGB.0,
                ..Default::default()
            },
            ..Default::default()
        };

        GetDIBits(mem_dc, bitmap, 0, height, Some(pixels.as_mut_ptr() as *mut _), &mut bmi, DIB_RGB_COLORS);

        SelectObject(mem_dc, old_bitmap);
        DeleteObject(bitmap);
        DeleteDC(mem_dc);
        ReleaseDC(hwnd, hdc);

        // Convert BGRA to RGBA
        for chunk in pixels.chunks_mut(4) {
            chunk.swap(0, 2);
        }

        let img: ImageBuffer<Rgba<u8>, Vec<u8>> =
            ImageBuffer::from_raw(width, height, pixels)
                .ok_or_else(|| anyhow::anyhow!("Failed to create image buffer"))?;

        debug!("Captured window {}x{}", width, height);
        Ok(DynamicImage::ImageRgba8(img))
    }
}

#[cfg(target_os = "windows")]
fn windows_capture_region(bounds: WindowBounds) -> Result<DynamicImage> {
    use windows::Win32::Graphics::Gdi::{
        BitBlt, CreateCompatibleBitmap, CreateCompatibleDC, DeleteDC, DeleteObject,
        GetDC, ReleaseDC, SelectObject, SRCCOPY,
    };
    use windows::Win32::Foundation::HWND;

    unsafe {
        let hdc = GetDC(HWND::default());
        let mem_dc = CreateCompatibleDC(hdc);
        let bitmap = CreateCompatibleBitmap(hdc, bounds.width as i32, bounds.height as i32);
        let old_bitmap = SelectObject(mem_dc, bitmap);

        BitBlt(
            mem_dc, 0, 0, bounds.width as i32, bounds.height as i32,
            hdc, bounds.x, bounds.y, SRCCOPY,
        )?;

        // Read pixels (same as above)
        let mut pixels = vec![0u8; (bounds.width * bounds.height * 4) as usize];

        SelectObject(mem_dc, old_bitmap);
        DeleteObject(bitmap);
        DeleteDC(mem_dc);
        ReleaseDC(HWND::default(), hdc);

        for chunk in pixels.chunks_mut(4) {
            chunk.swap(0, 2);
        }

        let img: ImageBuffer<Rgba<u8>, Vec<u8>> =
            ImageBuffer::from_raw(bounds.width, bounds.height, pixels)
                .ok_or_else(|| anyhow::anyhow!("Failed to create image buffer"))?;

        Ok(DynamicImage::ImageRgba8(img))
    }
}

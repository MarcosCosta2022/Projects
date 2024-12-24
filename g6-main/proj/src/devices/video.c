#include <lcom/lcf.h>
#include <lcom/lab5.h>
#include <stdint.h>
#include <stdio.h>

// Any header files included below this line should have been created by you

#include "video.h"

static char *video_mem;		/* Process (virtual) address to which VRAM is mapped */
static char *double_buffer; /* Process (virtual) address to which double buffer is mapped */

static unsigned h_res;	        /* Horizontal resolution in pixels */
static unsigned v_res;	        /* Vertical resolution in pixels */
static unsigned bits_per_pixel; /* Number of VRAM bits per pixel */

static vbe_mode_info_t vmi;

int(video_get_mode_info)(uint16_t mode, vbe_mode_info_t *vmi_p){
    reg86_t r86;
    memset(&r86, 0, sizeof(r86));
    r86.intno = INT; /* BIOS video services */
    r86.ah = AH_VBE;
    r86.al = GET_VBE_MODE_INFO;
    r86.cx = mode;
    r86.es = PB2BASE((uint64_t) &vmi_p); // probably wrong
    r86.di = PB2OFF((uint64_t) &vmi_p);

    if (sys_int86(&r86) != OK) {
        printf("\tvg_exit(): sys_int86() failed \n");
        return 1;
    }
    return 0;
}

int (video_map_phys_mem)(uint16_t mode){
    vbe_mode_info_t vmi_p;
    if (vbe_get_mode_info(mode, &vmi_p)!= OK)return 1;
    h_res = vmi_p.XResolution;
    v_res = vmi_p.YResolution;
    bits_per_pixel = vmi_p.BitsPerPixel;
    vmi = vmi_p;

    struct minix_mem_range mr;
    int r;

    phys_bytes base = vmi_p.PhysBasePtr;
    unsigned int size = h_res * v_res * (vmi.BytesPerScanLine / vmi.XResolution);
    
    /* Allow memory mapping */
    mr.mr_base = base;
    mr.mr_limit = base + size;

    if( OK != (r = sys_privctl(SELF, SYS_PRIV_ADD_MEM, &mr)))
        panic("sys_privctl (ADD_MEM) failed: %d\n", r);

    /* Map memory */
    video_mem = vm_map_phys(SELF, (void *)mr.mr_base, size);
    double_buffer = malloc(size);

    if(video_mem == MAP_FAILED)
        panic("couldn't map video memory");

    return 0;
}

int update_screen(){
    memcpy(video_mem, double_buffer, h_res * v_res * (vmi.BytesPerScanLine / vmi.XResolution));
    return 0;
}

int (video_change_mode)(uint16_t mode){
    reg86_t r86;
    memset(&r86, 0, sizeof(r86));	/* zero the structure */

    r86.intno = INT; /* BIOS video services */
    r86.ah = AH_VBE;    /* Set Video Mode function */
    r86.al = SET_VBE_MODE;    /* 80x25 text mode */
    r86.bx = mode | BIT(14); /* set bit 14: linear framebuffer */

    if( sys_int86(&r86) != OK ) {
        printf("\tvg_exit(): sys_int86() failed \n");
        return 1;
    }
    return 0; 
}

void* (vg_init)(uint16_t mode){
    if (video_change_mode(mode) != OK)
        return NULL;
    if (video_map_phys_mem(mode) != OK)
        return NULL;
    return video_mem;
}

int (vg_draw_hline)(uint16_t x, uint16_t y, uint16_t len, uint32_t color){
    for(int i = 0; i < len; i++){
        video_draw_pixel(x + i, y, color);
    }
    return 0;
}

int (vg_draw_rectangle)(uint16_t x, uint16_t y, uint16_t width, uint16_t height, uint32_t color){
    if (x >= h_res || y >= v_res ) return 1;
    if (x + width >= h_res) width = h_res - x;
    if (y + height >= v_res) height = v_res - y;
    for(int i = 0; i < height; i++){
        vg_draw_hline(x, y + i, width, color);
    }
    return 0;
}

int (video_exit)(void){
    free(double_buffer);

    reg86_t r86;
    memset(&r86, 0, sizeof(r86));	/* zero the structure */

    r86.intno = INT; /* BIOS video services */
    r86.ah = AH_CGA;    /* Set Video Mode function */
    r86.al = CGA_MODE;    /* 80x25 text mode */

    if( sys_int86(&r86) != OK ) {
        printf("\tvg_exit(): sys_int86() failed \n");
        return 1;
    }
    return 0;
}

void (video_draw_pixel)(uint16_t x, uint16_t y, uint32_t color){
    if (x >= h_res || y >= v_res || x < 0 || y < 0)
        return;
    char *pixel = (double_buffer + (y * h_res + x) * (vmi.BytesPerScanLine / vmi.XResolution));
    memcpy(pixel, &color, vmi.BytesPerScanLine / vmi.XResolution);
}



void vg_draw_character( xpm_image_t* font ,uint32_t char_index,uint32_t x,uint32_t y,uint32_t color,uint8_t scale){
    if (x >= h_res || y >= v_res )
        return;
    uint16_t ox = x;
    uint8_t bytes_per_pixel = font->size / (font->width * font->height);

    uint8_t char_width = 6;
    uint8_t char_height = 7;

    uint32_t chars_per_line = font->width / char_width;

    uint8_t* char_addr = font->bytes + (char_index/chars_per_line)*(font->width*bytes_per_pixel*char_height) + (char_index%chars_per_line)*char_width*bytes_per_pixel;


    for (int i = 0; i < char_height; i++) {
        for (int j = 0; j < char_width; j++) {
            uint32_t pixel_color = 0;
            memcpy(&pixel_color, char_addr + (i * font->width + j) * bytes_per_pixel, bytes_per_pixel);
            if (pixel_color <= 0x00ffffff) {
                for (int k = 0; k < scale; k++) {
                    for (int l = 0; l < scale; l++) {
                        video_draw_pixel(x + l, y + k, color);
                    }
                }
            }
            x += scale;
        }
        y += scale;
        x = ox;
    }
}

void (video_draw_xpm) (int x, int y,xpm_image_t* img){
    int width = img->width;
    int height = img->height;

    if (x>=(int)h_res || y>=(int)v_res || x + width < 0 || y + height < 0) return;

    uint64_t cnt = 0;
    uint16_t ox = x;
    uint8_t bpp = img->size / (img->width * img->height);
    for (int i = 0; i < height; i++) {
        for (int j = 0; j < width; j++) {
            uint32_t color = 0;
            memcpy(&color, img->bytes + (cnt*bpp), bpp);
            if (color <= 0x00ffffff) video_draw_pixel(x,y,color);
            x++;
            cnt++;
        }
        y++;
        x = ox;
    }
}

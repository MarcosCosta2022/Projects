#include <lcom/lcf.h>
#include <lcom/lab5.h>
#include <stdint.h>
#include <stdio.h>

// Any header files included below this line should have been created by you

#include "video.h"

static char *video_mem;		/* Process (virtual) address to which VRAM is mapped */

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

    if(video_mem == MAP_FAILED)
        panic("couldn't map video memory");

    return 0;
}

int (vbe_get_controller_info)( struct vg_vbe_contr_info* vci_p) {



    mmap_t lmblock;

	char* lmalloc_v = lm_alloc(sizeof(struct vg_vbe_contr_info), &lmblock);

	if(lmalloc_v == NULL) {
		printf("vga: vg_controller: failed to allocate block in low memory\n");
		return -1;
	}
    struct vg_vbe_contr_info* info_p = lmblock.virt;

    //clear the buffer
    memset(info_p, 0, sizeof(struct vg_vbe_contr_info));

    info_p->VBESignature[0] = 'V';
    info_p->VBESignature[1] = 'B';
    info_p->VBESignature[2] = 'E';
    info_p->VBESignature[3] = '2';
	
	//VBE Call function 00h - return mode info
	reg86_t r86;

	//Translate the buffer linear address to a far pointer
    r86.intno = INT; /* BIOS video services */
    r86.ah = AH_VBE;
    r86.al = GET_VBE_CONTROLLER_INFO;
	r86.es = PB2BASE(lmblock.phys);		//Physical address segment base
	r86.di = PB2OFF(lmblock.phys); 		//Physical address offset

	if(sys_int86(&r86) != OK) {
		printf("vga: vbe_get_controller_info: sys_int86() failed\n");
		return -1;
	}

    

	//Check function support in AL register
	if(r86.al != SUPPORTED_FUNC) {
		printf("vga: vbe_get_controller_info: function is not supported\n");
		return -1;
	}

	//Check function call status in AH register
	if(r86.ah != SUCCESS) {

		switch(r86.ah) {
		case FAIL:
			printf("vga: vbe_get_controller_info: function call failed\n");
			break;
		case UNSUPORTED_FUNC_IN_CURRENT_HW_CONFIG:
			printf("vga: vbe_get_controller_info: function call is not supported in current hardware configuration\n");
			break;
		case UNSUPORTED_FUNC_IN_CURRENT_VID_MODE:
			printf("vga: vbe_get_controller_info: function call invalid in current video mode\n");
			break;
		default:
			printf("vga: vbe_get_controller_info: unknown VBE function error\n");
			break;
		}

		return -1;
	}

    //Copy the buffer to the input struct
    memcpy(vci_p, info_p, sizeof(struct vg_vbe_contr_info));

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
    if (x >= h_res || y >= v_res)
        return 1;
    if (x + width >= h_res)
        width = h_res - x;
    if (y + height >= v_res)
        height = v_res - y;
    for(int i = 0; i < height; i++){
        vg_draw_hline(x, y + i, width, color);
    }
    return 0;
}

int (video_exit)(void){
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
    if (x >= h_res || y >= v_res)
        return;
    char *pixel = (video_mem + (y * h_res + x) * (vmi.BytesPerScanLine / vmi.XResolution));
    memcpy(pixel, &color, vmi.BytesPerScanLine / vmi.XResolution);
}

void (video_draw_pattern)(uint8_t no_rectangles, uint32_t first, uint8_t step){
    uint32_t color = first;
    uint32_t red = (first >> vmi.RedFieldPosition) & FIRST_N_BITS(vmi.RedMaskSize);
    uint32_t green = (first >> vmi.GreenFieldPosition) & FIRST_N_BITS(vmi.GreenMaskSize);
    uint32_t blue = (first >> vmi.BlueFieldPosition) & FIRST_N_BITS(vmi.BlueMaskSize);
    
    //printf("red_info: %d, %d\n", vmi.RedFieldPosition, vmi.RedMaskSize);
    //printf("green_info: %d, %d\n", vmi.GreenFieldPosition, vmi.GreenMaskSize);
    //printf("blue_info: %d, %d\n", vmi.BlueFieldPosition, vmi.BlueMaskSize);
    unsigned long rect_height = v_res / no_rectangles;
    unsigned long rect_width = h_res / no_rectangles;
    for (int r = 0; r< no_rectangles; r++){
        for (int c = 0; c < no_rectangles;c++){
            vg_draw_rectangle(c*rect_width, r*rect_height, rect_width, rect_height, color);
            if (bits_per_pixel > 8){
                //printf("red:0x%x, green:0x%x, blue:0x%x\n", red, green, blue);
                //printf("color:0x%x\n", color);
                red = (red + step) % (1 << vmi.RedMaskSize);
                green = (green + step) % (1 << vmi.GreenMaskSize);
                blue = (blue + step) % (1 << vmi.BlueMaskSize);
                color = (red << vmi.RedFieldPosition) | (green << vmi.GreenFieldPosition) | (blue << vmi.BlueFieldPosition);
            }
            else  {
                color += step;
            }
        }
    }
}

void (video_draw_xpm) (uint16_t x, uint16_t y,xpm_image_t* img){
    uint16_t width = img->width;
    uint16_t height = img->height;
    if (y + height > v_res)
        height = v_res - y;
    if (x + width > h_res)
        width = h_res - x;

    uint64_t cnt = 0;
    uint16_t ox = x;
    uint8_t bpp = img->size / (height * width);
    for (int i = 0; i < height; i++) {
        for (int j = 0; j < width; j++) {
            uint32_t color = 0;
            memcpy(&color, img->bytes + (cnt*bpp), bpp);
            if (color < 0x40) video_draw_pixel(x,y,color);
            x++;
            cnt++;
        }
        y++;
        x = ox;
    }
    return ;
}



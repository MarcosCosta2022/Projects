#ifndef GRAPHICS_CARD_H_2023
#define GRAPHICS_CARD_H_2023


#include <stdint.h>
#include <lcom/lcf.h>

#include "VBE2_0.h"


int(video_get_mode_info)(uint16_t mode, vbe_mode_info_t *vmi_p);

int (video_map_phys_mem)(uint16_t mode);

int (video_change_mode)(uint16_t mode);

void (video_draw_pixel)(uint16_t x, uint16_t y, uint32_t color);

void (video_draw_pattern)(uint8_t no_rectangles, uint32_t first, uint8_t step);

void (video_draw_xpm) (uint16_t x, uint16_t y,xpm_image_t* img);

int (video_exit)(void);

int (vbe_get_controller_info)(struct vg_vbe_contr_info* vci_p);

#endif

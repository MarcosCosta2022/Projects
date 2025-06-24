#ifndef GRAPHICS_CARD_H_2023
#define GRAPHICS_CARD_H_2023


#include <stdint.h>
#include <lcom/lcf.h>
#include "VBE2_0.h"

/**
 * @brief Gets the mode info of the video card mode
 * @param mode mode to get info from
 * @param vmi_p pointer to the struct where the info will be stored
 * @return 0 if successful, 1 otherwise
 */
int(video_get_mode_info)(uint16_t mode, vbe_mode_info_t *vmi_p);

/**
 * @brief Maps the physical memory to the virtual memory
 * @param mode mode to map
 * @return 0 if successful, 1 otherwise
 */
int (video_map_phys_mem)(uint16_t mode);

/**
 * @brief Updates the screen
 * @return 0 if successful, 1 otherwise
 */
int update_screen();

/**
 * @brief Changes the video mode
 * @param mode mode to change to
 * @return 0 if sucessful, 1 otherwise
 */
int (video_change_mode)(uint16_t mode);

/**
 * @brief Draws pixel
 * @param x x position
 * @param y y position
 * @param color color to draw in
 */
void (video_draw_pixel)(uint16_t x, uint16_t y, uint32_t color);

/**
 * @brief Draws a .xpm image
 * @param x x position
 * @param y y position
 * @param img image to draw
 */
void (video_draw_xpm) (int x, int y, xpm_image_t* img);

/**
 * @brief Exit video mode
 * @return 0 if successful, 1 otherwise
 */
int (video_exit)(void);

/**
 * @brief Draws a character
 * @param font Font to draw in
 * @param char_index Char being drawn
 * @param x x position
 * @param y y position
 * @param color Color to draw in
 * @param scale Size of the character
 */
void vg_draw_character( xpm_image_t* font ,uint32_t char_index,uint32_t x,uint32_t y,uint32_t color,uint8_t scale);


#endif

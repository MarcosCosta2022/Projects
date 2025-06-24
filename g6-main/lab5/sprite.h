#ifndef SPRITE_H
#define SPRITE_H

#include <lcom/lcf.h>

typedef struct {
    int x, y; // current position
    int xspeed, yspeed; // current speed
    xpm_image_t *img; // the pixmap
} Sprite;

/** Creates a new sprite from XPM "pic", with specified
* position (within the screen limits) and speed;
* Does not draw the sprite on the screen
* Returns NULL on invalid pixmap.
*/
Sprite *create_sprite( int x, int y,int xspeed, int yspeed , xpm_image_t *img);

void destroy_sprite(Sprite *sp);

void move_sprite(Sprite *sp);
void move_sprite_by(Sprite *sp, int x, int y);

#endif

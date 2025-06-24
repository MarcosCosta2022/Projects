#include "sprite.h"


Sprite *create_sprite( int x, int y,int xspeed, int yspeed , xpm_image_t *img) {
    //allocate space for the "object"
    Sprite *sp = (Sprite *) malloc (sizeof(Sprite));
    if( sp == NULL )
    return NULL;
    // read the sprite pixmap
    if (img == NULL) return NULL;
    if (img->bytes ==  NULL) return NULL;

    sp->img = img;
    sp->x = x; sp->y=y;
    sp->xspeed = xspeed; sp->yspeed = yspeed;
    return sp;
}

void destroy_sprite(Sprite *sp) {
    if( sp == NULL )
        return;
    free(sp);
    sp = NULL; // XXX: pointer is passed by value
               // should do this @ the caller
}

void move_sprite(Sprite *sp){
    if (sp == NULL) return;
    sp->x += sp->xspeed;
    sp->y += sp->yspeed;
}

void move_sprite_by(Sprite *sp, int x, int y){
    if (sp == NULL) return;
    sp->x += x;
    sp->y += y;
}


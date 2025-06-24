#ifndef VBE2_0_H
#define VBE2_0_H

#define INT 0x10
#define AH_VBE 0x4F
#define CGA_MODE 0x03
#define AH_CGA 0x00


#define SUPORTED_FUNC 0x4f
#define SUCCES 0x00
#define FAIL 0x01
#define UNSUPORTED_FUNC_IN_CURRENT_HW_CONFIG 0x02
#define UNSUPORTED_FUNC_IN_CURRENT_VID_MODE 0x03

#define GRAPHICS_MODE_105 0x105
#define GRAPHICS_MODE_110 0x110
#define GRAPHICS_MODE_115 0x115
#define GRAPHICS_MODE_11A 0x11A
#define GRAPHICS_MODE_14C 0x14C

//VBE functions
#define GET_VBE_CONTROLLER_INFO 0x00
#define GET_VBE_MODE_INFO 0x01
#define SET_VBE_MODE 0x02

#define LINEAR_FRAME_BUFFER_MODEL BIT(14)

#define DIRECT_COLOR_MODEL 0x06 // made by copilot

//color extraction
#define FIRST_N_BITS(n) ((1 << n) - 1)

#define R(x) ((x >> 16) & 0xFF)
#define G(x) ((x >> 8) & 0xFF)
#define B(x) (x & 0xFF)

#define R_BITS 0x00FF0000
#define G_BITS 0x0000FF00
#define B_BITS 0x000000FF

#define R_OFFSET 16
#define G_OFFSET 8
#define B_OFFSET 0

#endif

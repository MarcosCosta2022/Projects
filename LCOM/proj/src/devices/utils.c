#include <lcom/lcf.h>

#include <stdint.h>

int(util_get_LSB)(uint16_t val, uint8_t *lsb) {
  *lsb = (uint8_t) val;
  return 0;
}

int(util_get_MSB)(uint16_t val, uint8_t *msb) {
  *msb = (uint8_t) (val >>8);
  return 0;
}

int (util_sys_inb)(int port, uint8_t *value) {
  u32_t temp;
  int r = sys_inb(port, &temp);
  *value = (uint8_t) temp;
  return r;
}

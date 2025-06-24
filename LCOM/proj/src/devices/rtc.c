#include "rtc.h"

int(rtc_read_data)(uint8_t addr, uint8_t *data) {
  if (sys_outb(RTC_ADDR_REG,addr) != OK) return -1;
  return util_sys_inb(RTC_DATA_REG, data);
}

int(rtc_write_data)(uint8_t addr , uint8_t data) {
  if (sys_outb(RTC_ADDR_REG,addr) != OK) return -1;
  return sys_outb(RTC_DATA_REG, data);
}

Time (rtc_read_time) () {

  uint8_t reg;
  rtc_read_data(RTC_REG_B,&reg);

  reg |= RTC_DM;

  rtc_write_data(RTC_REG_B,reg);

  uint8_t components[6] = {0, 0, 0 , 0 , 0, 0};
  uint8_t registers[6] = {RTC_MONTH_DAY, RTC_MONTH, RTC_YEAR , RTC_HOURS, RTC_MINS, RTC_SECS};

  for (int i = 0; i < 6; i++) {
    rtc_read_data(RTC_REG_A,&reg);
    while (reg & RTC_UIP){
      rtc_read_data(RTC_REG_A,&reg);
    }
    rtc_read_data(registers[i],&components[i]);
  }

  Time date = {components[0], components[1], components[2], components[3],components[4],components[5]};
  return date;
}

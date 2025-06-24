#pragma once

#include <lcom/lcf.h>
#include <stdint.h>

#include "rtc_defines.h"

typedef struct {
  uint16_t day;
  uint16_t month;
  uint16_t year;
  uint16_t hour;
  uint16_t minute;
  uint16_t second;
} Time;


/**
 * @brief Read from the RTC data register on addr
 * @param addr Adress of register to read from
 * @param data The data to be read
 * @return 0 if successful, 1 otherwise
 */
int(rtc_read_data)(uint8_t addr, uint8_t *data);

/**
 * @brief Write data to the RTC address register
 * @param addr Adress of register to write on
 * @param data The data to be written
 * @return 0 if successful, 1 otherwise 
 */
int(rtc_write_data)(uint8_t addr , uint8_t data);

/**
 * @brief Yields a Time like type struct that contains the time taken from the RTC
 * 
 * @return Time struct with day, month, year, hour, minutes and seconds
 */
Time (rtc_read_time) ();

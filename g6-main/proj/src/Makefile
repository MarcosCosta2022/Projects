# name of the program (Minix service)
PROG=proj

.PATH: ${.CURDIR}
.PATH: ${.CURDIR}/devices
.PATH: ${.CURDIR}/game
.PATH: ${.CURDIR}/imgs
.PATH: ${.CURDIR}/event_handler

# source code files to be compiled
SRCS = proj.c utils.c KBC.c timer.c mouse.c video.c keyboard.c int_manager.c draw_graphics.c game.c timer_event_handler.c mouse_event_handler.c kbd_event_handler.c board.c piece.c game_utils.c history.c rtc.c

# __LCOM_OPTIMIZED__ disables most of the LCF's overhead (and functionality!)
CFLAGS += -pedantic -D __LCOM_OPTIMIZED__

DPADD += ${LIBLCF}
LDADD += -llcf

.include <minix.lcom.mk>>
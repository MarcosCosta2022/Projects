# name of the program (Minix service)
PROG=lab3 

# source code files to be compiled
SRCS = lab3.c ../lab2/timer.c utils.c keyboard.c KBC.c

# additional compilation flags
# "-Wall -Wextra -Werror -I . -std=c11 -Wno-unused-parameter" are already set
CFLAGS += -pedantic
CPPFLAGS += -pedantic -DLAB3
CPPFLAGS += -D LAB3
# list of library dependencies (for Lab 2, only LCF library)
DPADD += ${LIBLCF}
LDADD += -llcf


# include LCOM's makefile that does all the "heavy lifting"
.include <minix.lcom.mk>

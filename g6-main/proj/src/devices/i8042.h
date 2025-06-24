#ifndef i8042Interface
#define i8042Interface

#define KBC_OUT_BUFF 0x60
#define KBC_IN_BUFF 0x60
#define KBC_STATUS_REG 0x64
#define COMMAND_INTERACT 0x64

#define KBD_IRQ_LINE 1
#define MOUSE_IRQ_LINE 12

#define PARITY_ERROR BIT(7)
#define TIMEOUT_ERROR BIT(6)
#define AUX BIT(5)
#define INH BIT(4)
#define INPUT_BUFFER_FULL BIT(1)
#define OUTPUT_BUFFER_FULL BIT(0)

#define MAX_ATTEMPTS 3
#define DELAY 2

#define ESC_BREAK_CODE 0x81
#define TWO_BYTES 0xE0

#define KBC_READ_CMD 0x20
#define KBC_WRITE_CMD 0x60
#define DISABLE_MOUSE_INTERFACE BIT(5)
#define DISABLE_KBD_INTERFACE BIT(4)
#define MOUSE_ENABLE_OBF_INT BIT(1)
#define KBD_ENABLE_OBF_INT BIT(0)

#define WRITE_TO_AUX_DEV 0xD4
#define ENABLE_DATA_REPORTING_CMD 0xF4
#define DISABLE_DATA_REPORTING_CMD 0xF5
#define MOUSE_OK 0xFA


#define BREAK_CODE_BYTE BIT(7)

#define FIRST_BYTE_PACKET BIT(3)

/* Keys */

#define ESC_MAKE      0x01          // makecode for ESC
#define ESC_BREAK     0x81          // breakcode for ESC
#define BACKSPACE     0x0e          // makecode for backspace

#define DOWN_ARROW    0x50
#define LEFT_ARROW    0x4b
#define RIGHT_ARROW   0x4d
#define UP_ARROW      0x48

#define ENTER         0x1c
#define SPACE         0x39

#define A_KEY         0x1e
#define B_KEY         0x30
#define C_KEY         0x2e
#define D_KEY         0x20
#define E_KEY         0x12
#define F_KEY         0x21
#define G_KEY         0x22
#define H_KEY         0x23
#define I_KEY         0x17
#define J_KEY         0x24
#define K_KEY         0x25
#define L_KEY         0x26
#define M_KEY         0x32
#define N_KEY         0x31
#define O_KEY         0x18
#define P_KEY         0x19
#define Q_KEY         0x10
#define R_KEY         0x13
#define S_KEY         0x1f
#define T_KEY         0x14
#define U_KEY         0x16
#define V_KEY         0x2f
#define W_KEY         0x11
#define X_KEY         0x2d
#define Y_KEY         0x15
#define Z_KEY         0x2c

#define ZERO_KEY      0x0b
#define ONE_KEY       0x02
#define TWO_KEY       0x03
#define THREE_KEY     0x04
#define FOUR_KEY      0x05
#define FIVE_KEY      0x06
#define SIX_KEY       0x07
#define SEVEN_KEY     0x08
#define EIGHT_KEY     0x09
#define NINE_KEY      0x0a

#endif

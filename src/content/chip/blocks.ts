import type { ChipBlock, SourceRef, UsageRule } from "@/domain/chip";

// The 32 blocks of the ESP32-S3, by family. Every fact, number and register comes from
// docs-llm/esp32-s3/ESP32-S3_REFERENCE.md, with the section it is in. "full" blocks carry their key
// facts and the registers a maker touches; "listed" blocks a line and a fact or two.
//
// Usage rules say which labs light a block, from what the lessons in src/content/lessons do.

const C = (section: string): SourceRef => ({ doc: "C", section });
const T = (section: string): SourceRef => ({ doc: "T", section });

/** Every lab that flashes firmware runs on the CPU, memory, flash, cache, boot ROM and watchdogs. */
const FIRMWARE: UsageRule = { firmware: true };

/** Fastest peer for each Spark unit, so bars compare like with like. */
const MAX_MBPS = 150;
const MAX_MHZ = 80;
const MAX_CHANNELS = 20;
const MAX_PINS = 45;

export const CHIP_BLOCKS: readonly ChipBlock[] = [
  // ------------------------------------------------------------------------------------- system
  {
    id: "cpu",
    family: "system",
    name: "CPU",
    short: "Two Xtensa LX7 cores at up to 240 MHz",
    icon: "blk-cpu",
    depth: "listed",
    facts: [
      {
        id: "cpu-cores",
        text: "Dual-core 32-bit Xtensa LX7, five-stage pipeline, up to 240 MHz, with a floating-point unit.",
        importance: "key",
        source: C("C0.1"),
      },
      {
        id: "cpu-reset-clock",
        text: "After reset the CPU runs from the 40 MHz crystal divided by 2, so 20 MHz, until the firmware switches to the PLL.",
        importance: "detail",
        source: T("7.2.4.1"),
      },
    ],
    usage: FIRMWARE,
    chapter: T("4"),
  },
  {
    id: "ulp",
    family: "system",
    name: "ULP coprocessors",
    short: "A tiny RISC-V and a state machine that work while the CPU sleeps",
    icon: "blk-ulp",
    depth: "listed",
    facts: [
      {
        id: "ulp-two",
        text: "Two coprocessors, ULP-RISC-V and ULP-FSM, both at 17.5 MHz with 8 KB of RTC slow memory. Only one can run at a time.",
        importance: "key",
        source: T("2.2"),
      },
      {
        id: "ulp-reach",
        text: "They can read the ADCs, touch pins and temperature sensor, drive RTC GPIOs and RTC I2C, then wake the main CPU.",
        importance: "detail",
        source: T("2.2"),
      },
    ],
    usage: {},
    chapter: T("2"),
  },
  {
    id: "gdma",
    family: "system",
    name: "GDMA",
    short: "Moves data between memory and peripherals without the CPU",
    icon: "blk-gdma",
    depth: "listed",
    facts: [
      {
        id: "gdma-channels",
        text: "Five transmit and five receive channels, shared by SPI2, SPI3, UHCI0, I2S0, I2S1, LCD/CAM, AES, SHA, ADC and RMT.",
        importance: "key",
        source: T("3.1"),
      },
      {
        id: "gdma-reach",
        text: "It reaches up to 480 KB of internal RAM and 32 MB of external RAM, but not the SRAM used as cache.",
        importance: "detail",
        source: T("4.3.4"),
      },
    ],
    usage: { tracks: ["sound"] },
    chapter: T("3"),
  },
  {
    id: "gpio",
    family: "system",
    name: "GPIO and IO MUX",
    short: "45 pins, and a matrix that routes almost any signal to almost any pin",
    icon: "blk-gpio",
    depth: "full",
    spark: { value: 45, unit: "pins", max: MAX_PINS },
    facts: [
      {
        id: "gpio-count",
        text: "45 GPIOs, numbered 0-21 and 26-48. Each one can be an input or an output.",
        importance: "key",
        source: T("6.1"),
      },
      {
        id: "gpio-matrix",
        text: "The GPIO matrix connects 175 peripheral inputs and 184 peripheral outputs to any pin. Fast signals (SPI, JTAG, UART) can skip it through the IO MUX for better timing.",
        importance: "key",
        source: T("6.2"),
      },
      {
        id: "gpio-drive",
        text: "Each pin drives about 5, 10, 20 or 40 mA. The default is 20 mA (10 mA on GPIO17/18, 40 mA on GPIO19/20).",
        importance: "detail",
        source: C("C2.2"),
      },
      {
        id: "gpio-pulls",
        text: "Internal pull-up and pull-down resistors are about 45 kΩ: fine for a button, too weak for a long I2C bus.",
        importance: "detail",
        source: C("C5.4"),
      },
      {
        id: "gpio-5v",
        text: "Inputs accept up to the supply plus 0.3 V. The pins are not 5 V tolerant.",
        importance: "gotcha",
        source: C("C5.4"),
      },
      {
        id: "gpio-hold",
        text: "A pin can be latched (held) so it keeps its level through a watchdog reset or deep sleep.",
        importance: "detail",
        source: T("6.9"),
      },
    ],
    registers: [
      {
        symbol: "GPIO_OUT_W1TS_REG",
        offset: "0x0008",
        fields: [
          {
            bits: "31:0",
            symbol: "GPIO_OUT_W1TS",
            does: "Write a 1 to set that pin's output high (GPIO0-31). Bits written 0 are left alone.",
          },
        ],
        source: T("6.15.1"),
      },
      {
        symbol: "GPIO_ENABLE_W1TS_REG",
        offset: "0x0024",
        fields: [
          {
            bits: "31:0",
            symbol: "GPIO_ENABLE_W1TS",
            does: "Write a 1 to turn that pin into an output (GPIO0-31).",
          },
        ],
        source: T("6.15.1"),
      },
      {
        symbol: "GPIO_IN_REG",
        offset: "0x003C",
        fields: [
          {
            bits: "31:0",
            symbol: "GPIO_IN_DATA_NEXT",
            does: "The level on GPIO0-31, one bit per pin: 1 high, 0 low.",
          },
        ],
        source: T("6.15.1"),
      },
      {
        symbol: "GPIO_FUNCx_OUT_SEL_CFG_REG",
        offset: "0x0554 + 0x4·x",
        fields: [
          {
            bits: "8:0",
            symbol: "GPIO_FUNCx_OUT_SEL",
            does: "Which peripheral output signal drives pin x. 256 means plain GPIO output.",
          },
          { bits: "9", symbol: "GPIO_FUNCx_OUT_INV_SEL", does: "Invert the output." },
        ],
        source: T("6.15.1"),
      },
      {
        symbol: "IO_MUX_GPIOn_REG",
        offset: "0x0004 + 4·n",
        fields: [
          { bits: "7", symbol: "IO_MUX_FUN_WPD", does: "Internal pull-down on." },
          { bits: "8", symbol: "IO_MUX_FUN_WPU", does: "Internal pull-up on." },
          { bits: "9", symbol: "IO_MUX_FUN_IE", does: "Input enabled." },
          {
            bits: "11:10",
            symbol: "IO_MUX_FUN_DRV",
            does: "Drive strength: 0 is about 5 mA, 3 about 40 mA.",
          },
          {
            bits: "14:12",
            symbol: "IO_MUX_MCU_SEL",
            does: "Which IO MUX function the pin takes (function 1 is GPIO on most pins).",
          },
        ],
        source: T("6.15.2"),
      },
    ],
    usage: { pins: ["0", "5"], lessons: ["02", "S3", "S6"] },
    chapter: T("6"),
  },
  {
    id: "rtc",
    family: "system",
    name: "RTC and power management",
    short: "The always-on corner that runs the sleep modes and wakes the chip",
    icon: "blk-rtc",
    depth: "listed",
    facts: [
      {
        id: "rtc-modes",
        text: "Four predefined power modes: Active, Modem-sleep, Light-sleep and Deep-sleep. In deep sleep only the RTC stays on.",
        importance: "key",
        source: T("10.4.3"),
      },
      {
        id: "rtc-memory",
        text: "16 KB of RTC memory (8 KB fast, 8 KB slow) keeps its contents through deep sleep.",
        importance: "detail",
        source: T("4.3.2"),
      },
      {
        id: "rtc-wake",
        text: "From deep sleep only the RTC GPIOs (0-21), the RTC timer, touch and the ULP can wake the chip.",
        importance: "gotcha",
        source: T("10.4.4"),
      },
    ],
    usage: {},
    chapter: T("10"),
  },

  // ------------------------------------------------------------------------------------- memory
  {
    id: "sram",
    family: "memory",
    name: "SRAM",
    short: "512 KB of fast on-chip RAM for your code and data",
    icon: "blk-sram",
    depth: "listed",
    facts: [
      {
        id: "sram-size",
        text: "512 KB of on-chip SRAM, plus 16 KB of RTC SRAM. Part of it can be given to the caches.",
        importance: "key",
        source: T("4.3.2"),
      },
      {
        id: "sram-speed",
        text: "The CPU usually reads SRAM within a single clock cycle.",
        importance: "detail",
        source: T("4.3.2"),
      },
    ],
    usage: FIRMWARE,
    chapter: T("4.3.2"),
  },
  {
    id: "rom",
    family: "memory",
    name: "ROM",
    short: "384 KB of factory code: the bootloader and download mode",
    icon: "blk-rom",
    depth: "listed",
    facts: [
      {
        id: "rom-size",
        text: "384 KB of read-only memory with the boot code and low-level routines. It cannot be changed.",
        importance: "key",
        source: T("4.3.2"),
      },
      {
        id: "rom-download",
        text: "With GPIO0 and GPIO46 low at reset, the ROM waits for new firmware over UART or USB instead of running yours.",
        importance: "detail",
        source: C("C3.1"),
      },
    ],
    usage: FIRMWARE,
    chapter: T("4.3.2"),
  },
  {
    id: "flash-psram",
    family: "memory",
    name: "Flash and PSRAM",
    short: "The module's flash holds your program; PSRAM adds megabytes of RAM",
    icon: "blk-flash",
    depth: "listed",
    facts: [
      {
        id: "flash-psram-size",
        text: "Up to 1 GB of external flash and 1 GB of external RAM, mapped 32 MB at a time through the caches.",
        importance: "key",
        source: T("4.3.3.1"),
      },
      {
        id: "flash-psram-clock",
        text: "The flash runs at up to 80 MHz by default; its sectors take about 100,000 erase cycles.",
        importance: "detail",
        source: C("C5.7"),
      },
      {
        id: "flash-psram-pins",
        text: "GPIO26-32 carry the flash bus, and octal PSRAM also takes GPIO33-37.",
        importance: "gotcha",
        source: C("C2.6"),
      },
    ],
    usage: FIRMWARE,
    chapter: T("4.3.3"),
  },
  {
    id: "cache",
    family: "memory",
    name: "Cache",
    short: "Keeps recent flash and PSRAM in fast SRAM",
    icon: "blk-cache",
    depth: "listed",
    facts: [
      {
        id: "cache-sizes",
        text: "A 16 or 32 KB instruction cache and a 32 or 64 KB data cache, shared by both cores.",
        importance: "key",
        source: T("4.0"),
      },
    ],
    usage: FIRMWARE,
    chapter: T("4.3.3.2"),
  },
  {
    id: "efuse",
    family: "memory",
    name: "eFuse",
    short: "4096 one-time bits: MAC address, keys and boot settings",
    icon: "blk-efuse",
    depth: "listed",
    facts: [
      {
        id: "efuse-size",
        text: "4096 bits of one-time programmable memory, 1792 of them free for users (keys, device ID).",
        importance: "key",
        source: T("5.2"),
      },
      {
        id: "efuse-one-way",
        text: "Once burned to 1, an eFuse bit never goes back to 0.",
        importance: "gotcha",
        source: T("5.1"),
      },
    ],
    usage: { lessons: ["01"] },
    chapter: T("5"),
  },

  // ----------------------------------------------------------------------------------- security
  {
    id: "crypto",
    family: "security",
    name: "Crypto accelerators",
    short: "Hardware SHA, AES, RSA, HMAC and digital signatures",
    icon: "blk-crypto",
    depth: "listed",
    facts: [
      {
        id: "crypto-set",
        text: "SHA (SHA-1 up to SHA-512), AES-128/256, RSA, HMAC and an RSA digital-signature block, much faster than software.",
        importance: "key",
        source: C("C0.1"),
      },
      {
        id: "crypto-flash",
        text: "Firmware and data in the external flash and PSRAM can be encrypted and decrypted on the fly with XTS-AES.",
        importance: "detail",
        source: T("23.1"),
      },
    ],
    usage: { lessons: ["W3"] },
    chapter: T("18"),
  },
  {
    id: "rng",
    family: "security",
    name: "Random number generator",
    short: "True random numbers from thermal noise",
    icon: "blk-rng",
    depth: "listed",
    facts: [
      {
        id: "rng-source",
        text: "Each 32-bit read of RNG_DATA_REG is a true random number, seeded by ADC noise and clock jitter.",
        importance: "key",
        source: T("25.3"),
      },
      {
        id: "rng-entropy",
        text: "For full entropy, keep an ADC source running (the SAR ADC or the radio's high-speed ADC); clock jitter alone is weaker.",
        importance: "gotcha",
        source: T("25.3"),
      },
    ],
    usage: { lessons: ["W3", "B4"] },
    chapter: T("25"),
  },

  // ------------------------------------------------------------------------------- connectivity
  {
    id: "uart",
    family: "connectivity",
    name: "UART",
    short: "Three serial ports, the one you see in the serial monitor",
    icon: "blk-uart",
    depth: "full",
    spark: { value: 5, unit: "Mbps", max: MAX_MBPS },
    facts: [
      {
        id: "uart-count",
        text: "Three UART controllers (UART0, 1, 2) at up to 5 Mbps, with RS485 and IrDA modes.",
        importance: "key",
        source: T("26.0"),
      },
      {
        id: "uart-frame",
        text: "5 to 8 data bits, optional parity, and 1, 1.5 or 2 stop bits. (The datasheet also lists 3 stop bits; the TRM does not.)",
        importance: "detail",
        source: T("26.2"),
      },
      {
        id: "uart-fifo",
        text: "The three UARTs share 1024 bytes of FIFO RAM, can detect the baud rate, and handle RTS/CTS flow control in hardware.",
        importance: "detail",
        source: T("26.2"),
      },
      {
        id: "uart-boot",
        text: "UART0 sits on GPIO43 (TX) and 44 (RX), where the ROM prints its boot log.",
        importance: "gotcha",
        source: C("C3.3"),
      },
    ],
    registers: [
      {
        symbol: "UART_FIFO_REG",
        offset: "0x0000",
        fields: [
          {
            bits: "7:0",
            symbol: "UART_RXFIFO_RD_BYTE",
            does: "Read a received byte, or write one to send.",
          },
        ],
        source: T("26.7"),
      },
      {
        symbol: "UART_CLKDIV_REG",
        offset: "0x0014",
        fields: [
          { bits: "11:0", symbol: "UART_CLKDIV", does: "Whole part of the baud-rate divider." },
          { bits: "23:20", symbol: "UART_CLKDIV_FRAG", does: "Fractional part of the divider." },
        ],
        source: T("26.7"),
      },
      {
        symbol: "UART_STATUS_REG",
        offset: "0x001C",
        fields: [
          { bits: "9:0", symbol: "UART_RXFIFO_CNT", does: "Bytes waiting in the receive FIFO." },
          { bits: "25:16", symbol: "UART_TXFIFO_CNT", does: "Bytes still in the transmit FIFO." },
        ],
        source: T("26.7"),
      },
      {
        symbol: "UART_CONF0_REG",
        offset: "0x0020",
        fields: [
          { bits: "0", symbol: "UART_PARITY", does: "Parity mode." },
          { bits: "1", symbol: "UART_PARITY_EN", does: "Parity check on." },
          { bits: "3:2", symbol: "UART_BIT_NUM", does: "Data bits (3 means 8)." },
          { bits: "5:4", symbol: "UART_STOP_BIT_NUM", does: "Stop-bit length." },
          { bits: "14", symbol: "UART_LOOPBACK", does: "Loop TX back to RX for a self-test." },
        ],
        source: T("26.7"),
      },
      {
        symbol: "UART_CLK_CONF_REG",
        offset: "0x0078",
        fields: [
          {
            bits: "21:20",
            symbol: "UART_SCLK_SEL",
            does: "Clock source: 1 APB_CLK, 2 RC_FAST_CLK, 3 XTAL_CLK.",
          },
          { bits: "19:12", symbol: "UART_SCLK_DIV_NUM", does: "Divider in front of the baud generator." },
        ],
        source: T("26.7"),
      },
    ],
    usage: { firmware: true, usb: true },
    chapter: T("26"),
  },
  {
    id: "i2c",
    family: "connectivity",
    name: "I2C",
    short: "Two-wire bus for sensors and small displays",
    icon: "blk-i2c",
    depth: "full",
    spark: { value: 0.8, unit: "Mbps", max: MAX_MBPS },
    facts: [
      {
        id: "i2c-count",
        text: "Two I2C controllers, each master or slave, with 7-bit and 10-bit addresses.",
        importance: "key",
        source: T("27.0"),
      },
      {
        id: "i2c-speed",
        text: "Standard (100 kbit/s) and Fast (400 kbit/s) mode; the datasheet adds up to 800 kbit/s if the pull-ups are strong enough.",
        importance: "detail",
        source: T("27.0"),
      },
      {
        id: "i2c-commands",
        text: "In master mode you queue up to eight commands (write, read, stop...) and the hardware runs the whole transaction.",
        importance: "detail",
        source: T("27.4.9"),
      },
      {
        id: "i2c-pullups",
        text: "SDA and SCL are open-drain: the bus needs pull-up resistors, and the internal 45 kΩ ones are weak.",
        importance: "gotcha",
        source: T("27.1"),
      },
    ],
    registers: [
      {
        symbol: "I2C_SCL_LOW_PERIOD_REG",
        offset: "0x0000",
        fields: [
          { bits: "8:0", symbol: "I2C_SCL_LOW_PERIOD", does: "How long SCL stays low, in module clock cycles." },
        ],
        source: T("27.8"),
      },
      {
        symbol: "I2C_CTR_REG",
        offset: "0x0004",
        fields: [
          { bits: "4", symbol: "I2C_MS_MODE", does: "1 makes the controller a master." },
          { bits: "5", symbol: "I2C_TRANS_START", does: "Start running the queued commands." },
          { bits: "0", symbol: "I2C_SDA_FORCE_OUT", does: "0 for open-drain SDA." },
        ],
        source: T("27.8"),
      },
      {
        symbol: "I2C_SR_REG",
        offset: "0x0008",
        fields: [
          { bits: "0", symbol: "I2C_RESP_REC", does: "The last ACK bit: 0 ACK, 1 NACK." },
          { bits: "4", symbol: "I2C_BUS_BUSY", does: "The bus is busy." },
          { bits: "3", symbol: "I2C_ARB_LOST", does: "Another master won the bus." },
        ],
        source: T("27.8"),
      },
      {
        symbol: "I2C_DATA_REG",
        offset: "0x001C",
        fields: [{ bits: "7:0", symbol: "I2C_FIFO_RDATA", does: "Read from the RX FIFO, write to the TX FIFO." }],
        source: T("27.8"),
      },
      {
        symbol: "I2C_COMD0_REG",
        offset: "0x0058",
        fields: [
          {
            bits: "13:0",
            symbol: "I2C_COMMAND0",
            does: "First command: op code (1 WRITE, 2 STOP, 3 READ, 4 END, 6 RSTART) and byte count.",
          },
          { bits: "31", symbol: "I2C_COMMAND0_DONE", does: "Set when the command has run." },
        ],
        source: T("27.8"),
      },
    ],
    usage: {},
    chapter: T("27"),
  },
  {
    id: "i2s",
    family: "connectivity",
    name: "I2S",
    short: "Digital audio in and out: microphones, amplifiers, codecs",
    icon: "blk-i2s",
    depth: "full",
    spark: { value: 40, unit: "MHz", max: MAX_MHZ },
    facts: [
      {
        id: "i2s-count",
        text: "Two I2S interfaces (I2S0, I2S1) with separate transmit and receive units that run at the same time.",
        importance: "key",
        source: T("28.1"),
      },
      {
        id: "i2s-format",
        text: "8, 16, 24 or 32-bit samples at 8 to 192 kHz, with a bit clock from 10 kHz up to 40 MHz.",
        importance: "key",
        source: T("28.0"),
      },
      {
        id: "i2s-pdm",
        text: "Only I2S0 converts PDM microphones to PCM, and PCM to PDM.",
        importance: "detail",
        source: T("28.2"),
      },
      {
        id: "i2s-dma",
        text: "Audio moves through a dedicated DMA, without the CPU copying each sample.",
        importance: "detail",
        source: T("28.0"),
      },
    ],
    registers: [
      {
        symbol: "I2S_RX_CONF_REG",
        offset: "0x0020",
        fields: [
          { bits: "0", symbol: "I2S_RX_RESET", does: "Reset the receive unit." },
          { bits: "2", symbol: "I2S_RX_START", does: "Start receiving." },
          { bits: "3", symbol: "I2S_RX_SLAVE_MOD", does: "Take BCK and WS from outside (slave)." },
          { bits: "5", symbol: "I2S_RX_MONO", does: "Mono mode." },
          { bits: "20", symbol: "I2S_RX_PDM_EN", does: "PDM receive mode." },
        ],
        source: T("28.14"),
      },
      {
        symbol: "I2S_TX_CONF_REG",
        offset: "0x0024",
        fields: [
          { bits: "0", symbol: "I2S_TX_RESET", does: "Reset the transmit unit." },
          { bits: "2", symbol: "I2S_TX_START", does: "Start sending." },
          { bits: "5", symbol: "I2S_TX_MONO", does: "Mono mode." },
          { bits: "26:24", symbol: "I2S_TX_CHAN_MOD", does: "Which channels carry data." },
        ],
        source: T("28.14"),
      },
      {
        symbol: "I2S_RX_CONF1_REG",
        offset: "0x0028",
        fields: [
          { bits: "12:7", symbol: "I2S_RX_BCK_DIV_NUM", does: "Bit-clock divider (never 1)." },
          { bits: "17:13", symbol: "I2S_RX_BITS_MOD", does: "Bits per sample minus 1: 15 for 16-bit." },
        ],
        source: T("28.14"),
      },
      {
        symbol: "I2S_RX_CLKM_CONF_REG",
        offset: "0x0030",
        fields: [
          { bits: "7:0", symbol: "I2S_RX_CLKM_DIV_NUM", does: "Whole part of the clock divider." },
          { bits: "26", symbol: "I2S_RX_CLK_ACTIVE", does: "Receive clock on." },
          {
            bits: "28:27",
            symbol: "I2S_RX_CLK_SEL",
            does: "Clock source: 0 XTAL, 1 PLL_D2, 2 PLL_F160M, 3 MCLK input.",
          },
        ],
        source: T("28.14"),
      },
    ],
    usage: { tracks: ["sound"] },
    chapter: T("28"),
  },
  {
    id: "spi",
    family: "connectivity",
    name: "SPI",
    short: "Fast four-wire bus for screens, card readers and flash",
    icon: "blk-spi",
    depth: "full",
    spark: { value: 80, unit: "MHz", max: MAX_MHZ },
    facts: [
      {
        id: "spi-count",
        text: "Four SPI controllers: SPI0 and SPI1 talk to the flash and PSRAM; GP-SPI2 and GP-SPI3 are yours.",
        importance: "key",
        source: T("30.1"),
      },
      {
        id: "spi-speed",
        text: "As a master up to 80 MHz, as a slave up to 60 MHz, in all four clock modes (0-3).",
        importance: "key",
        source: T("30.3"),
      },
      {
        id: "spi-lines",
        text: "GP-SPI2 has six chip selects and goes up to 8 data lines; GP-SPI3 has three chip selects and up to 4 lines.",
        importance: "detail",
        source: T("30.0"),
      },
      {
        id: "spi-dma",
        text: "The CPU can move up to 64 bytes per transfer; with DMA a single transfer takes up to 32 KB, segmented ones have no limit.",
        importance: "detail",
        source: T("30.3"),
      },
      {
        id: "spi-iomux",
        text: "GP-SPI2 (FSPI) can reach its pins through the IO MUX or the GPIO matrix; GP-SPI3 always goes through the matrix.",
        importance: "detail",
        source: T("30.2"),
      },
    ],
    registers: [
      {
        symbol: "SPI_CMD_REG",
        offset: "0x0000",
        fields: [
          { bits: "24", symbol: "SPI_USR", does: "Start a transfer; clears itself when done." },
          { bits: "23", symbol: "SPI_UPDATE", does: "Copy the new settings into the SPI clock domain." },
        ],
        source: T("30.12"),
      },
      {
        symbol: "SPI_CLOCK_REG",
        offset: "0x000C",
        fields: [
          { bits: "31", symbol: "SPI_CLK_EQU_SYSCLK", does: "1: SPI clock = APB clock (80 MHz)." },
          { bits: "21:18", symbol: "SPI_CLKDIV_PRE", does: "Pre-divider." },
          { bits: "17:12", symbol: "SPI_CLKCNT_N", does: "Divider: f = APB / (PRE+1) / (N+1)." },
        ],
        source: T("30.12"),
      },
      {
        symbol: "SPI_MS_DLEN_REG",
        offset: "0x001C",
        fields: [{ bits: "17:0", symbol: "SPI_MS_DATA_BITLEN", does: "Data length of the transfer, in bits, minus 1." }],
        source: T("30.12"),
      },
      {
        symbol: "SPI_MISC_REG",
        offset: "0x0020",
        fields: [
          { bits: "0", symbol: "SPI_CS0_DIS", does: "1 disables the CS0 pin." },
          { bits: "29", symbol: "SPI_CK_IDLE_EDGE", does: "Clock level when idle (the polarity, CPOL)." },
        ],
        source: T("30.12"),
      },
      {
        symbol: "SPI_W0_REG",
        offset: "0x0098",
        fields: [
          {
            bits: "31:0",
            symbol: "SPI_BUF0",
            does: "First of 16 data buffers (SPI_W0 to W15, 64 bytes) for CPU-driven transfers.",
          },
        ],
        source: T("30.12"),
      },
    ],
    usage: { tracks: ["display", "rfid"], pins: ["11", "12"] },
    chapter: T("30"),
  },
  {
    id: "lcd-cam",
    family: "connectivity",
    name: "LCD and camera",
    short: "Parallel 8 or 16-bit bus for big screens and camera sensors",
    icon: "blk-lcd-cam",
    depth: "listed",
    facts: [
      {
        id: "lcd-cam-bus",
        text: "8 to 16-bit parallel output (RGB, I8080, MOTO6800) and input from DVP cameras, at up to 40 MHz.",
        importance: "key",
        source: T("29.0"),
      },
    ],
    usage: {},
    chapter: T("29"),
  },
  {
    id: "twai",
    family: "connectivity",
    name: "TWAI (CAN)",
    short: "Robust two-wire bus from cars and machines",
    icon: "blk-twai",
    depth: "listed",
    facts: [
      {
        id: "twai-spec",
        text: "Compatible with CAN 2.0 (ISO 11898-1), 11 or 29-bit IDs, from 1 kbit/s to 1 Mbit/s.",
        importance: "key",
        source: T("31.2"),
      },
      {
        id: "twai-transceiver",
        text: "It needs an external transceiver chip to reach the bus.",
        importance: "gotcha",
        source: T("31.1"),
      },
    ],
    usage: {},
    chapter: T("31"),
  },
  {
    id: "usb-otg",
    family: "connectivity",
    name: "USB OTG",
    short: "Full-speed USB host or device: keyboards, MIDI, mass storage",
    icon: "blk-usb-otg",
    depth: "listed",
    facts: [
      {
        id: "usb-otg-speed",
        text: "USB 2.0 full speed (12 Mbit/s) and low speed, as a host or a device, with an on-chip transceiver.",
        importance: "key",
        source: T("32.1"),
      },
      {
        id: "usb-otg-shared",
        text: "It shares the on-chip USB transceiver (GPIO19/20) with the USB Serial/JTAG port.",
        importance: "gotcha",
        source: T("32.2.1"),
      },
    ],
    usage: {},
    chapter: T("32"),
  },
  {
    id: "usb-serial-jtag",
    family: "connectivity",
    name: "USB Serial/JTAG",
    short: "A serial port and a debugger on two pins, no adapter needed",
    icon: "blk-usb-serial-jtag",
    depth: "full",
    spark: { value: 12, unit: "Mbps", max: MAX_MBPS },
    facts: [
      {
        id: "usb-serial-jtag-what",
        text: "A fixed USB device: a CDC-ACM serial port plus a JTAG adapter for the debugger, on GPIO19 (D-) and 20 (D+).",
        importance: "key",
        source: T("33.2"),
      },
      {
        id: "usb-serial-jtag-speed",
        text: "USB 2.0 full speed only: 12 Mbit/s, not the 480 Mbit/s high speed.",
        importance: "detail",
        source: T("33.2"),
      },
      {
        id: "usb-serial-jtag-reset",
        text: "The host can reset the chip and put it into download mode over USB, so no BOOT button is needed.",
        importance: "detail",
        source: T("33.2"),
      },
      {
        id: "usb-serial-jtag-pins",
        text: "Using GPIO19/20 as plain GPIOs switches this port off.",
        importance: "gotcha",
        source: C("C2.3.4"),
      },
    ],
    registers: [
      {
        symbol: "USB_SERIAL_JTAG_EP1_REG",
        offset: "0x0000",
        fields: [
          {
            bits: "7:0",
            symbol: "USB_SERIAL_JTAG_RDWR_BYTE",
            does: "Read a byte from the host, or write one to send (up to 64 per packet).",
          },
        ],
        source: T("33.6"),
      },
      {
        symbol: "USB_SERIAL_JTAG_EP1_CONF_REG",
        offset: "0x0004",
        fields: [
          { bits: "0", symbol: "USB_SERIAL_JTAG_WR_DONE", does: "Send what was written." },
          { bits: "1", symbol: "USB_SERIAL_JTAG_SERIAL_IN_EP_DATA_FREE", does: "Room to write." },
          { bits: "2", symbol: "USB_SERIAL_JTAG_SERIAL_OUT_EP_DATA_AVAIL", does: "Bytes from the host waiting." },
        ],
        source: T("33.6"),
      },
      {
        symbol: "USB_SERIAL_JTAG_INT_RAW_REG",
        offset: "0x0008",
        fields: [
          { bits: "2", symbol: "USB_SERIAL_JTAG_SERIAL_OUT_RECV_PKT_INT_RAW", does: "A packet arrived from the host." },
          { bits: "3", symbol: "USB_SERIAL_JTAG_SERIAL_IN_EMPTY_INT_RAW", does: "The send buffer is empty." },
          { bits: "9", symbol: "USB_SERIAL_JTAG_USB_BUS_RESET_INT_RAW", does: "The host reset the bus." },
        ],
        source: T("33.6"),
      },
      {
        symbol: "USB_SERIAL_JTAG_CONF0_REG",
        offset: "0x0018",
        fields: [
          { bits: "0", symbol: "USB_SERIAL_JTAG_PHY_SEL", does: "0 internal PHY, 1 external." },
          { bits: "9", symbol: "USB_SERIAL_JTAG_DP_PULLUP", does: "D+ pull-up: tells the host a device is there." },
          { bits: "14", symbol: "USB_SERIAL_JTAG_USB_PAD_ENABLE", does: "USB function on the pads." },
        ],
        source: T("33.6"),
      },
    ],
    usage: { usb: true },
    chapter: T("33"),
  },
  {
    id: "sdmmc",
    family: "connectivity",
    name: "SD/MMC host",
    short: "Talks to SD cards and eMMC in 1, 4 or 8-bit mode",
    icon: "blk-sdmmc",
    depth: "listed",
    facts: [
      {
        id: "sdmmc-spec",
        text: "Two card slots (not at the same time), SD 3.0/3.01 and MMC up to 4.51, at up to 80 MHz.",
        importance: "key",
        source: T("34.2"),
      },
    ],
    usage: {},
    chapter: T("34"),
  },

  // ------------------------------------------------------------------------------------- timing
  {
    id: "timers",
    family: "timing",
    name: "Timers",
    short: "A 52-bit system timer and four 54-bit general-purpose timers",
    icon: "blk-timers",
    depth: "listed",
    facts: [
      {
        id: "timers-systimer",
        text: "The 52-bit system timer counts at 16 MHz from the crystal and gives the operating system its tick.",
        importance: "key",
        source: T("11.2"),
      },
      {
        id: "timers-timg",
        text: "Two timer groups with two 54-bit timers each, a 16-bit prescaler, alarms and auto-reload.",
        importance: "detail",
        source: T("12.1"),
      },
    ],
    usage: { lessons: ["01", "S6"] },
    chapter: T("12"),
  },
  {
    id: "wdt",
    family: "timing",
    name: "Watchdogs",
    short: "Reset the chip when the program hangs",
    icon: "blk-wdt",
    depth: "listed",
    facts: [
      {
        id: "wdt-three",
        text: "Three digital watchdogs (one per timer group, one in the RTC) plus an analog super watchdog.",
        importance: "key",
        source: T("13.1"),
      },
      {
        id: "wdt-boot",
        text: "During a flash boot the RTC watchdog and the first timer-group watchdog switch on by themselves.",
        importance: "detail",
        source: T("13.1"),
      },
    ],
    usage: FIRMWARE,
    chapter: T("13"),
  },
  {
    id: "ledc",
    family: "timing",
    name: "LED PWM",
    short: "Eight PWM channels that dim and fade LEDs on their own",
    icon: "blk-ledc",
    depth: "full",
    spark: { value: 8, unit: "channels", max: MAX_CHANNELS },
    facts: [
      {
        id: "ledc-channels",
        text: "Eight PWM channels driven by four timers. Several channels can share one timer.",
        importance: "key",
        source: T("35.2"),
      },
      {
        id: "ledc-resolution",
        text: "Up to 14 bits of duty-cycle resolution (the datasheet: 14 bits within a 1 ms period).",
        importance: "key",
        source: T("35.0"),
      },
      {
        id: "ledc-fade",
        text: "Hardware fading: the duty steps up or down by itself, with an interrupt when the fade ends.",
        importance: "detail",
        source: T("35.2"),
      },
      {
        id: "ledc-sleep",
        text: "Clocked from RC_FAST_CLK, it keeps its PWM running in light sleep.",
        importance: "detail",
        source: T("7.2.4.2"),
      },
    ],
    registers: [
      {
        symbol: "LEDC_CHn_CONF0_REG",
        offset: "0x0000 + 0x14·n",
        fields: [
          { bits: "1:0", symbol: "LEDC_TIMER_SEL_CHn", does: "Which of the four timers this channel follows." },
          { bits: "2", symbol: "LEDC_SIG_OUT_EN_CHn", does: "Output on." },
          { bits: "4", symbol: "LEDC_PARA_UP_CHn", does: "Apply the new duty and settings." },
        ],
        source: T("35.5"),
      },
      {
        symbol: "LEDC_CHn_DUTY_REG",
        offset: "0x0008 + 0x14·n",
        fields: [{ bits: "18:0", symbol: "LEDC_DUTY_CHn", does: "Duty: the count at which the output goes low." }],
        source: T("35.5"),
      },
      {
        symbol: "LEDC_CHn_CONF1_REG",
        offset: "0x000C + 0x14·n",
        fields: [
          { bits: "31", symbol: "LEDC_DUTY_START_CHn", does: "Start a fade." },
          { bits: "30", symbol: "LEDC_DUTY_INC_CHn", does: "Fade up (1) or down (0)." },
          { bits: "29:20", symbol: "LEDC_DUTY_NUM_CHn", does: "Number of fade steps." },
        ],
        source: T("35.5"),
      },
      {
        symbol: "LEDC_TIMERx_CONF_REG",
        offset: "0x00A0 + 0x8·x",
        fields: [
          { bits: "3:0", symbol: "LEDC_TIMERx_DUTY_RES", does: "Counter range: the duty resolution in bits." },
          { bits: "21:4", symbol: "LEDC_CLK_DIV_TIMERx", does: "Clock divider; the low 8 bits are the fraction." },
        ],
        source: T("35.5"),
      },
      {
        symbol: "LEDC_CONF_REG",
        offset: "0x00D0",
        fields: [
          {
            bits: "1:0",
            symbol: "LEDC_APB_CLK_SEL",
            does: "Clock for all timers: 1 APB_CLK, 2 RC_FAST_CLK, 3 XTAL_CLK.",
          },
        ],
        source: T("35.5"),
      },
    ],
    usage: { lessons: ["02"] },
    chapter: T("35"),
  },
  {
    id: "mcpwm",
    family: "timing",
    name: "Motor control PWM",
    short: "PWM pairs with dead time, for motors and power stages",
    icon: "blk-mcpwm",
    depth: "listed",
    facts: [
      {
        id: "mcpwm-units",
        text: "Two MCPWM units, each with three timers, three operators (two outputs each), fault inputs and a capture module.",
        importance: "key",
        source: T("36.2"),
      },
    ],
    usage: {},
    chapter: T("36"),
  },
  {
    id: "rmt",
    family: "timing",
    name: "RMT",
    short: "Plays and records exact pulse trains: IR remotes, RGB LEDs",
    icon: "blk-rmt",
    depth: "full",
    spark: { value: 8, unit: "channels", max: MAX_CHANNELS },
    facts: [
      {
        id: "rmt-channels",
        text: "Eight channels: 0-3 transmit, 4-7 receive.",
        importance: "key",
        source: T("37.1"),
      },
      {
        id: "rmt-ram",
        text: "Each pulse is a level plus a duration. The channels share 384 × 32-bit words of RAM, 48 words per channel by default.",
        importance: "key",
        source: T("37.3.2.2"),
      },
      {
        id: "rmt-carrier",
        text: "It can add a carrier wave on transmit and strip it on receive, as IR remotes need.",
        importance: "detail",
        source: T("37.2"),
      },
      {
        id: "rmt-rgb",
        text: "The board's addressable RGB LED is driven by RMT pulse trains; check whether yours is on GPIO38 or GPIO48.",
        importance: "gotcha",
        source: { doc: "A", section: "A1.1" },
      },
    ],
    registers: [
      {
        symbol: "RMT_CHnCONF0_REG",
        offset: "0x0020 + 0x4·n",
        fields: [
          { bits: "0", symbol: "RMT_TX_START_CHn", does: "Start sending." },
          { bits: "15:8", symbol: "RMT_DIV_CNT_CHn", does: "Clock divider: the length of one tick." },
          { bits: "19:16", symbol: "RMT_MEM_SIZE_CHn", does: "How many 48-word RAM blocks the channel uses." },
          { bits: "21", symbol: "RMT_CARRIER_EN_CHn", does: "Add a carrier wave." },
        ],
        source: T("37.6"),
      },
      {
        symbol: "RMT_CHnSTATUS_REG",
        offset: "0x0050 + 0x4·n",
        fields: [
          { bits: "24:22", symbol: "RMT_STATE_CHn", does: "What the channel is doing." },
          { bits: "25", symbol: "RMT_MEM_EMPTY_CHn", does: "Ran out of data (wrap mode off)." },
        ],
        source: T("37.6"),
      },
      {
        symbol: "RMT_SYS_CONF_REG",
        offset: "0x00C0",
        fields: [
          { bits: "25:24", symbol: "RMT_SCLK_SEL", does: "Clock source: 1 APB_CLK, 2 RC_FAST_CLK, 3 XTAL_CLK." },
          { bits: "11:4", symbol: "RMT_SCLK_DIV_NUM", does: "Whole part of the clock divider." },
          { bits: "31", symbol: "RMT_CLK_EN", does: "Register clock on." },
        ],
        source: T("37.6"),
      },
    ],
    usage: { pins: ["48"], lessons: ["S3", "S4", "S5", "S6", "R1"] },
    chapter: T("37"),
  },
  {
    id: "pcnt",
    family: "timing",
    name: "Pulse counter",
    short: "Counts edges by itself: encoders, flow meters",
    icon: "blk-pcnt",
    depth: "listed",
    facts: [
      {
        id: "pcnt-units",
        text: "Four counter units with two channels each, glitch filters, and pulses up to 40 MHz.",
        importance: "key",
        source: T("38.1"),
      },
    ],
    usage: {},
    chapter: T("38"),
  },

  // ------------------------------------------------------------------------------------- analog
  {
    id: "adc",
    family: "analog",
    name: "SAR ADC",
    short: "Two 12-bit converters that turn a voltage into a number",
    icon: "blk-adc",
    depth: "full",
    spark: { value: 20, unit: "channels", max: MAX_CHANNELS },
    facts: [
      {
        id: "adc-count",
        text: "Two 12-bit SAR ADCs on 20 pins: ADC1 on GPIO1-10, ADC2 on GPIO11-20.",
        importance: "key",
        source: C("C2.3.3"),
      },
      {
        id: "adc-atten",
        text: "The reference is about 1.1 V. Attenuation (0, 2.5, 6 or 12 dB) stretches the range; calibrated, 12 dB reads up to about 2.9 V.",
        importance: "key",
        source: T("39.3.5"),
      },
      {
        id: "adc-rate",
        text: "Up to 100 k samples per second, and DIG ADC1 can stream samples to memory through DMA.",
        importance: "detail",
        source: C("C5.5"),
      },
      {
        id: "adc-accuracy",
        text: "After calibration the error is within 5 mV at 0 dB and 50 mV at 12 dB. Averaging helps.",
        importance: "detail",
        source: C("C5.5"),
      },
      {
        id: "adc-wifi",
        text: "ADC2 cannot be used while Wi-Fi is on: put analog inputs on ADC1.",
        importance: "gotcha",
        source: T("39.0"),
      },
      {
        id: "adc-dig2",
        text: "The digital (DMA) controller of ADC2 does not work properly, so continuous sampling uses ADC1.",
        importance: "detail",
        source: T("39.3.1"),
      },
    ],
    registers: [
      {
        symbol: "SENS_SAR_MEAS1_CTRL2_REG",
        offset: "0x000C",
        fields: [
          { bits: "15:0", symbol: "SENS_MEAS1_DATA_SAR", does: "The ADC1 result." },
          { bits: "16", symbol: "SENS_MEAS1_DONE_SAR", does: "Conversion done." },
          { bits: "17", symbol: "SENS_MEAS1_START_SAR", does: "Start a conversion (software start)." },
          { bits: "30:19", symbol: "SENS_SAR1_EN_PAD", does: "Which pin to measure, as a bitmap." },
        ],
        source: T("39.7.2"),
      },
      {
        symbol: "SENS_SAR_ATTEN1_REG",
        offset: "0x0014",
        fields: [{ bits: "31:0", symbol: "SENS_SAR1_ATTEN", does: "2 bits of attenuation per ADC1 channel." }],
        source: T("39.7.2"),
      },
      {
        symbol: "APB_SARADC_CTRL_REG",
        offset: "0x0000",
        fields: [
          { bits: "0", symbol: "APB_SARADC_START_FORCE", does: "1: start conversions from software." },
          { bits: "14:7", symbol: "APB_SARADC_SAR_CLK_DIV", does: "ADC clock divider." },
          { bits: "18:15", symbol: "APB_SARADC_SAR1_PATT_LEN", does: "How many pattern-table entries to scan." },
        ],
        source: T("39.7.3"),
      },
      {
        symbol: "APB_SARADC_APB_ADC_ARB_CTRL_REG",
        offset: "0x0038",
        fields: [
          { bits: "11:10", symbol: "APB_SARADC_ADC_ARB_WIFI_PRIORITY", does: "Priority of the radio's use of ADC2." },
          { bits: "9:8", symbol: "APB_SARADC_ADC_ARB_RTC_PRIORITY", does: "Priority of your ADC2 reads." },
        ],
        source: T("39.7.3"),
      },
    ],
    usage: { tracks: ["sound"], pins: ["6"] },
    chapter: T("39.3"),
  },
  {
    id: "touch",
    family: "analog",
    name: "Touch sensor",
    short: "Fourteen pins that feel a finger through capacitance",
    icon: "blk-touch",
    depth: "full",
    spark: { value: 14, unit: "channels", max: MAX_CHANNELS },
    facts: [
      {
        id: "touch-pins",
        text: "14 touch channels, T1-T14 on GPIO1-14, plus an internal T0 that measures noise.",
        importance: "key",
        source: T("39.2.4"),
      },
      {
        id: "touch-hw",
        text: "A state machine scans the pins on its own; the hardware can decide 'touched' against a threshold, with filters.",
        importance: "key",
        source: T("39.2.3"),
      },
      {
        id: "touch-sleep",
        text: "Touch keeps working while the CPU sleeps and can wake it from deep sleep.",
        importance: "detail",
        source: T("39.2.3"),
      },
      {
        id: "touch-water",
        text: "Up to three pins can do proximity sensing; moisture tolerance and water rejection are built in.",
        importance: "detail",
        source: T("39.2.3"),
      },
      {
        id: "touch-cs",
        text: "It has not passed the Conducted Susceptibility test, so noisy supplies can fake touches.",
        importance: "gotcha",
        source: T("39.2.3"),
      },
    ],
    registers: [
      {
        symbol: "RTC_CNTL_TOUCH_CTRL2_REG",
        offset: "0x010C",
        fields: [
          { bits: "16", symbol: "RTC_CNTL_TOUCH_START_FORCE", does: "1: start scans from software, 0: from the timer." },
          { bits: "15", symbol: "RTC_CNTL_TOUCH_START_EN", does: "Start a scan (software start)." },
          { bits: "31", symbol: "RTC_CNTL_TOUCH_CLKGATE_EN", does: "Touch clock on." },
        ],
        source: T("39.7.1"),
      },
      {
        symbol: "SENS_SAR_TOUCH_CONF_REG",
        offset: "0x005C",
        fields: [
          { bits: "14:0", symbol: "SENS_TOUCH_OUTEN", does: "Which touch channels report." },
          { bits: "17:16", symbol: "SENS_TOUCH_DATA_SEL", does: "Read raw, benchmark or smoothed data." },
        ],
        source: T("39.7.2"),
      },
      {
        symbol: "SENS_SAR_TOUCH_THRESn_REG",
        offset: "0x0064 + 4·(n−1)",
        fields: [{ bits: "21:0", symbol: "SENS_TOUCH_OUT_THn", does: "Finger threshold for touch pin n." }],
        source: T("39.7.2"),
      },
      {
        symbol: "SENS_SAR_TOUCH_CHN_ST_REG",
        offset: "0x009C",
        fields: [
          { bits: "14:0", symbol: "SENS_TOUCH_PAD_ACTIVE", does: "Which pins are touched, one bit each." },
          { bits: "31", symbol: "SENS_TOUCH_MEAS_DONE", does: "Measurement done." },
        ],
        source: T("39.7.2"),
      },
      {
        symbol: "SENS_SAR_TOUCH_STATUSn_REG",
        offset: "0x00A4 + 4·(n−1)",
        fields: [{ bits: "21:0", symbol: "SENS_TOUCH_PADn_DATA", does: "The reading of touch pin n." }],
        source: T("39.7.2"),
      },
    ],
    usage: { lessons: ["B5", "B6", "B7"] },
    chapter: T("39.2"),
  },
  {
    id: "temp-sensor",
    family: "analog",
    name: "Temperature sensor",
    short: "Measures the die's own temperature",
    icon: "blk-temp-sensor",
    depth: "listed",
    facts: [
      {
        id: "temp-sensor-range",
        text: "Measures -40 to 125 °C inside the chip. It reads warmer than the room, more so under load.",
        importance: "key",
        source: T("39.0"),
      },
    ],
    usage: { lessons: ["B2", "B3", "B5"] },
    chapter: T("39.4"),
  },

  // -------------------------------------------------------------------------------------- radio
  {
    id: "wifi",
    family: "radio",
    name: "Wi-Fi",
    short: "2.4 GHz 802.11b/g/n, as a station, an access point or both",
    icon: "blk-wifi",
    depth: "full",
    spark: { value: 150, unit: "Mbps", max: MAX_MBPS },
    facts: [
      {
        id: "wifi-standard",
        text: "802.11b/g/n on 2.4 GHz (2412-2484 MHz), 20 or 40 MHz channels, up to 150 Mbps.",
        importance: "key",
        source: C("C6.1"),
      },
      {
        id: "wifi-modes",
        text: "Station, SoftAP, or both at once, with WPA2 and WPA3 security in hardware.",
        importance: "key",
        source: C("C4.3.2.2"),
      },
      {
        id: "wifi-power",
        text: "Up to +21 dBm out (802.11b). Sending draws up to 340 mA, so the supply must give at least 500 mA.",
        importance: "detail",
        source: C("C5.6.1"),
      },
      {
        id: "wifi-adc2",
        text: "While Wi-Fi is on, ADC2 (GPIO11-20) is not available for your readings.",
        importance: "gotcha",
        source: T("39.0"),
      },
      {
        id: "wifi-pll",
        text: "The radio only works while the CPU is clocked from the PLL.",
        importance: "gotcha",
        source: T("7.2.4.3"),
      },
    ],
    registers: [
      {
        symbol: "SYSTEM_SYSCLK_CONF_REG",
        offset: "0x0060",
        fields: [
          { bits: "11:10", symbol: "SYSTEM_SOC_CLK_SEL", does: "CPU clock source: 1 (PLL) is required for Wi-Fi." },
          { bits: "18:12", symbol: "SYSTEM_CLK_XTAL_FREQ", does: "The crystal frequency in MHz (40)." },
        ],
        source: T("17.5"),
      },
      {
        symbol: "APB_SARADC_APB_ADC_ARB_CTRL_REG",
        offset: "0x0038",
        fields: [
          { bits: "4", symbol: "APB_SARADC_ADC_ARB_WIFI_FORCE", does: "Hand ADC2 to the radio." },
          { bits: "11:10", symbol: "APB_SARADC_ADC_ARB_WIFI_PRIORITY", does: "The radio's priority on ADC2." },
        ],
        source: T("39.7.3"),
      },
      {
        symbol: "RTC_CNTL_RTC_WAKEUP_STATE_REG",
        offset: "0x003C",
        fields: [
          {
            bits: "31:15",
            symbol: "RTC_CNTL_RTC_WAKEUP_ENA",
            does: "Wake-up sources; the Wi-Fi bit (0x20) lets the radio wake the chip from light sleep.",
          },
        ],
        source: T("10.8"),
      },
    ],
    usage: { tracks: ["wifi"], lessons: ["R7", "R8", "S4"] },
    chapter: C("C4.3.2"),
  },
  {
    id: "ble",
    family: "radio",
    name: "Bluetooth LE",
    short: "Bluetooth 5 Low Energy: beacons, phones, keyboards, MIDI",
    icon: "blk-ble",
    depth: "full",
    spark: { value: 2, unit: "Mbps", max: MAX_MBPS },
    facts: [
      {
        id: "ble-version",
        text: "Bluetooth 5 LE and Bluetooth Mesh, at 125 kbps, 500 kbps, 1 Mbps or 2 Mbps.",
        importance: "key",
        source: C("C0.1"),
      },
      {
        id: "ble-range",
        text: "Up to 20 dBm out, and the coded PHY (125 kbps) hears down to -104.5 dBm for long range.",
        importance: "key",
        source: C("C0.1"),
      },
      {
        id: "ble-features",
        text: "Extended and multiple advertising sets, several connections as central and peripheral at once, link-layer encryption.",
        importance: "detail",
        source: C("C4.3.3.2"),
      },
      {
        id: "ble-antenna",
        text: "Wi-Fi and Bluetooth share one antenna; a built-in coexistence mechanism takes turns.",
        importance: "detail",
        source: C("C0.1"),
      },
    ],
    registers: [
      {
        symbol: "SYSTEM_BT_LPCK_DIV_FRAC_REG",
        offset: "0x002C",
        fields: [
          { bits: "28", symbol: "SYSTEM_LPCLK_RTC_EN", does: "Low-power clock for the radio on." },
          { bits: "27", symbol: "SYSTEM_LPCLK_SEL_XTAL32K", does: "Use the 32 kHz crystal as that clock." },
          { bits: "25", symbol: "SYSTEM_LPCLK_SEL_8M", does: "Use the divided RC_FAST_CLK (the default)." },
        ],
        source: T("17.5"),
      },
      {
        symbol: "SYSTEM_SYSCLK_CONF_REG",
        offset: "0x0060",
        fields: [
          { bits: "11:10", symbol: "SYSTEM_SOC_CLK_SEL", does: "CPU clock source: 1 (PLL) is required for Bluetooth." },
        ],
        source: T("17.5"),
      },
      {
        symbol: "RTC_CNTL_RTC_WAKEUP_STATE_REG",
        offset: "0x003C",
        fields: [
          {
            bits: "31:15",
            symbol: "RTC_CNTL_RTC_WAKEUP_ENA",
            does: "Wake-up sources; the BT bit (0x400) lets Bluetooth wake the chip from light sleep.",
          },
        ],
        source: T("10.8"),
      },
    ],
    usage: { tracks: ["ble"] },
    chapter: C("C4.3.3"),
  },
];

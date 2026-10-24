// A small reference in the real file's shape, for the tests (they never read docs-llm/).
export const FIXTURE = `# ESP32-S3 Complete Reference

## Contents

- [Part T](#part-t)

# Part C: ESP32-S3 Chip Datasheet

## C2 Pins

### C2.3 IO Pins

#### C2.3.5 Peripheral Pin Assignment

**Table 2-9. Peripheral Pin Assignment**

|Pin No.|Pin Name|ADC1|UART0|
|---|---|---|---|
|5|GPIO0|||
|6|GPIO1|ADC1_CH0 (P1)||
|7|GPIO2|ADC1_CH1 (P1)||
|8|GPIO43||U0TXD (P1)|
|9|VDDA|||

# Part T: Technical Reference Manual

## 26 UART Controller (UART)

### 26.1 Overview

Each UART controller runs from an 80 MHz clock. See [§26.2 Features](#262-features) and Section 26.4 for details.

### 26.2 Features

Each UART controller has the following features:

- Programmable baud rate up to 5 Mbps
- Stop bits of 1, 1.5, or 2 bits
  - Nested detail on GPIO43

Note that it is not recommended to only reset the APB clock domain module.

![Figure 26.3-1. UART Architecture Overview](images/trm-fig-26_3-1.png)

*Figure 26.3-1. UART Architecture Overview*

### 26.4 Functional Description

The divider is set by UART_SCLK_DIV_NUM in UART_CLKDIV_REG. For example: \`\`\`text
UART_SCLK_DIV_NUM = 1
\`\`\`

> **Note:** The RAM is shared.

##### Register 26.1. UART_CLKDIV_REG (0x0014)

| Bits | Field | Access | Reset | Description |
|---|---|---|---|---|
| 31:24 | (reserved) | | 0 | |
| 11:0 | UART_SCLK_DIV_NUM | R/W | 0x2b6 | The integral part of the divisor. |

**Register 26.2. UART_CONF0_REG** (offset \`0x0020\`)

| Bits | Field | Access | Reset | Description |
|---|---|---|---|---|
| 1:0 | UART_PARITY | R/W | 0 | Parity mode. |
`;

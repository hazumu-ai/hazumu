import os
import threading
import time
from typing import Optional

from gpiozero import LED
from mcp.server.fastmcp import FastMCP

LED_PIN = int(os.environ.get("LED_PIN", "21"))

# Listen設定（環境変数で変えられるように）
MCP_HOST = os.environ.get("MCP_HOST", "0.0.0.0")
MCP_PORT = int(os.environ.get("MCP_PORT", "8000"))

DEFAULT_DURATION_SEC = 2.0
DEFAULT_BLINK_COUNT = 5

mcp = FastMCP("robot-led", host=MCP_HOST, port=MCP_PORT)
_led = LED(LED_PIN)
_blink_thread: Optional[threading.Thread] = None
_stop_event = threading.Event()


def _start_blink(duration_sec: float, blink_count: int) -> None:
    global _blink_thread

    _stop_event.set()
    if _blink_thread and _blink_thread.is_alive():
        _blink_thread.join(timeout=0.5)

    _stop_event.clear()

    def _run() -> None:
        interval_sec = duration_sec / blink_count
        for _ in range(blink_count):
            if _stop_event.is_set():
                break
            _led.on()
            time.sleep(interval_sec / 2)
            _led.off()
            time.sleep(interval_sec / 2)
        _led.off()

    _blink_thread = threading.Thread(target=_run, daemon=True)
    _blink_thread.start()


@mcp.tool()
def blink(
    duration_sec: float = DEFAULT_DURATION_SEC,
    blink_count: int = DEFAULT_BLINK_COUNT,
) -> str:
    """LEDを指定時間内に指定回数だけ点滅させる。"""
    duration_sec = max(0.1, float(duration_sec))
    blink_count = max(1, int(blink_count))
    _start_blink(duration_sec, blink_count)
    return (
        f"Blinking LED on GPIO {LED_PIN} for {duration_sec:.2f}s ({blink_count} blinks)"
    )


@mcp.tool()
def stop() -> str:
    """点滅を停止してLEDを消灯する。"""
    _stop_event.set()
    _led.off()
    return "LED off"


if __name__ == "__main__":
    # HTTP(=Streamable HTTP)で起動
    mcp.run(transport="streamable-http")

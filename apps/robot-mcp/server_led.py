import os
import threading
import time
from typing import Optional

from gpiozero import LED
from mcp.server.fastmcp import FastMCP

LED_PIN = int(os.environ.get("LED_PIN", "17"))
DEFAULT_DURATION_SEC = 2.0
DEFAULT_INTERVAL_SEC = 0.2

mcp = FastMCP("robot-led")
_led = LED(LED_PIN)
_blink_thread: Optional[threading.Thread] = None
_stop_event = threading.Event()


def _start_blink(duration_sec: float, interval_sec: float) -> None:
    global _blink_thread

    _stop_event.set()
    if _blink_thread and _blink_thread.is_alive():
        _blink_thread.join(timeout=0.5)

    _stop_event.clear()

    def _run() -> None:
        end_at = time.monotonic() + duration_sec
        while time.monotonic() < end_at and not _stop_event.is_set():
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
    interval_sec: float = DEFAULT_INTERVAL_SEC,
) -> str:
    """LEDを指定時間だけ点滅させる。"""
    duration_sec = max(0.1, float(duration_sec))
    interval_sec = max(0.02, float(interval_sec))
    _start_blink(duration_sec, interval_sec)
    return f"Blinking LED on GPIO {LED_PIN} for {duration_sec:.2f}s (interval {interval_sec:.2f}s)"


@mcp.tool()
def stop() -> str:
    """点滅を停止してLEDを消灯する。"""
    _stop_event.set()
    _led.off()
    return "LED off"


if __name__ == "__main__":
    mcp.run()

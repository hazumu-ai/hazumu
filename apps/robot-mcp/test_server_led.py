import importlib
import itertools
import sys
from pathlib import Path
from types import SimpleNamespace


class FakeLED:
    def __init__(self, pin: int) -> None:
        self.pin = pin
        self.state = "off"
        self.on_calls = 0
        self.off_calls = 0

    def on(self) -> None:
        self.on_calls += 1
        self.state = "on"

    def off(self) -> None:
        self.off_calls += 1
        self.state = "off"


def _load_module(monkeypatch):
    fake_gpiozero = SimpleNamespace(LED=FakeLED)
    monkeypatch.setitem(sys.modules, "gpiozero", fake_gpiozero)
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    if "server_led" in sys.modules:
        del sys.modules["server_led"]
    return importlib.import_module("server_led")


def test_blink_blinks_and_turns_off(monkeypatch):
    module = _load_module(monkeypatch)
    counter = itertools.count()

    def fake_monotonic() -> float:
        return next(counter) * 0.05

    monkeypatch.setattr(module.time, "monotonic", fake_monotonic)
    monkeypatch.setattr(module.time, "sleep", lambda _: None)

    message = module.blink(0.1, 0.04)

    module._blink_thread.join(timeout=1)
    led = module._led

    assert "Blinking LED" in message
    assert led.on_calls > 0
    assert led.off_calls > 0
    assert led.state == "off"


def test_stop_turns_off_led(monkeypatch):
    module = _load_module(monkeypatch)
    led = module._led
    led.on()

    message = module.stop()

    assert message == "LED off"
    assert led.state == "off"

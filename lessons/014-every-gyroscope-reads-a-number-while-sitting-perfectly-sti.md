## 14. Every gyroscope reads a number while sitting perfectly still

**Enforced by:** JUDGEMENT

**Smell:** a raw sensor reading used as signal with no stated noise floor, bias estimate or still-state calibration — "it reads 0.3°/s at rest" treated as motion.

It is one to two degrees per second, it differs per device, per axis and with
temperature, and integrated it becomes unbounded drift. A complementary filter
that only corrects the ANGLE has to drag that back for ever, and the two halves
settle into a standoff at `residual = offset / (rate x (1 - alpha))` — which
looks exactly like "still converging" and never converges.

**The accelerometer residual is evidence about the RATE, not only the angle.**
A filter persistently below gravity has been integrating a rate that is too
low. Accumulating that recovers the offset in seconds. It is the I of a PI
complementary filter (Mahony) and it is four lines.

Two traps found in the process:
- **Do not gate the offset estimate on the gyro's own reading being small.**
 That is circular: a large enough offset stops the device ever looking still
 and locks the filter out of learning the thing making it look that way.
- **If the proportional gain changes, scale Ki with it.** A hard static
 correction collapses the residual, which is the only evidence the integrator
 has — measured, a fixed Ki reached 57% of a 3 deg/s offset after forty
 seconds, where a scaled one reached it in four.

*(fauxplane, 2026-08-02.)*

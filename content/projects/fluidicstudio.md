# FluidicStudio

- Original content ID: fluid
- Category: Hardware & embedded
- Status: Experimental tooling
- Technologies and topics: Python, PyQt6, Hardware control, Measurements

## Summary

A Python desktop application I built during my UDE microfluidics internship to bring pump control, flow sensors, microscope video and droplet analysis into one workspace.

## Story

**My contribution:** I built the PyQt6 desktop app and its serial command layer, integrating pump control, flow sensors, microscope video and droplet analysis. [Source: microdroplets-ui](https://github.com/jeremy341/microdroplets-ui)

I went into my internship at the University of Duisburg-Essen knowing very little about microfluidics. The equipment could control tiny amounts of liquid, measure flow and record droplets moving through channels. My job was to bring those different pieces into one usable desktop application.

That sounded like a software project. And technically, it was. But after working with the hardware, I realized that drawing a button labeled "Start pump" was the easy part.

The difficult part was understanding what happened *after* I clicked it.

Over four weeks I built what became my **FluidicStudio** app, published in a repository called Microdroplets UI. It's an independent university project, not the vendor's product, which also happens to be named *Bartels FluidicStudio*. An unfortunate naming coincidence, but a useful distinction.

### Learning the board

The setup used a [Bartels mp-Multiboard2](https://bartels-mikrotechnik.de/product/mp-multiboard2-en/), an mp-Highdriver4, liquid-flow sensors and a Dino-Lite microscope. Instead of offering a polished Python API for the whole setup, the board communicates through a USB serial port. You send short strings to its firmware and interpret what comes back.

Bartels already documents core commands in its [software manual](https://bartels-mikrotechnik.de/wp-content/uploads/2025/03/software-manual.pdf). So I wasn't discovering a secret protocol from scratch. What took work was reconciling those instructions with the firmware responses, connected drivers and sensors on the bench.

For example, several useful commands look almost suspiciously simple:

```text title=board-commands.txt
V        request firmware version
F0=100   set frequency for the first driver group
P1V120   set pump 1 amplitude to 120 Vpp
P1ON     enable pump 1
P1OFF    disable pump 1
POFF     request all pumps off
```

These are protocol examples, not an invitation to send them to unfamiliar hardware. The setup uses 115200 baud, 8N1 serial communication with CRLF line endings, and actual safe values depend on the connected device.

Simple commands, right? But a command is only half the conversation. I still had to work out which incoming lines were acknowledgments, which were sensor measurements, and which responses could be safely used to identify the firmware without unexpectedly changing a setting.

And once several parts of the app were sending commands, even knowing what `P1ON` means wasn't enough.

### One board, many controllers

The application eventually needed manual pump controls, waveforms, sensor plots, camera preview and a two-panel workspace. Those features can't behave like isolated scripts if they share the same hardware.

Suppose a waveform is running on one channel while the manual controls try to change that same pump. Which one is allowed to write the next command? If they both do, the UI can say one thing while the board receives another.

That led to a channel-ownership model: a channel belongs to either manual control or a waveform controller at a given moment. The backend also distinguishes settings that affect one pump from settings shared by a driver group.

I documented that work in the [board-communication notes](https://github.com/jeremy341/microdroplets-ui/blob/main/docs/BOARD_COMMUNICATION.md) and [pump-control research](https://github.com/jeremy341/microdroplets-ui/blob/main/docs/BARTELS_PUMP_CONTROL_RESEARCH.md), separating documented commands from behavior observed during integration.

I initially found the short command strings almost amusing. But coordinating them correctly turned out to matter much more than their length.

And then a code audit found a case where it mattered a lot.

### "Off" that turned "on"

Imagine the app is starting a pump. That's not necessarily one write to the board. A start sequence can set a frequency, select a waveform, set an amplitude and only then enable the pump.

Now imagine pressing Disconnect while that sequence is still in progress.

You'd expect the final global off request to win. After all, what's the point of a Disconnect button if an earlier command can turn the pump back on?

An executable regression scenario recorded the following sequence **before the fix**:

```text title=shutdown-trace.txt
0.001 s   F0=100
0.007 s   CS0=0
0.012 s   P1V120
0.613 s   POFF
0.618 s   P1ON    <- sent after the global off request
```

Look at the final two lines. `POFF` was sent at 0.613 seconds. Then, five milliseconds later, the pending start operation still sent `P1ON`.

The application could believe it had shut everything down while its own command stream was enabling a pump. And because pump state affects physical hardware, that's not just an irritating UI glitch.

The fix added a **teardown gate** to the serial manager. Once shutdown starts, it stops accepting new commands and coordinates the final off request with in-flight writes. A regression test checks that the late `P1ON` no longer gets through the simulated serial connection.

That doesn't prove every physical pump always stops safely. If the connection fails or an off command isn't acknowledged, the real hardware state can still be unknown. The software needs to report that uncertainty instead of pretending the act of closing a window is proof of a successful shutdown.

### Useful measurements

With control and shutdown better defined, the next challenge was making the different measurements agree.

A shared sensor backend feeds the live graphs and CSV logging so that values aren't interpreted differently in different pages. For example, raw liquid-flow readings have to be converted to microlitres per minute consistently; converting once in the data pipeline is far safer than letting every widget invent its own conversion.

The camera introduces another trade-off. A responsive live preview and recording every frame aren't the same task. If processing falls behind, a buffer can turn what looks like "live" video into a delayed view of the experiment.

Then there's droplet analysis itself. The application has to find a region of interest, estimate the background, detect objects, associate detections across frames, count crossings and decide which measurements are actually valid.

```flow
Microscope video
Region selection and background estimation
Droplet detection
Frame-to-frame tracking
Crossing detection and measurement validation
CSV and annotated video export
```

The diagram is a pipeline, not a guarantee of accuracy. A crossing can be counted even when blurry frames or a broken track make its length or velocity estimate unreliable. That's why it matters to distinguish detecting an event from validating a measurement.

### Four weeks, not an instrument

The internship ran from 3 to 28 August 2026. I came out of it with a substantial PyQt6 application, a documented serial-command layer and several connected workflows. But there are still limits I wouldn't want a reader to miss.

The valves page is unfinished. Driver identification isn't universally reliable, and parts of the analysis workflow depend on recorded video or proprietary Dino-Lite components. The repository contains tests and code audits, but **software tests are not a physical calibration certificate**. I don't have a published accuracy benchmark for the droplet measurements.

If I keep developing it, I'd like to make the physical measurements more reproducible and keep tightening the boundary between commands the UI requests and states the hardware has actually confirmed.

When I began, the obvious task seemed to be bringing several instruments into one interface. It took a disappearing connection, a few surprisingly short serial commands and one very badly ordered shutdown trace to teach me what that really involves.

A Disconnect button is easy to draw. Making it mean something trustworthy is the actual engineering problem.

## In numbers

- Internship: 3–28 August 2026, University of Duisburg-Essen
- Implementation: Python with PyQt6, serial communication, OpenCV and a sensor data hub
- Hardware: Bartels mp-Multiboard2, mp-Highdriver4, Sensirion SLF3S-1300F, Dino-Lite microscope
- Code snapshot: approximately 23,700 lines of Python plus 7,600 lines of tests
- Recorded tests: 386 functions in 50 files; not all independently rerun for this page
- Manufacturer serial protocol: 115200 baud, 8N1, CRLF terminators
- Camera modes documented in project: 1280×1024 at 10 or 20 FPS; 640×480 up to 30 FPS
- Pump software limits: 10–250 Vpp and 50–800 Hz for the Highdriver4, not measured performance
- Verified lab measurement accuracy: not established in the public record

## Links

- [Source repository: microdroplets-ui](https://github.com/jeremy341/microdroplets-ui)
- [Board communication notes](https://github.com/jeremy341/microdroplets-ui/blob/main/docs/BOARD_COMMUNICATION.md)
- [Pump control research](https://github.com/jeremy341/microdroplets-ui/blob/main/docs/BARTELS_PUMP_CONTROL_RESEARCH.md)
- [Bartels software manual](https://bartels-mikrotechnik.de/wp-content/uploads/2025/03/software-manual.pdf)

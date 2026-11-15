# FluidicStudio

- Original content ID: fluid
- Category: Hardware & embedded
- Status: Experimental tooling
- Technologies and topics: Python, PyQt6, Hardware control, Measurements

## Summary

A Python desktop application I built during my UDE microfluidics internship to bring pump control, flow sensors, microscope video and droplet analysis into one workspace.

## Story

When I started my internship at the University of Duisburg-Essen, I knew very little about microfluidics. Four weeks later I was building a desktop application that needed to communicate with pumps, read sensors, show a microscope camera, and analyse tiny droplets moving through channels.

Which is a slightly ambitious thing to attempt when you've only just learned what the equipment does.

The project eventually became my **FluidicStudio** app. The GitHub repository is called Microdroplets UI. It was developed independently for the university work; it is **not** Bartels' own commercial application, which is also called *Bartels FluidicStudio*.

The hardest part wasn't actually drawing the interface. It was figuring out how to talk to the hardware reliably.

### The board wasn't a normal software API

The setup used a [Bartels mp-Multiboard2](https://bartels-mikrotechnik.de/product/mp-multiboard2-en/) and an mp-Highdriver4, plus liquid-flow sensors and a Dino-Lite microscope. The board exposes a USB serial connection. That means you send short commands to the ESP32 firmware through a COM port rather than calling a polished Python library.

Bartels does publish a [software manual](https://bartels-mikrotechnik.de/wp-content/uploads/2025/03/software-manual.pdf) with the basic command protocol, so I wasn't discovering every instruction from scratch. But integrating the particular board, firmware responses, driver behavior and the rest of the bench still involved a lot of digging and testing. Not everything I needed was explained in one place.

Some of the commands are surprisingly compact:

\`\`\`text
V        request firmware version
F0=100   set frequency for the first driver group
P1V120   set pump 1 amplitude to 120 Vpp
P1ON     enable pump 1
P1OFF    disable pump 1
POFF     request all pumps off
\`\`\`

Those are **protocol examples**, not commands you should send to unfamiliar hardware without checking your setup. The firmware expects a serial connection at 115200 baud, 8N1, with command lines terminated by CRLF.

And even something as simple as "send \`P1ON\`" becomes complicated when another thread is reading replies, a sensor is streaming data, and the user might press Disconnect at any moment.

### Reverse engineering is also about the boring details

I spent a lot of time cross-checking the documented commands against what the board actually reported. Which replies were acknowledgments? Which lines were measurements? How did you identify the connected firmware without accidentally changing a pump setting? How did a shared driver frequency affect several channels?

The project now has dedicated [board-communication notes](https://github.com/jeremy341/microdroplets-ui/blob/main/docs/BOARD_COMMUNICATION.md) and a [pump-control research document](https://github.com/jeremy341/microdroplets-ui/blob/main/docs/BARTELS_PUMP_CONTROL_RESEARCH.md). They separate manufacturer-documented commands from behavior observed during integration.

I think that's one of the most useful parts of the work. It isn't a claim that I've published the world's only Bartels documentation; the manufacturer already provides a protocol table and code examples. It's that I had to turn those details into something an actual application could depend on.

For example, I eventually wanted the software to handle more than one board and prevent manual pump controls from fighting a running waveform. Each channel therefore needs an owner: either manual control or a waveform controller, but not both at once.

### A disconnect bug that made me take shutdown seriously

One of the code audits found a particularly nasty timing problem.

Imagine the app is starting a pump. Sending the configuration isn't one atomic command: it can set a frequency, a waveform, an amplitude and *then* turn the pump on. What happens if the user disconnects halfway through that sequence?

An executable regression scenario captured this order before the fix:

\`\`\`text
0.001 s   F0=100
0.007 s   CS0=0
0.012 s   P1V120
0.613 s   POFF
0.618 s   P1ON    <- this should never happen after shutdown
\`\`\`

The stop command had already been sent, but a pending start operation could still emit \`P1ON\` afterward. The application could believe shutdown had succeeded while the command stream told a different story.

The fix introduced a **teardown gate**: when shutdown starts, the serial manager stops accepting new commands, coordinates writes under a lock and prevents an in-flight start from completing after the final off request. A regression test checks that the late \`P1ON\` no longer reaches the simulated serial stream.

That is a software-side fix, not proof that every physical failure mode has been eliminated. If the cable disappears or an OFF command isn't acknowledged, the actual pump state can still be unknown. The safe response is to report uncertainty rather than pretend a button click guarantees the hardware stopped.

### The rest of the application had to agree on the data

Once the board connection worked, I could focus on the actual experiment workflow.

The PyQt6 interface has pump controls, waveform generation, sensor plots, camera preview and a two-panel workspace. Sensor data goes through a shared backend so the live chart and CSV logger read from the same interpreted measurements.

That "convert units once" rule sounds boring, but it's important. Otherwise one page can think a number is in raw sensor units while another assumes it's in microlitres per minute.

The microscope workflow has its own problems. Recording frames and displaying a responsive preview aren't identical jobs. If recording or processing falls behind, you need to decide what to buffer and what to drop, or the preview becomes a delayed picture of what happened several seconds ago.

The droplet analysis is another pipeline: define a region of interest, estimate the background, detect droplets, track them between frames, count line crossings, and export measurements. A counted crossing isn't necessarily a *valid* measurement; blurry frames or broken tracks can ruin the estimated length or velocity.

\`\`\`text
Microscope video
    -> select region and estimate background
    -> detect droplets
    -> track movement across frames
    -> count crossings
    -> validate measurements
    -> export CSV and annotated video
\`\`\`

### What four weeks didn't magically solve

The internship ran from 3 to 28 August 2026. That was enough to build an ambitious experimental application, not enough to turn it into certified laboratory instrumentation.

The repository has a lot of tests and audit notes. But **software tests are not physical calibration**. I don't have a published measurement-accuracy benchmark for droplet length or velocity, and the code's configurable pump limits aren't proof that those values were measured on the bench.

There are also unfinished areas. The valves page is incomplete, automatic driver identification isn't something I'd call universally reliable, and parts of the image analysis can only process recorded video rather than every possible camera input. Some behavior also relies on a proprietary Dino-Lite library that can't simply be included in the repository.

Still, I learned a lot more than how to build a PyQt interface. The interesting work was understanding a real device's protocol, coordinating several subsystems and realizing that a disconnect button is a hardware-state problem, not just a UI event.

For a four-week internship, that was quite a lot. And I'd happily do more work like this.

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

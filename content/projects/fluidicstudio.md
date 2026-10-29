# FluidicStudio

- Original content ID: fluid
- Category: Hardware & embedded
- Status: Experimental tooling
- Technologies and topics: Python, PyQt6, Hardware control, Measurements

## Summary

A desktop app that runs a microfluidics lab bench from one window: pumps, a flow sensor, a microscope camera and droplet analysis.

## Context and motivation

FluidicStudio grew out of my internship at the Chair of Electronic Components and Circuits (EBS) at the University of Duisburg-Essen, which ran from 3 to 28 August 2026. I worked on it alone, for Dr. Lin, on a control and image-analysis system for droplet-based microfluidics. The repository is called Microdroplets UI, and FluidicStudio is the name of the app inside it.

I came in knowing almost nothing about microfluidics, so the plan was ambitious for four weeks. The idea was to replace the [Bartels](https://www.bartels-mikrotechnik.de/) studio software and put the whole workflow in one place, from running the pumps to analysing the recordings, with support for the [Dino-Lite](https://dino-lite.eu/) microscope. That meant getting different hardware and software pieces to talk to each other. I built the interface that runs the bench and shows the results, helped run experiments, and wrote code that finds droplets in camera images and measures them. The internship certificate lists those tasks, and most of them ended up in this project. When I presented the results to the people at the chair, they loved it.

The hard part is what you're measuring. The interesting events are tiny droplets moving through channels a fraction of a millimetre wide. A single run means keeping the pumps going, watching a flow sensor, recording with a microscope and then reading the result off the video afterwards. Doing that across several programs and a spreadsheet is slow and easy to get wrong. That's why FluidicStudio tries to do all of it from one window and keep the data together.

## Inside the project

FluidicStudio is a desktop app written in Python with [PyQt6](https://riverbankcomputing.com/software/pyqt/). It drives the bench from one place: the pumps, a liquid-flow sensor, a microscope camera, and an offline analysis of the videos it recorded.

### The parts

- **Pumps and waveforms.** It drives [Bartels](https://www.bartels-mikrotechnik.de/) micropumps through a multi-channel driver board. All four channels share one driver frequency, but each has its own amplitude and on/off state. Every channel also has an owner, either manual control or a running waveform, so two things can never fight over the same pump. The waveforms are sine, triangle, sawtooth and square.
- **Sensors.** Readings from a [Sensirion](https://sensirion.com/) SLF3S-1300F liquid-flow sensor go through a protocol parser into one shared data hub. The live plots and a CSV logger both read from there. Units get converted once, where the data comes in, so nothing downstream has to guess what a number means.
- **Camera.** Preview and recording from a USB microscope run through [OpenCV](https://opencv.org/). Brightness, exposure and the LED go through the vendor's DNX64 library. Recording happens in its own worker. When it falls behind, it throws away old frames, so the delay between what the camera sees and what the screen shows stays bounded.
- **Droplet analytics.** This part came out of the image-analysis work at the internship. It runs over a recorded video in steps. First you pick a region of interest and estimate the background. Then it detects droplets in each frame, tracks them, stitches the tracks together and counts line crossings. Last, it takes measurements, calibrates them and exports a CSV with overlays on the video. The code keeps a counted event separate from a valid measurement, because a droplet can cross the line and still be too blurry to measure.
- **Workspace.** A two-panel view for quick work. It reads the same backend state as the full pages, so there's no second copy of the logic to keep in sync.

### How it is built

Each physical board gets its own service bundle, which handles the connection, channel ownership, pump control and wave execution. That way more than one board can be attached at the same time.

Shutdown needed the most care. A code audit found a real bug here. If the board disconnected at the wrong moment, a pump-on command could be written after the stop command, and the pump would keep running with nobody in control. The fix is a teardown gate that blocks new commands once shutdown has started. There's also a regression test, so the bug can't come back quietly.

## In numbers

- Code: about 23,700 lines of Python in the app, backend and interface, plus 7,600 lines of tests
- Tests: 386 test functions in 50 files; I haven't re-run them for this page, so I don't claim that all of them pass
- Documentation: 39 files, including two code audits (the first fixed 30 backend defects)
- Camera presets checked for the microscope: 1280 by 1024 pixels at 10 or 20 FPS, and 640 by 480 at up to 30 FPS
- Pump driver range set in the software: 10 to 250 Vpp at 50 to 800 Hz for the Highdriver4 board (a software limit, not a bench result)
- Benchmarks and measurement accuracy: none

## Where it stands

This is experimental laboratory software, and the repository says so too. There's no supported device list, no measurement accuracy figure, no validated experimental result and no claim of production readiness. Automatic driver detection is experimental, the valves page is a placeholder, and the analysis only works on recorded video, not on single still images.

Software tests and hardware validation are two different things. Most areas have a software test, but there's no recorded result from the bench. So the pump ranges in the code are limits I set in the software, not numbers I measured on the hardware.

If the serial connection drops, the software doesn't know what the pumps are doing. Their physical state stays unknown until someone checks them. The microscope vendor's DNX64 library is proprietary and isn't part of the repository. I also haven't published a screenshot of the application yet.

## Links

- [Source repository: microdroplets-ui](https://github.com/jeremy341/microdroplets-ui)
